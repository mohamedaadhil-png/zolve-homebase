import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://homebase.zolve.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('job_postings')
    .select('id, slug, updated_at')
    .eq('is_active', true)

  const { data: companies } = await supabase
    .from('companies')
    .select('id, updated_at')

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const jobPages: MetadataRoute.Sitemap = (jobs ?? []).map(job => ({
    url: `${BASE_URL}/jobs/${job.id}${job.slug ? `-${job.slug}` : ''}`,
    lastModified: job.updated_at ? new Date(job.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const companyPages: MetadataRoute.Sitemap = (companies ?? []).map(company => ({
    url: `${BASE_URL}/companies/${company.id}`,
    lastModified: company.updated_at ? new Date(company.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...jobPages, ...companyPages]
}
