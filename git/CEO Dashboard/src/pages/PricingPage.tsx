import { Link } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

const tiers = [
  {
    name: 'Starter',
    tagline: 'Get connected and grow',
    price: { connect: 'R 1 499', market: 'R 2 999', pr: 'R 1 999' },
    highlight: false,
    features: {
      connect: ['10 Mbps Business WiFi', 'Basic IT Support (8×5)', 'Network Monitoring', '1 Access Point'],
      market: ['Social Media Setup', '4 Posts/month', 'Basic Brand Kit', 'Monthly Report'],
      pr: ['Press Release (1/quarter)', 'Social Listening', 'Brand Positioning Brief'],
    },
  },
  {
    name: 'Growth',
    tagline: 'Scale with confidence',
    price: { connect: 'R 3 499', market: 'R 6 999', pr: 'R 4 999' },
    highlight: true,
    features: {
      connect: ['100 Mbps Business WiFi', 'Managed IT (24×5)', 'Smart CCTV (4 cams)', '3 Access Points', 'Monthly SLA Report'],
      market: ['Multi-platform Management', '12 Posts/month', 'Paid Ad Management (R5k budget)', 'Analytics Dashboard', 'Content Creation'],
      pr: ['Media Relations (ongoing)', 'Crisis Response Plan', 'Press Releases (1/month)', 'Influencer Outreach'],
    },
  },
  {
    name: 'Enterprise',
    tagline: 'Full infrastructure ownership',
    price: { connect: 'Custom', market: 'Custom', pr: 'Custom' },
    highlight: false,
    features: {
      connect: ['1 Gbps Dedicated Fibre', '24×7 NOC Support', 'Full CCTV Suite', 'Unlimited Access Points', 'On-site Engineer'],
      market: ['Dedicated Account Manager', 'Full Campaign Management', 'Video Production', 'SEO & PPC', 'Weekly Reporting'],
      pr: ['Executive Comms Strategy', 'Spokesperson Training', 'Crisis War Room', 'Stakeholder Management', 'National Media Relations'],
    },
  },
];

const divisions = [
  { key: 'connect' as const, label: 'Connect — WiFi & IT', icon: 'settings_ethernet', color: '#416900' },
  { key: 'market' as const, label: 'Communicate — Digital', icon: 'campaign', color: '#705d00' },
  { key: 'pr' as const, label: 'Converse — PR', icon: 'forum', color: '#9a3783' },
];

export default function PricingPage({ onTalkToUs }: Props) {
  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl text-center">
        <div className="max-w-[1280px] mx-auto px-xl">
          <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Transparent Pricing</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary mb-md">Simple, Scalable Plans</h1>
          <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
            Choose from three tiers across our three divisions. Mix and match to build the perfect package for your business.
          </p>
        </div>
      </section>

      {/* Pricing tables by division */}
      {divisions.map(div => (
        <section key={div.key} className="py-xxl border-b border-border-subtle">
          <div className="max-w-[1280px] mx-auto px-xl">
            <div className="flex items-center gap-md mb-xxl">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${div.color}15` }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: div.color }}>{div.icon}</span>
              </div>
              <h2 className="font-headline-md text-text-primary">{div.label}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
              {tiers.map(tier => (
                <div
                  key={tier.name}
                  className={`rounded-lg p-xl border transition-all ${
                    tier.highlight
                      ? 'bg-primary text-on-primary border-primary shadow-xl scale-105'
                      : 'bg-white border-border-subtle'
                  }`}
                >
                  {tier.highlight && (
                    <span className="inline-block px-md py-xs bg-onea-yellow text-on-secondary-fixed rounded-full font-label-md text-[11px] mb-md uppercase">Most Popular</span>
                  )}
                  <h3 className="font-headline-md text-[24px] mb-xs">{tier.name}</h3>
                  <p className={`text-body-md mb-lg ${tier.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{tier.tagline}</p>
                  <div className="mb-xl">
                    <span className="font-extrabold text-[36px]">{tier.price[div.key]}</span>
                    {tier.price[div.key] !== 'Custom' && <span className={`text-body-md ${tier.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>/month</span>}
                  </div>
                  <ul className="space-y-sm mb-xl">
                    {tier.features[div.key].map(f => (
                      <li key={f} className={`flex items-start gap-sm text-body-md ${tier.highlight ? '' : 'text-on-surface'}`}>
                        <span className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-onea-green' : 'text-primary'}`}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onTalkToUs}
                    className={`w-full py-md rounded-full font-bold transition-all ${
                      tier.highlight
                        ? 'bg-white text-primary hover:bg-soft-surface'
                        : 'bg-primary text-on-primary hover:opacity-90'
                    }`}
                  >
                    {tier.price[div.key] === 'Custom' ? 'Get a Quote' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-xxl bg-soft-surface text-center">
        <div className="max-w-[700px] mx-auto px-xl">
          <h2 className="font-headline-md text-text-primary mb-md">Need a custom bundle?</h2>
          <p className="text-on-surface-variant text-body-lg mb-xl">
            We design bespoke packages combining connectivity, digital marketing and PR for maximum impact. Let's talk.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <button onClick={onTalkToUs} className="bg-primary text-on-primary px-xl py-md rounded-full font-bold hover:opacity-90 transition-all">
              Talk to Our Team
            </button>
            <Link to="/case-studies" className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all text-center">
              See Our Work
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
