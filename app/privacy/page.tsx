import LegalLayout from '@/app/legal/LegalLayout'

export const metadata = { title: 'Privacy Policy — Zolve HomeBase' }

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains how Zolve HomeBase collects, uses, and protects your information
        when you use the Service.
      </p>

      <h2>1. Information we collect</h2>
      <p>
        We collect the information you provide when you create an account or build your profile —
        such as your name, email, visa status, education, employment history, and any resume you
        upload. We also collect basic usage data (pages viewed, jobs saved) to improve the product.
      </p>

      <h2>2. How we use it</h2>
      <p>
        We use your information to operate HomeBase, personalize job recommendations, surface
        relevant sponsorship data, and — only if you opt in via the visibility setting — make your
        profile discoverable to employers.
      </p>

      <h2>3. Data sources</h2>
      <p>
        Sponsorship insights are derived from public U.S. government datasets (USCIS H-1B Employer
        Data Hub and DOL OFLC disclosures). Job postings are sourced from employers&rsquo; public
        career pages.
      </p>

      <h2>4. Sharing</h2>
      <p>
        We do not sell your personal information. We share data only with service providers that help
        us run HomeBase, and with employers solely when you have made your profile visible.
      </p>

      <h2 id="cookies">5. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and to remember preferences. We do not use
        cookies to sell your data to advertisers.
      </p>

      <h2>6. Your choices</h2>
      <p>
        You can edit or delete your profile information at any time from your profile page, and you
        control whether your profile is visible to employers.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about your privacy? Reach us at{' '}
        <a href="https://www.zolve.com/help" target="_blank" rel="noopener noreferrer" className="text-[#ff6633] hover:underline">
          zolve.com/help
        </a>
        .
      </p>
    </LegalLayout>
  )
}
