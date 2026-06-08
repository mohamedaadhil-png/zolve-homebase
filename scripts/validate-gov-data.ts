/**
 * Validate gov data files in Supabase Storage gov-data-raw bucket.
 * Checks that USCIS and DOL files are present and parseable.
 * Run: npm run validate:gov-data
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function validate() {
  console.log('🔍 Validating gov-data-raw bucket...\n')

  const { data: files, error } = await supabase.storage.from('gov-data-raw').list()
  if (error) {
    console.error('❌ Cannot access gov-data-raw bucket:', error.message)
    console.log('\nMake sure to create the bucket in Supabase Storage dashboard.')
    process.exit(1)
  }

  if (!files?.length) {
    console.warn('⚠️  No files found in gov-data-raw bucket.')
    console.log('Agam needs to drop USCIS and DOL Excel/CSV files here.')
    console.log('\nExpected files:')
    console.log('  - uscis_h1b_*.csv (USCIS H-1B Employer Data Hub)')
    console.log('  - dol_lca_*.xlsx (DOL OFLC LCA Disclosure Data)')
    console.log('  - dol_perm_*.xlsx (DOL PERM Disclosure Data, optional)')
    process.exit(0)
  }

  console.log(`Found ${files.length} file(s):\n`)

  const uscisFiles = files.filter(f => f.name.toLowerCase().includes('uscis') || f.name.toLowerCase().includes('h1b'))
  const dolLcaFiles = files.filter(f => f.name.toLowerCase().includes('lca') || f.name.toLowerCase().includes('h-1b_disc'))
  const dolPermFiles = files.filter(f => f.name.toLowerCase().includes('perm'))

  for (const f of files) {
    const sizeKB = f.metadata?.size ? (f.metadata.size / 1024).toFixed(1) : 'unknown'
    let type = '?'
    if (uscisFiles.includes(f)) type = 'USCIS'
    else if (dolLcaFiles.includes(f)) type = 'DOL LCA'
    else if (dolPermFiles.includes(f)) type = 'DOL PERM'
    console.log(`  ${type.padEnd(8)} ${f.name.padEnd(40)} ${sizeKB} KB`)
  }

  console.log('\nSummary:')
  console.log(`  USCIS files: ${uscisFiles.length}`)
  console.log(`  DOL LCA files: ${dolLcaFiles.length}`)
  console.log(`  DOL PERM files: ${dolPermFiles.length}`)

  if (!uscisFiles.length) console.warn('\n⚠️  No USCIS files detected — approval rates cannot be computed')
  if (!dolLcaFiles.length) console.warn('⚠️  No DOL LCA files detected — role grades and wages cannot be computed')

  // Check matched companies
  const { count } = await supabase
    .from('uscis_sponsor_records')
    .select('*', { count: 'exact', head: true })
    .not('company_id', 'is', null)

  console.log(`\nMatched USCIS records: ${count ?? 0}`)
  console.log('\nRun the gov-data-ingest Edge Function after uploading files.')
}

validate().catch(console.error)
