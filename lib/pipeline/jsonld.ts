/** Generate JobPosting schema.org JSON-LD for SEO */
export function generateJobPostingLD(
  job: {
    title: string
    description_html: string
    posted_at: string | null
    source_url: string
    source_job_id: string
    employment_type: string | null
    salary_min: number | null
    salary_max: number | null
    locations: Array<{ city?: string; state?: string; country?: string; is_remote?: boolean }>
  },
  company: {
    canonical_name: string
    domain: string | null
    logo_url: string | null
  }
): Record<string, unknown> {
  const validThrough = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const primaryLocation = job.locations?.[0]

  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description_html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '',
    datePosted: job.posted_at ?? new Date().toISOString(),
    validThrough,
    url: job.source_url,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Greenhouse',
      value: job.source_job_id,
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: company.canonical_name,
      ...(company.domain && { sameAs: `https://${company.domain}` }),
      ...(company.logo_url && { logo: company.logo_url }),
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'United States',
    },
  }

  if (primaryLocation) {
    if (primaryLocation.is_remote) {
      ld.jobLocationType = 'TELECOMMUTE'
    } else {
      ld.jobLocation = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: primaryLocation.city,
          addressRegion: primaryLocation.state,
          addressCountry: primaryLocation.country ?? 'US',
        },
      }
    }
  }

  const empType = job.employment_type?.toLowerCase()
  if (empType === 'full-time') ld.employmentType = 'FULL_TIME'
  else if (empType === 'part-time') ld.employmentType = 'PART_TIME'
  else if (empType === 'internship') ld.employmentType = 'INTERN'
  else if (empType === 'contract') ld.employmentType = 'CONTRACTOR'

  if (job.salary_min || job.salary_max) {
    ld.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        ...(job.salary_min && { minValue: job.salary_min }),
        ...(job.salary_max && { maxValue: job.salary_max }),
        unitText: 'YEAR',
      },
    }
  }

  return ld
}
