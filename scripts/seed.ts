/**
 * Seed script: inserts seed companies and placeholder data into Supabase.
 * Run: npm run seed
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_COMPANIES = [
  { name_raw: 'Databricks', canonical_name: 'Databricks', ats_board_token: 'databricks', domain: 'databricks.com', industry: 'Data & AI', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Stripe', canonical_name: 'Stripe', ats_board_token: 'stripe', domain: 'stripe.com', industry: 'Fintech', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'MongoDB', canonical_name: 'MongoDB', ats_board_token: 'mongodb', domain: 'mongodb.com', industry: 'Database/Cloud', company_size: 'Large', headquarters: 'New York, NY' },
  { name_raw: 'Datadog', canonical_name: 'Datadog', ats_board_token: 'datadog', domain: 'datadoghq.com', industry: 'DevOps/Monitoring', company_size: 'Large', headquarters: 'New York, NY' },
  { name_raw: 'Anthropic', canonical_name: 'Anthropic', ats_board_token: 'anthropic', domain: 'anthropic.com', industry: 'AI Research', company_size: 'Medium', headquarters: 'San Francisco, CA' },
  { name_raw: 'Samsara', canonical_name: 'Samsara', ats_board_token: 'samsara', domain: 'samsara.com', industry: 'IoT/Fleet Tech', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Zscaler', canonical_name: 'Zscaler', ats_board_token: 'zscaler', domain: 'zscaler.com', industry: 'Cybersecurity', company_size: 'Large', headquarters: 'San Jose, CA' },
  { name_raw: 'Verkada', canonical_name: 'Verkada', ats_board_token: 'verkada', domain: 'verkada.com', industry: 'Security Tech', company_size: 'Medium', headquarters: 'San Mateo, CA' },
  { name_raw: 'Airbnb', canonical_name: 'Airbnb', ats_board_token: 'airbnb', domain: 'airbnb.com', industry: 'Travel/Marketplace', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Roblox', canonical_name: 'Roblox', ats_board_token: 'roblox', domain: 'roblox.com', industry: 'Gaming/Metaverse', company_size: 'Large', headquarters: 'San Mateo, CA' },
  { name_raw: 'Brex', canonical_name: 'Brex', ats_board_token: 'brex', domain: 'brex.com', industry: 'Fintech', company_size: 'Medium', headquarters: 'San Francisco, CA' },
  { name_raw: 'Pinterest', canonical_name: 'Pinterest', ats_board_token: 'pinterest', domain: 'pinterest.com', industry: 'Social Media', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Cloudflare', canonical_name: 'Cloudflare', ats_board_token: 'cloudflare', domain: 'cloudflare.com', industry: 'Infrastructure/Security', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Affirm', canonical_name: 'Affirm', ats_board_token: 'affirm', domain: 'affirm.com', industry: 'Fintech/BNPL', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Reddit', canonical_name: 'Reddit', ats_board_token: 'reddit', domain: 'reddit.com', industry: 'Social Media', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'GitLab', canonical_name: 'GitLab', ats_board_token: 'gitlab', domain: 'gitlab.com', industry: 'DevOps/Software Dev', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Robinhood', canonical_name: 'Robinhood', ats_board_token: 'robinhood', domain: 'robinhood.com', industry: 'Fintech', company_size: 'Large', headquarters: 'Menlo Park, CA' },
  { name_raw: 'Twilio', canonical_name: 'Twilio', ats_board_token: 'twilio', domain: 'twilio.com', industry: 'Communications API', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Asana', canonical_name: 'Asana', ats_board_token: 'asana', domain: 'asana.com', industry: 'Productivity/SaaS', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Instacart', canonical_name: 'Instacart', ats_board_token: 'instacart', domain: 'instacart.com', industry: 'Grocery/Delivery', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'SoFi', canonical_name: 'SoFi', ats_board_token: 'sofi', domain: 'sofi.com', industry: 'Fintech', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Lyft', canonical_name: 'Lyft', ats_board_token: 'lyft', domain: 'lyft.com', industry: 'Ridesharing', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Nuro', canonical_name: 'Nuro', ats_board_token: 'nuro', domain: 'nuro.ai', industry: 'Autonomous Vehicles', company_size: 'Medium', headquarters: 'Mountain View, CA' },
  { name_raw: 'Flexport', canonical_name: 'Flexport', ats_board_token: 'flexport', domain: 'flexport.com', industry: 'Logistics/Supply Chain', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Gusto', canonical_name: 'Gusto', ats_board_token: 'gusto', domain: 'gusto.com', industry: 'HR/Payroll SaaS', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Discord', canonical_name: 'Discord', ats_board_token: 'discord', domain: 'discord.com', industry: 'Communication/Gaming', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Chime', canonical_name: 'Chime', ats_board_token: 'chime', domain: 'chime.com', industry: 'Neobank/Fintech', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Dropbox', canonical_name: 'Dropbox', ats_board_token: 'dropbox', domain: 'dropbox.com', industry: 'Cloud Storage/SaaS', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'DoorDash', canonical_name: 'DoorDash', ats_board_token: 'doordashUSA', domain: 'doordash.com', industry: 'Food Delivery', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Figma', canonical_name: 'Figma', ats_board_token: 'figma', domain: 'figma.com', industry: 'Design Tools/SaaS', company_size: 'Large', headquarters: 'San Francisco, CA' },
  { name_raw: 'Airtable', canonical_name: 'Airtable', ats_board_token: 'airtable', domain: 'airtable.com', industry: 'No-code/Collaboration', company_size: 'Medium', headquarters: 'San Francisco, CA' },
]

async function seed() {
  console.log('🌱 Seeding companies...')

  for (const company of SEED_COMPANIES) {
    const normalized = company.canonical_name.toLowerCase().trim()
    const { error } = await supabase.from('companies').upsert(
      {
        ...company,
        normalized_name: normalized,
        ats_provider: 'greenhouse',
        sponsor_flag: true,
        logo_url: `https://logo.clearbit.com/${company.domain}`,
      },
      { onConflict: 'ats_board_token' }
    )
    if (error) console.error(`  ✗ ${company.canonical_name}: ${error.message}`)
    else console.log(`  ✓ ${company.canonical_name}`)
  }

  console.log('\n✅ Seed complete.')
}

seed().catch(console.error)
