/**
 * Location parsing + country detection for job postings.
 * Scope is currently US-only, so the key output is `isUS`. A location is US
 * when any of its segments resolves to the US; clearly-foreign locations are
 * flagged non-US; anything with no country/region signal is `ambiguous`.
 */

const US_STATE_ABBR = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA',
  'ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK',
  'OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
])

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
  pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
  'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
}
const US_STATE_NAMES = Object.keys(STATE_NAME_TO_ABBR)

/** 2-letter code → Title Case state name (for UI labels). */
export const US_STATE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAME_TO_ABBR).map(([name, abbr]) => [
    abbr,
    name.replace(/\b\w/g, (c) => c.toUpperCase()),
  ])
)

// Major US cities → state, so bare-city locations still resolve to a state.
const CITY_TO_STATE: Record<string, string> = {
  'san francisco': 'CA', 'san jose': 'CA', 'palo alto': 'CA', 'sunnyvale': 'CA', 'mountain view': 'CA',
  'san mateo': 'CA', 'redwood city': 'CA', 'menlo park': 'CA', 'santa clara': 'CA', 'los angeles': 'CA',
  'san diego': 'CA', 'culver city': 'CA', 'santa monica': 'CA', 'irvine': 'CA', 'bay area': 'CA',
  'new york': 'NY', nyc: 'NY', seattle: 'WA', bellevue: 'WA', boston: 'MA', cambridge: 'MA',
  austin: 'TX', dallas: 'TX', houston: 'TX', plano: 'TX', chicago: 'IL', denver: 'CO', atlanta: 'GA',
  miami: 'FL', philadelphia: 'PA', phoenix: 'AZ', tempe: 'AZ', portland: 'OR', nashville: 'TN',
  raleigh: 'NC', durham: 'NC', charlotte: 'NC', 'salt lake city': 'UT', minneapolis: 'MN',
  detroit: 'MI', pittsburgh: 'PA', columbus: 'OH', reston: 'VA', herndon: 'VA', arlington: 'VA',
  'pleasant prairie': 'WI',
}

const US_CITIES = [
  'san francisco','new york','seattle','mountain view','san jose','boston','austin','chicago',
  'los angeles','denver','atlanta','palo alto','sunnyvale','bellevue','san mateo','redwood city',
  'menlo park','santa clara','bay area','san diego','dallas','houston','miami','philadelphia',
  'phoenix','portland','nashville','raleigh','durham','salt lake city','minneapolis','detroit',
  'pittsburgh','columbus','charlotte','irvine','culver city','santa monica','cambridge','arlington',
  'nyc','pleasant prairie','tempe','plano','reston','herndon','remote in the us','remote (u.s',
]

// Foreign country / city signals (keyword → country label).
const NON_US: Array<[string, string]> = [
  ['united kingdom','UK'],['england','UK'],['london','UK'],['scotland','UK'],['ireland','Ireland'],
  ['dublin','Ireland'],['canada','Canada'],['toronto','Canada'],['vancouver','Canada'],
  ['montreal','Canada'],['ontario','Canada'],['india','India'],['bengaluru','India'],
  ['bangalore','India'],['gurugram','India'],['gurgaon','India'],['hyderabad','India'],
  ['mumbai','India'],['new delhi','India'],['pune','India'],['chennai','India'],['noida','India'],
  ['singapore','Singapore'],['japan','Japan'],['tokyo','Japan'],['france','France'],
  ['paris','France'],['germany','Germany'],['berlin','Germany'],['munich','Germany'],
  ['netherlands','Netherlands'],['amsterdam','Netherlands'],['australia','Australia'],
  ['sydney','Australia'],['melbourne','Australia'],['spain','Spain'],['madrid','Spain'],
  ['barcelona','Spain'],['italy','Italy'],['brazil','Brazil'],['sao paulo','Brazil'],
  ['mexico','Mexico'],['poland','Poland'],['warsaw','Poland'],['krakow','Poland'],
  ['romania','Romania'],['bucharest','Romania'],['israel','Israel'],['tel aviv','Israel'],
  ['china','China'],['hong kong','Hong Kong'],['taiwan','Taiwan'],['taipei','Taiwan'],
  ['korea','South Korea'],['seoul','South Korea'],['philippines','Philippines'],['manila','Philippines'],
  ['indonesia','Indonesia'],['jakarta','Indonesia'],['sweden','Sweden'],['stockholm','Sweden'],
  ['switzerland','Switzerland'],['zurich','Switzerland'],['zürich','Switzerland'],['geneva','Switzerland'],
  ['portugal','Portugal'],['lisbon','Portugal'],['vietnam','Vietnam'],['thailand','Thailand'],
  ['bangkok','Thailand'],['malaysia','Malaysia'],['kuala lumpur','Malaysia'],['pakistan','Pakistan'],
  ['dubai','UAE'],['united arab emirates','UAE'],['nigeria','Nigeria'],['kenya','Kenya'],
  ['south africa','South Africa'],['new zealand','New Zealand'],['argentina','Argentina'],
  ['colombia','Colombia'],['chile','Chile'],['denmark','Denmark'],['norway','Norway'],
  ['finland','Finland'],['austria','Austria'],['belgium','Belgium'],['czech','Czech Republic'],
  ['hungary','Hungary'],['ukraine','Ukraine'],['serbia','Serbia'],['belgrade','Serbia'],
  ['slovenia','Slovenia'],['ljubljana','Slovenia'],['cork','Ireland'],['frankfurt','Germany'],
  ['mohali','India'],['noida','India'],['emea','EMEA'],['apac','APAC'],['calgary','Canada'],
  ['saudi','Saudi Arabia'],['riyadh','Saudi Arabia'],['são paulo','Brazil'],['iceland','Iceland'],
  ['reykjavik','Iceland'],['reykjavík','Iceland'],['costa rica','Costa Rica'],['escazu','Costa Rica'],
  ['luxembourg','Luxembourg'],['cambodia','Cambodia'],['phnom penh','Cambodia'],['beijing','China'],
  ['shanghai','China'],['shenzhen','China'],['bogota','Colombia'],['bogotá','Colombia'],
]

