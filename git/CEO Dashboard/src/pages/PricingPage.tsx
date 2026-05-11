import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import TelkomPortal from '../components/telkom/TelkomPortal';
import HomeConnectPortal from '../components/homeconnect/HomeConnectPortal';

interface Props { onTalkToUs: () => void; }

const services = [
  {
    id: 'connectivity',
    label: 'Connectivity',
    icon: 'settings_ethernet',
    color: '#8CC444',
    description: 'Home and Business-grade WiFi, fibre, and network infrastructure.',
    tiers: [
      {
        name: 'Basic',
        tagline: 'Get your office connected',
        price: 'From R 899',
        highlight: false,
        features: [
          '10 Mbps Business WiFi',
          'Up to 10 users',
          '1 Access Point',
          'Basic Network Monitoring',
          'Email Support',
        ],
      },
      {
        name: 'Business',
        tagline: 'Managed connectivity for growing teams',
        price: 'From R 2 499',
        highlight: true,
        features: [
          '100 Mbps Business WiFi',
          'Up to 50 users',
          '3 Access Points',
          'Managed Network (24×5)',
          'Smart CCTV (4 cameras)',
          'Monthly SLA Report',
          'Priority Support',
        ],
      },
      {
        name: 'Enterprise',
        tagline: 'Full infrastructure ownership',
        price: 'Custom',
        highlight: false,
        features: [
          '1 Gbps Dedicated Fibre',
          'Unlimited users',
          'Unlimited Access Points',
          '24×7 NOC Support',
          'Full CCTV Suite',
          'On-site Engineer',
          'Custom SLA',
        ],
      },
    ],
  },
  {
    id: 'it-services',
    label: 'IT Services',
    icon: 'computer',
    color: '#705d00',
    description: 'Helpdesk, managed IT, and full infrastructure solutions.',
    tiers: [
      {
        name: 'Support',
        tagline: 'On-call help when you need it',
        price: 'From R 499',
        highlight: false,
        features: [
          'Remote Helpdesk (8×5)',
          'Up to 5 devices',
          'Ticketing System',
          'Basic Antivirus & Patching',
          'Monthly Health Report',
        ],
      },
      {
        name: 'Managed',
        tagline: 'Proactive IT management',
        price: 'From R 1 999',
        highlight: true,
        features: [
          'Remote & On-site Support (24×5)',
          'Up to 25 devices',
          'Proactive Monitoring',
          'Backup & Disaster Recovery',
          'Microsoft 365 Management',
          'Cybersecurity Baseline',
          'Dedicated Account Manager',
        ],
      },
      {
        name: 'Full Infrastructure',
        tagline: 'End-to-end IT ownership',
        price: 'Custom',
        highlight: false,
        features: [
          '24×7 Support & NOC',
          'Unlimited devices',
          'Server & Cloud Management',
          'Advanced Cybersecurity',
          'Business Continuity Planning',
          'On-site IT Team',
          'Custom SLA & Reporting',
        ],
      },
    ],
  },
  {
    id: 'digital-marketing',
    label: 'Digital Marketing',
    icon: 'campaign',
    color: '#9a3783',
    description: 'Social media, paid ads, content, and full-agency campaigns.',
    tiers: [
      {
        name: 'Starter',
        tagline: 'Build your online presence',
        price: 'From R 1 999',
        highlight: false,
        features: [
          '2 Social Platforms',
          '8 Posts per month',
          'Basic Brand Kit',
          'Monthly Analytics Report',
          'Community Management',
        ],
      },
      {
        name: 'Growth',
        tagline: 'Scale reach and leads',
        price: 'From R 4 999',
        highlight: true,
        features: [
          '4 Social Platforms',
          '16 Posts per month',
          'Paid Ad Management (R5k budget)',
          'Content Creation (graphics + copy)',
          'SEO Foundations',
          'Bi-weekly Reporting',
          'Dedicated Strategist',
        ],
      },
      {
        name: 'Full Agency',
        tagline: 'Your outsourced marketing team',
        price: 'From R 9 999',
        highlight: false,
        features: [
          'All Platforms',
          'Unlimited Posts',
          'Full PPC & SEO Management',
          'Video Production',
          'Influencer Campaigns',
          'Weekly Strategy Calls',
          'Dedicated Account Director',
        ],
      },
    ],
  },
];

