import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('resume') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const path = `${user.id}/${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadErr } = await supabase.storage
      .from('resumes')
      .upload(path, arrayBuffer, { contentType: file.type, upsert: true })

    if (uploadErr) throw uploadErr

    // Get signed URL for storage reference
    const { data: urlData } = await supabase.storage
      .from('resumes')
      .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

    // Extract text for parsing (best effort — PDFs may need server-side extraction)
    let resumeText = ''
    if (ext === 'txt') {
      resumeText = await file.text()
    } else {
      // For PDF/DOCX, pass the filename and ask Claude to work with what we have
      resumeText = `[Resume file: ${file.name}, size: ${(file.size / 1024).toFixed(0)}KB. Extract education and employment from context if text is available.]`
    }

    // Parse with Claude (haiku for speed/cost)
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: `You are a resume parser. Extract structured education and employment information from resumes.
Return ONLY valid JSON with this exact structure:
{
  "education": [
    { "level": "Bachelor's|Master's|PhD|Associate's|Other", "university": "string", "field_of_study": "string", "start_date": "YYYY-MM-DD or YYYY", "end_date": "YYYY-MM-DD or YYYY or null" }
  ],
  "employment": [
    { "company": "string", "designation": "string", "start_date": "YYYY-MM-DD or YYYY", "end_date": "YYYY-MM-DD or YYYY or null", "is_current": true|false }
  ]
}
If you cannot extract information, return empty arrays. Do not include markdown fences.`,
      messages: [
        {
          role: 'user',
          content: `Parse this resume:\n\n${resumeText}`,
        },
      ],
    })

    let parsed = { education: [], employment: [] }
    try {
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      parsed = JSON.parse(text)
    } catch {
      // If parsing fails, return empty — user fills manually
    }

    // Update resume_url in users table
    await supabase
      .from('users')
      .update({ resume_url: urlData?.signedUrl || path, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      resume_url: urlData?.signedUrl,
      parsed,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