// Bare country codes / regex signals that aren't plain substrings.
const NON_US_RE: Array<[RegExp, string]> = [
  [/\b(u\.?k\.?|gb)\b/i, 'UK'],
  [/,\s*ind\b/i, 'India'],
  [/,\s*(de|fr|jp|sg|au|nl|ie|ch|br|mx|es|it|se|pl|ro|il|kr|ph|id|pt|dk|no|fi|be|cz|hu|ua|nz|za|ng|ke|cl|co|ar|hk|tw|cn|th|vn|my|pk|ae)\b/i, 'Non-US'],
]

function explicitUS(seg: string): boolean {
  const lower = seg.toLowerCase()
  if (/\bunited states\b|\bu\.?\s?s\.?a?\b|u\.s\./.test(lower)) return true
  if (/\bremote\s*[-,(]?\s*u\.?s/.test(lower) || /\bus\s*[-,]?\s*remote\b/.test(lower)) return true
  if (/(^|[,-])\s*us\s*($|,|;)/.test(lower) || /\bus$/.test(lower)) return true
  if (US_STATE_NAMES.some((s) => lower.includes(s))) return true
  if (US_CITIES.some((c) => lower.includes(c))) return true
  return false
}

function hasUSStateCode(seg: string): boolean {
  // Any 2-letter UPPERCASE token that is a US state (e.g. "Remote - CA", "Austin, TX").
  const tokens = seg.match(/\b[A-Z]{2}\b/g)
  return !!tokens && tokens.some((t) => US_STATE_ABBR.has(t))
}

function segmentCountry(seg: string): string | null {
  const lower = seg.toLowerCase()
  for (const [kw, country] of NON_US) if (lower.includes(kw)) return country
  for (const [re, country] of NON_US_RE) if (re.test(seg)) return country
  return null
}

/** Best-effort US state code from a single (US) location segment. */
function normalizeState(seg: string): string | null {
  const tokens = seg.match(/\b[A-Z]{2}\b/g)
  if (tokens) {
    const hit = tokens.find((t) => US_STATE_ABBR.has(t))
    if (hit) return hit
  }
  const lower = seg.toLowerCase()
  for (const name of US_STATE_NAMES) if (lower.includes(name)) return STATE_NAME_TO_ABBR[name]
  for (const [city, st] of Object.entries(CITY_TO_STATE)) if (lower.includes(city)) return st
  return null
}

/** Resolve one location segment to 'us', a foreign country, or null (unknown). */
function classifySegment(seg: string): 'us' | string | null {
  if (explicitUS(seg)) return 'us'
  const foreign = segmentCountry(seg) // foreign city/code wins over a bare state code (e.g. "Toronto, CA")
  if (foreign) return foreign
  if (hasUSStateCode(seg)) return 'us'
  return null
}

export interface JobLocation {
  raw: string
  city: string | null
  state: string | null
  country: string | null
  is_remote: boolean
  isUS: boolean
  ambiguous: boolean
}

export function parseJobLocation(raw0: string): JobLocation {
  const raw = (raw0 || '').trim()
  const lower = raw.toLowerCase()
  const is_remote = /\bremote|distributed|work from home|anywhere\b/.test(lower)
  const segments = raw.split(/[|•;\n]|(?:\s+•\s+)/).map((s) => s.trim()).filter(Boolean)

  let isUS = false
  let foreign: string | null = null
  let usSeg: string | null = null
  for (const seg of segments.length ? segments : [raw]) {
    const r = classifySegment(seg)
    if (r === 'us') {
      isUS = true
      if (!usSeg) usSeg = seg
    } else if (r && !foreign) {
      foreign = r
    }
  }

  // Structured fields from the first US segment (or the first segment otherwise).
  const baseSeg = usSeg ?? segments[0] ?? raw
  const first = baseSeg.split(',').map((s) => s.trim())
  const city = first[0] && !/^remote/i.test(first[0]) ? first[0] : null
  const state = isUS ? normalizeState(baseSeg) : null

  const ambiguous = !isUS && !foreign
  return {
    raw,
    city,
    state,
    country: isUS ? 'US' : foreign,
    is_remote,
    isUS,
    ambiguous,
  }
}