const ISP_PROVIDERS = [
  {
    id: 'telkom',
    name: 'Telkom',
    tagline: 'Fibre & LTE solutions via Telkom network',
    icon: 'signal_cellular_alt',
    color: '#002F87',
    accent: '#0050C8',
  },
  {
    id: 'supersonic',
    name: 'Supersonic',
    tagline: 'High-speed fibre packages via Supersonic',
    icon: 'rocket_launch',
    color: '#E63000',
    accent: '#FF5722',
  },
  {
    id: 'homeconnect',
    name: 'Homeconnect',
    tagline: 'Affordable home connectivity packages',
    icon: 'home_iot_device',
    color: '#00695C',
    accent: '#26A69A',
  },
];

export default function PricingPage({ onTalkToUs }: Props) {
  const [ispPortal, setIspPortal] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* ISP portal overlays */}
      <AnimatePresence>
        {ispPortal === 'telkom' && (
          <TelkomPortal onClose={() => setIspPortal(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ispPortal === 'homeconnect' && (
          <HomeConnectPortal onClose={() => setIspPortal(null)} />
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl text-center">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection>
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Transparent Pricing</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary mb-md">Simple, Scalable Plans</h1>
            <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
              Three services. Three tiers each. Mix and match to build the perfect package — or talk to us for a custom bundle.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── ISP Provider Selection ── */}
      <section className="py-xxl bg-white border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="text-center mb-xxl">
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Internet Service Providers</span>
            <h2 className="font-headline-md text-text-primary mb-md">Choose Your Connectivity Provider</h2>
            <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto">
              Onea Africa partners with leading ISPs to bring you the best home and business internet packages. Select a provider to view available plans.
            </p>
          </AnimatedSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-xl" stagger={0.08}>
            {ISP_PROVIDERS.map(isp => (
              <StaggerItem key={isp.id}>
                <motion.button
                  onClick={() => {
                    if (isp.id === 'telkom' || isp.id === 'homeconnect') { setIspPortal(isp.id); setComingSoon(null); }
                    else { setComingSoon(isp.id); setIspPortal(null); }
                  }}
                  className="w-full text-left group"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                >
                  <div
                    className="rounded-2xl border-2 p-xl h-full flex flex-col items-center text-center transition-all"
                    style={{ borderColor: `${isp.color}30`, background: `${isp.color}06` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = isp.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${isp.color}22`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${isp.color}30`; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  >
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `linear-gradient(135deg, ${isp.color}, ${isp.accent})` }}
                    >
                      <span className="material-symbols-outlined text-[36px] text-white">{isp.icon}</span>
                    </div>
                    <h3 className="font-headline-md text-[22px] mb-sm" style={{ color: isp.color }}>{isp.name}</h3>
                    <p className="text-on-surface-variant text-body-md mb-xl flex-1">{isp.tagline}</p>
                    <span
                      className="inline-flex items-center gap-sm px-xl py-md rounded-full font-bold text-white text-body-md"
                      style={{ background: `linear-gradient(135deg, ${isp.color}, ${isp.accent})` }}
                    >
                      {(isp.id === 'telkom' || isp.id === 'homeconnect') ? 'Apply Now' : 'View Packages'}
                      <span className="material-symbols-outlined text-[20px]">{(isp.id === 'telkom' || isp.id === 'homeconnect') ? 'open_in_new' : 'arrow_forward'}</span>
                    </span>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <AnimatePresence>
            {comingSoon && (
              <motion.div
                className="mt-xxl rounded-2xl border border-border-subtle bg-soft-surface p-xl md:p-xxl text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-[40px] text-primary mb-md block">construction</span>
                <h3 className="font-headline-md text-text-primary mb-sm">
                  {ISP_PROVIDERS.find(i => i.id === comingSoon)?.name} Packages
                </h3>
                <p className="text-on-surface-variant text-body-lg max-w-md mx-auto mb-xl">
                  Packages coming soon. Talk to our team for current availability and pricing in your area.
                </p>
                <div className="flex flex-col sm:flex-row gap-md justify-center">
                  <motion.button
                    onClick={onTalkToUs}
                    className="bg-primary text-on-primary px-xl py-md rounded-full font-bold"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Talk to Our Team
                  </motion.button>
                  <button
                    onClick={() => setComingSoon(null)}
                    className="border-2 border-border-subtle text-on-surface-variant px-xl py-md rounded-full font-bold hover:border-primary hover:text-primary transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Per-service pricing tables */}
      {services.map(svc => (
        <section key={svc.id} className="py-xxl border-b border-border-subtle">
          <div className="max-w-[1280px] mx-auto px-xl">
            <AnimatedSection className="mb-xxl" delay={0.05}>
              <div className="flex items-center gap-md mb-sm">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${svc.color}18` }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: svc.color }}>{svc.icon}</span>
                </div>
                <h2 className="font-headline-md text-text-primary">{svc.label}</h2>
              </div>
              <p className="text-on-surface-variant text-body-md ml-16">{svc.description}</p>
            </AnimatedSection>

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-xl" stagger={0.1}>
              {svc.tiers.map(tier => (
                <StaggerItem key={tier.name}>
                  <motion.div
                    className={`rounded-lg p-xl border transition-all h-full flex flex-col ${
                      tier.highlight
                        ? 'bg-primary text-on-primary border-primary shadow-xl md:scale-105'
                        : 'bg-white border-border-subtle'
                    }`}
                    whileHover={!tier.highlight ? { y: -4, boxShadow: '0 16px 40px rgba(65,105,0,0.1)' } : {}}
                    transition={{ duration: 0.22 }}
                  >
                    {tier.highlight && (
                      <span className="inline-block px-md py-xs bg-onea-yellow text-on-secondary-fixed rounded-full font-label-md text-[11px] mb-md uppercase self-start">Most Popular</span>
                    )}
                    <h3 className="font-headline-md text-[22px] mb-xs">{tier.name}</h3>
                    <p className={`text-body-md mb-lg ${tier.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>{tier.tagline}</p>
                    <div className="mb-xl">
                      <span className="font-extrabold text-[32px]">{tier.price}</span>
                      {tier.price !== 'Custom' && (
                        <span className={`text-body-md ${tier.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>/month</span>
                      )}
                    </div>
                    <ul className="space-y-sm mb-xl flex-1">
                      {tier.features.map(f => (
                        <li key={f} className={`flex items-start gap-sm text-body-md ${tier.highlight ? '' : 'text-on-surface'}`}>
                          <span className={`material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-onea-green' : 'text-primary'}`}>check_circle</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      onClick={onTalkToUs}
                      className={`w-full py-md rounded-full font-bold transition-all mt-auto ${
                        tier.highlight
                          ? 'bg-white text-primary hover:bg-soft-surface'
                          : 'bg-primary text-on-primary hover:opacity-90'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      {tier.price === 'Custom' ? 'Get a Quote' : 'Get Started'}
                    </motion.button>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-xxl bg-soft-surface text-center">
        <div className="max-w-[700px] mx-auto px-xl">
          <AnimatedSection>
            <h2 className="font-headline-md text-text-primary mb-md">Need a custom bundle?</h2>
            <p className="text-on-surface-variant text-body-lg mb-xl">
              We design bespoke packages combining connectivity, digital marketing and PR for maximum impact. Let's talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <motion.button
                onClick={onTalkToUs}
                className="bg-primary text-on-primary px-xl py-md rounded-full font-bold"
                whileHover={{ scale: 1.04, opacity: 0.9 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Talk to Our Team
              </motion.button>
              <Link to="/case-studies" className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all text-center">
                See Our Work
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
