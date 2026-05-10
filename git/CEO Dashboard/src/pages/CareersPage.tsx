interface Props { onTalkToUs: () => void; }

const openRoles = [
  {
    title: 'Field Connectivity Technician',
    division: 'Connect',
    location: 'Pretoria, Gauteng',
    type: 'Full-time',
    desc: 'Install, configure and maintain WiFi, fibre and CCTV systems for business clients. You\'ll work closely with the field operations team and represent Onea Africa on-site.',
  },
  {
    title: 'Digital Marketing Specialist',
    division: 'Communicate',
    location: 'Remote / Pretoria',
    type: 'Full-time',
    desc: 'Manage social media campaigns, content creation and paid digital advertising for a portfolio of SME clients. Data-driven thinker with a creative edge.',
  },
  {
    title: 'Junior PR & Comms Officer',
    division: 'Converse',
    location: 'Pretoria, Gauteng',
    type: 'Full-time',
    desc: 'Support media relations, write press releases and assist with stakeholder communications. Ideal for a recent graduate with a passion for storytelling and brand building.',
  },
];

const divColor: Record<string, string> = {
  Connect: '#416900',
  Communicate: '#705d00',
  Converse: '#9a3783',
};

export default function CareersPage({ onTalkToUs }: Props) {
  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Careers</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">Build Africa's Digital Future</h1>
          <p className="text-on-surface-variant text-body-lg max-w-2xl">
            Join a team that connects communities, amplifies brands, and builds the infrastructure that powers South African businesses.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-xxl border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <h2 className="font-headline-md text-text-primary mb-xxl text-center">Why Onea Africa?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-xl">
            {[
              { icon: 'diversity_3', title: 'Community First', desc: 'We exist to uplift South African businesses and the communities they serve.' },
              { icon: 'lightbulb', title: 'Innovation Driven', desc: 'Technology moves fast. We empower our team to learn, experiment, and grow.' },
              { icon: 'verified', title: 'B-BBEE Level 1', desc: 'We are proud contributors to transformation and economic inclusion in South Africa.' },
            ].map(v => (
              <div key={v.title} className="bg-soft-surface rounded-lg p-xl border border-border-subtle text-center">
                <span className="material-symbols-outlined text-primary text-[40px] mb-md block">{v.icon}</span>
                <h3 className="font-headline-md text-[20px] text-text-primary mb-sm">{v.title}</h3>
                <p className="text-on-surface-variant text-body-md">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <h2 className="font-headline-md text-text-primary mb-xxl">Open Positions</h2>
          <div className="space-y-xl">
            {openRoles.map(role => (
              <div key={role.title} className="bg-white rounded-lg border border-border-subtle p-xl hover:border-primary/30 transition-all card-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-sm mb-sm">
                      <span className="font-bold px-md py-xs rounded-full text-white text-[12px]" style={{ backgroundColor: divColor[role.division] }}>
                        {role.division}
                      </span>
                      <span className="text-on-surface-variant text-body-sm">{role.location}</span>
                      <span className="text-on-surface-variant text-body-sm">·</span>
                      <span className="text-on-surface-variant text-body-sm">{role.type}</span>
                    </div>
                    <h3 className="font-headline-md text-[22px] text-text-primary mb-sm">{role.title}</h3>
                    <p className="text-on-surface-variant text-body-md max-w-2xl">{role.desc}</p>
                  </div>
                  <button
                    onClick={onTalkToUs}
                    className="bg-primary text-on-primary px-xl py-md rounded-full font-bold hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-xxl text-center">
            <p className="text-on-surface-variant text-body-lg mb-md">Don't see a perfect fit? We're always open to exceptional talent.</p>
            <button onClick={onTalkToUs} className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all">
              Send a Speculative Application
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
