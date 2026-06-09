import LegalLayout from '@/app/legal/LegalLayout'

export const metadata = { title: 'Terms of Service — Zolve HomeBase' }

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>
        Welcome to Zolve HomeBase. By accessing or using HomeBase (the &ldquo;Service&rdquo;), you
        agree to these Terms of Service. Please read them carefully.
      </p>

      <h2>1. The Service</h2>
      <p>
        Zolve HomeBase aggregates publicly available job postings and government-sourced H-1B
        sponsorship data to help international tech professionals discover visa-friendly employers.
        Sponsorship data is provided for informational purposes only and does not constitute legal
        or immigration advice.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for the information you provide and for activity under your account. You
        agree to provide accurate information and to keep your credentials secure.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        You agree not to scrape, resell, or misuse the Service or its data, and not to use it for any
        unlawful purpose. Job listings link out to the employer&rsquo;s own application page; we are
        not responsible for third-party application processes or hiring decisions.
      </p>

      <h2>4. No employment guarantee</h2>
      <p>
        HomeBase does not guarantee employment, visa sponsorship, or any particular outcome. Sponsor
        scores and historical data are estimates based on public records and may not reflect a
        company&rsquo;s current policies.
      </p>

      <h2>5. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the Service after changes take
        effect constitutes acceptance of the revised terms.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about these terms? Reach us at{' '}
        <a href="https://www.zolve.com/help" target="_blank" rel="noopener noreferrer" className="text-[#ff6633] hover:underline">
          zolve.com/help
        </a>
        .
      </p>
    </LegalLayout>
  )
}
