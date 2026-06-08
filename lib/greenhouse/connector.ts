/**
 * Greenhouse Job Board API connector.
 * Public API — no key required for job listings.
 */

export interface GreenhouseJob {
  id: number
  title: string
  updated_at: string
  location: { name: string }
  absolute_url: string
  content?: string
  departments: Array<{ id: number; name: string }>
  offices: Array<{ id: number; name: string; location: string }>
  metadata?: Array<{ id: number; name: string; value: string | null; value_type: string }>
}

export interface GreenhouseBoardResponse {
  jobs: GreenhouseJob[]
  meta: { total: number }
}

const GREENHOUSE_BASE = 'https://boards-api.greenhouse.io/v1/boards'

async function fetchWithRetry(url: string, retries = 3, backoffMs = 1000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 0 },
      })
      if (res.ok) return res
      if (res.status === 429 && attempt < retries) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10)
        await sleep(retryAfter * 1000)
        continue
      }
      if (res.status >= 500 && attempt < retries) {
        await sleep(backoffMs * 2 ** attempt)
        continue
      }
      throw new Error(`HTTP ${res.status} for ${url}`)
    } catch (err) {
      if (attempt === retries) throw err
      await sleep(backoffMs * 2 ** attempt)
    }
  }
  throw new Error(`Failed after ${retries} retries: ${url}`)
}

export async function fetchBoardJobs(boardToken: string): Promise<GreenhouseJob[]> {
  const url = `${GREENHOUSE_BASE}/${boardToken}/jobs?content=true`
  const res = await fetchWithRetry(url)
  const data: GreenhouseBoardResponse = await res.json()
  return data.jobs || []
}

export async function fetchJob(boardToken: string, jobId: number): Promise<GreenhouseJob | null> {
  try {
    const url = `${GREENHOUSE_BASE}/${boardToken}/jobs/${jobId}?content=true`
    const res = await fetchWithRetry(url)
    return res.json()
  } catch {
    return null
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
