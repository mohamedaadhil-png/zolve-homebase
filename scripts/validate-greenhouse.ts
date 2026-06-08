/**
 * Validate that all seed company Greenhouse board tokens are live.
 * Run: npm run validate:greenhouse
 */
const SEED_TOKENS = [
  { name: 'Databricks', token: 'databricks' },
  { name: 'Stripe', token: 'stripe' },
  { name: 'MongoDB', token: 'mongodb' },
  { name: 'Datadog', token: 'datadog' },
  { name: 'Anthropic', token: 'anthropic' },
  { name: 'Samsara', token: 'samsara' },
  { name: 'Zscaler', token: 'zscaler' },
  { name: 'Verkada', token: 'verkada' },
  { name: 'Airbnb', token: 'airbnb' },
  { name: 'Roblox', token: 'roblox' },
  { name: 'Brex', token: 'brex' },
  { name: 'Pinterest', token: 'pinterest' },
  { name: 'Cloudflare', token: 'cloudflare' },
  { name: 'Affirm', token: 'affirm' },
  { name: 'Reddit', token: 'reddit' },
  { name: 'GitLab', token: 'gitlab' },
  { name: 'Robinhood', token: 'robinhood' },
  { name: 'Twilio', token: 'twilio' },
  { name: 'Asana', token: 'asana' },
  { name: 'Instacart', token: 'instacart' },
  { name: 'SoFi', token: 'sofi' },
  { name: 'Lyft', token: 'lyft' },
  { name: 'Nuro', token: 'nuro' },
  { name: 'Flexport', token: 'flexport' },
  { name: 'Gusto', token: 'gusto' },
  { name: 'Discord', token: 'discord' },
  { name: 'Chime', token: 'chime' },
  { name: 'Dropbox', token: 'dropbox' },
  { name: 'DoorDash', token: 'doordashUSA' },
  { name: 'Figma', token: 'figma' },
  { name: 'Airtable', token: 'airtable' },
]

async function validate() {
  console.log('🔍 Validating Greenhouse board tokens...\n')
  let pass = 0
  let fail = 0

  for (const { name, token } of SEED_TOKENS) {
    const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`
    try {
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        const count = data.jobs?.length ?? 0
        console.log(`  ✓ ${name.padEnd(18)} token=${token.padEnd(12)} jobs=${count}`)
        pass++
      } else {
        console.log(`  ✗ ${name.padEnd(18)} token=${token.padEnd(12)} HTTP ${res.status}`)
        fail++
      }
    } catch (err) {
      console.log(`  ✗ ${name.padEnd(18)} token=${token.padEnd(12)} ERROR: ${err}`)
      fail++
    }
    await new Promise((r) => setTimeout(r, 300))
  }

  console.log(`\n${pass} passed, ${fail} failed`)
}

validate().catch(console.error)
