export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-on-surface font-body-md">
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[800px] mx-auto px-xl">
          <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Legal</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">Privacy Policy</h1>
          <p className="text-on-surface-variant">Last updated: 10 May 2026 · Effective date: 1 January 2026</p>
        </div>
      </section>

      <section className="py-xxl">
        <div className="max-w-[800px] mx-auto px-xl prose prose-neutral">
          <div className="space-y-xxl text-body-md text-on-surface leading-relaxed">

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">1. Introduction</h2>
              <p>Onea Africa (Pty) Ltd ("Onea Africa", "we", "us" or "our"), Registration No. 2016/461132/07, is committed to protecting your personal information in accordance with the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong> and other applicable South African legislation.</p>
              <p className="mt-md">This Privacy Policy explains how we collect, use, store and disclose your personal information when you visit <strong>www.onea.africa</strong>, use our services, or interact with us.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">2. Information We Collect</h2>
              <ul className="list-disc pl-xl space-y-sm">
                <li><strong>Contact details:</strong> name, email address, phone number, company name.</li>
                <li><strong>Usage data:</strong> IP address, browser type, pages visited, time on site (via analytics tools).</li>
                <li><strong>Communication data:</strong> messages or enquiries you send us.</li>
                <li><strong>Newsletter subscriptions:</strong> email address if you opt in.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">3. How We Use Your Information</h2>
              <ul className="list-disc pl-xl space-y-sm">
                <li>To respond to your enquiries and provide requested services.</li>
                <li>To send you newsletters or marketing communications (only with your consent).</li>
                <li>To improve our website and services through analytics.</li>
                <li>To comply with legal and regulatory obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">4. Legal Basis for Processing</h2>
              <p>We process your personal information on the following grounds:</p>
              <ul className="list-disc pl-xl space-y-sm mt-md">
                <li><strong>Consent</strong> — for marketing communications and cookies.</li>
                <li><strong>Legitimate interest</strong> — to respond to enquiries and improve our services.</li>
                <li><strong>Legal obligation</strong> — where required by South African law.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">5. Data Sharing</h2>
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-xl space-y-sm mt-md">
                <li><strong>Service providers</strong> who assist in operating our website and services (e.g., hosting, email).</li>
                <li><strong>Regulatory authorities</strong> where required by law.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">6. Data Retention</h2>
              <p>We retain your personal information only as long as necessary for the purposes described, or as required by law. Enquiry records are retained for 5 years; newsletter subscriber records until unsubscription.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">7. Your Rights Under POPIA</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-xl space-y-sm mt-md">
                <li>Request access to your personal information we hold.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your data (subject to legal obligations).</li>
                <li>Object to or restrict processing in certain circumstances.</li>
                <li>Lodge a complaint with the <strong>Information Regulator</strong> at <a href="https://inforegulator.org.za" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">8. Cookies</h2>
              <p>We use cookies and similar technologies to analyse site usage and personalise content. You can control cookies through your browser settings or through the cookie consent banner on our website.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">9. Security</h2>
              <p>We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">10. Contact Our Information Officer</h2>
              <div className="bg-soft-surface rounded-lg p-xl border border-border-subtle">
                <p><strong>Onea Africa (Pty) Ltd</strong></p>
                <p>Information Officer: Neanivaro Mukwevho</p>
                <p>Email: <a href="mailto:connect@onea.co.za" className="text-primary hover:underline">connect@onea.co.za</a></p>
                <p>WhatsApp: <a href="https://wa.me/+27694644663" className="text-primary hover:underline">+27 69 464 4663</a></p>
                <p>Pretoria, Gauteng, South Africa</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
