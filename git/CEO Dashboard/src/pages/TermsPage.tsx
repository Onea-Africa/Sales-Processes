export default function TermsPage() {
  return (
    <div className="bg-background text-on-surface font-body-md">
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[800px] mx-auto px-xl">
          <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Legal</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">Terms &amp; Conditions</h1>
          <p className="text-on-surface-variant">Last updated: 10 May 2026 · Effective date: 1 January 2026</p>
        </div>
      </section>

      <section className="py-xxl">
        <div className="max-w-[800px] mx-auto px-xl">
          <div className="space-y-xxl text-body-md text-on-surface leading-relaxed">

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">1. Acceptance of Terms</h2>
              <p>By accessing or using the website <strong>www.onea.africa</strong> or any services provided by <strong>Onea Africa (Pty) Ltd</strong> (Reg 2016/461132/07), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">2. Services</h2>
              <p>Onea Africa provides connectivity (WiFi, fibre, enterprise IT), digital marketing, and public relations services. Specific service terms are set out in individual service agreements. These Terms govern general website use.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">3. Intellectual Property</h2>
              <p>All content on this website, including text, graphics, logos, and software, is the property of Onea Africa (Pty) Ltd and is protected by South African copyright law. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-xl space-y-sm mt-md">
                <li>Use the website for unlawful purposes or in violation of any applicable law.</li>
                <li>Transmit harmful, offensive, or fraudulent content.</li>
                <li>Attempt to gain unauthorised access to our systems.</li>
                <li>Interfere with the proper working of the website.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">5. Limitation of Liability</h2>
              <p>To the fullest extent permitted by South African law, Onea Africa shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services. Our aggregate liability shall not exceed the amount paid by you for services in the preceding 3 months.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">6. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. Onea Africa is not responsible for the content, privacy practices, or terms of these external sites. Links do not imply endorsement.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">7. Governing Law</h2>
              <p>These Terms are governed by the laws of the <strong>Republic of South Africa</strong>. Any disputes shall be subject to the jurisdiction of the courts of Gauteng, South Africa.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">8. Changes to Terms</h2>
              <p>We reserve the right to update these Terms at any time. Continued use of the website after changes constitutes acceptance of the revised Terms.</p>
            </div>

            <div>
              <h2 className="font-headline-md text-text-primary mb-md">9. Contact</h2>
              <div className="bg-soft-surface rounded-lg p-xl border border-border-subtle">
                <p><strong>Onea Africa (Pty) Ltd</strong></p>
                <p>Email: <a href="mailto:connect@onea.co.za" className="text-primary hover:underline">connect@onea.co.za</a></p>
                <p>Pretoria, Gauteng, South Africa</p>
                <p>VAT No. 4550322707</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
