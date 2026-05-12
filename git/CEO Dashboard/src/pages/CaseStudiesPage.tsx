import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';

interface Props { onTalkToUs: () => void; }

const allClients = [
  {
    id: 'lekhuleni-telecoms',
    icon: 'settings_ethernet',
    cat: 'Connect',
    logoUrl: '/clients/lekhuleni.png',
    siteUrl: 'https://lekhulenitelecoms.co.za/',
    initials: 'LT',
    gradFrom: '#8CC444', gradTo: '#416900',
    name: 'Lekhuleni Telecoms & Projects',
    tagline: 'Connectivity and hosting solutions for a growing telecoms and projects company.',
    services: ['Connectivity Solutions', 'Managed Hosting', 'Website Development'],
  },
  {
    id: 'shepherd-removals',
    icon: 'local_shipping',
    cat: 'Communicate',
    logoUrl: '/clients/shepherd.png',
    siteUrl: 'https://shepherdremovals.co.za/',
    initials: 'SR',
    gradFrom: '#EA2300', gradTo: '#38D4FB',
    name: 'Shepherd Removals & Deliveries',
    tagline: 'Full brand and digital transformation for a logistics and removals business.',
    services: ['Brand Identity', 'Website Development', 'IT Services'],
  },
  {
    id: 'rathusha-bluestar',
    icon: 'business_center',
    cat: 'Connect',
    logoUrl: '/clients/rathusha-bluestar.jpg',
    siteUrl: 'https://www.facebook.com/RathushaBlueStar/',
    initials: 'RB',
    gradFrom: '#1565C0', gradTo: '#8CC444',
    name: 'Rathusha BlueStar',
    tagline: 'IT services and technical support across multiple dynamic business sectors.',
    services: ['IT Services', 'Technical Support', 'Infrastructure Setup'],
  },
  {
    id: 'rachips',
    icon: 'campaign',
    cat: 'Communicate',
    logoUrl: '/clients/rachips.png',
    initials: 'RC',
    gradFrom: '#8CC444', gradTo: '#F4D350',
    name: 'Rachips',
    tagline: 'Social media management, branding and IT for a fast-growing food brand.',
    services: ['Social Media Management', 'Branding & Identity', 'IT Services'],
  },
  {
    id: 'tsirelodzo-care',
    icon: 'health_and_safety',
    cat: 'Communicate',
    initials: 'TC',
    gradFrom: '#D6139F', gradTo: '#F4D350',
    name: 'Tsireledzo Care',
    tagline: 'IT services, digital marketing and content creation for a care services brand.',
    services: ['Digital Marketing', 'Content Creation', 'IT Services'],
  },
  {
    id: 'muldiv-consulting',
    icon: 'dns',
    cat: 'Connect',
    initials: 'MD',
    gradFrom: '#8CC444', gradTo: '#416900',
    name: 'MulDiv Consulting & Advisory',
    tagline: 'Managed hosting providing reliable infrastructure for a consulting and advisory firm.',
    services: ['Managed Hosting', 'Cloud Infrastructure', 'IT Support'],
  },
  {
    id: 'purple-sands-trading',
    icon: 'storefront',
    cat: 'Connect',
    initials: 'PS',
    gradFrom: '#6B3FA0', gradTo: '#F4D350',
    name: 'Purple Sands Trading',
    tagline: 'IT services and technology support for a multi-sector trading business.',
    services: ['IT Services', 'Technology Support', 'Digital Setup'],
  },
];

export default function CaseStudiesPage({ onTalkToUs }: Props) {
  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="relative h-[614px] flex items-center overflow-hidden bg-surface-container">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD214ZGwjLpFzRYo7nFm96C7pytCkGC19uThQ08YIZRFXhjySAiUEhgwZz0YeAHhQCi6mt5tDKXXcDHnzMuTO-3I08u9eNIed3wL-HjfNrrF7et2jKtgNtG24iDL2I5vnU3BaCw-FGnrq85wZGZIjinKESOhxFb0zmX9rwCIXzlxbkFg3jMtYIKkbNUqwP3mRrt7J_DVmFpHo4ZRR2OywZjcQtzE0R9yVusQ"
            alt="Skyscraper architecture"
          />
        </div>
        <div className="max-w-[1280px] mx-auto px-xl relative z-10 w-full">
          <AnimatedSection className="max-w-3xl">
            <span className="inline-block px-md py-xs bg-onea-green/10 text-primary rounded-full font-label-md text-label-md mb-lg">Case Studies</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-text-primary leading-tight">
              Delivering Excellence Across Africa
            </h1>
            <p className="mt-lg text-on-surface-variant text-body-lg max-w-xl">
              Exploring how Onea empowers businesses through integrated connectivity and digital transformation strategies.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── All Clients ── */}
      <section className="py-xxl px-md bg-white">
        <div className="max-w-[1280px] mx-auto">

          <AnimatedSection className="text-center mb-xxl max-w-2xl mx-auto">
            <span className="inline-block px-md py-xs bg-onea-green/10 text-primary rounded-full font-label-md text-label-md mb-lg">Client Success Stories</span>
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-md">Real Results. Real Clients.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              From high-speed connectivity to full brand transformation — discover how Onea Africa's integrated approach creates measurable impact for South African businesses.
            </p>
          </AnimatedSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl items-stretch">
            {allClients.map(c => (
              <StaggerItem key={c.id} className="h-full">
                <motion.div
                  className="h-full"
                  whileHover={{ y: -6, boxShadow: '0 28px 56px rgba(140,196,68,0.20)' }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className="group flex flex-col h-full p-xl"
                    style={{ background: 'rgba(140,196,68,0.10)', borderRadius: '25px', border: '2px solid rgba(244,211,80,0.75)' }}
                  >
                    {/* Icon + Logo/Initials row */}
                    <div className="flex items-start justify-between mb-lg">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                        style={{ background: 'rgba(140,196,68,0.15)' }}
                      >
                        <span className="material-symbols-outlined text-[28px]" style={{ color: '#8CC444' }}>{c.icon}</span>
                      </div>
                      {c.logoUrl ? (
                        <div
                          className="w-14 h-14 flex-shrink-0 overflow-hidden shadow-md"
                          style={{ borderRadius: '25px', border: '2px solid rgba(140,196,68,0.35)' }}
                        >
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-14 h-14 flex-shrink-0 flex items-center justify-center text-white font-extrabold text-[16px] shadow-md"
                          style={{ borderRadius: '25px', background: `linear-gradient(135deg, ${c.gradFrom}, ${c.gradTo})` }}
                        >
                          {c.initials}
                        </div>
                      )}
                    </div>

                    {/* Category pill */}
                    <span
                      className="inline-block self-start px-md py-xs font-label-md text-label-md mb-sm"
                      style={{ background: 'rgba(140,196,68,0.12)', color: '#416900', borderRadius: '9999px', border: '1px solid rgba(140,196,68,0.4)' }}
                    >
                      {c.cat}
                    </span>

                    {/* Client name — Violet */}
                    <h3 className="font-headline-md text-[20px] leading-snug mb-sm" style={{ color: '#D6139F' }}>
                      {c.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-on-surface-variant text-body-md leading-relaxed mb-xl flex-1">{c.tagline}</p>

                    {/* Services */}
                    <ul className="space-y-sm mb-xl">
                      {c.services.map(s => (
                        <li key={s} className="flex items-center gap-sm font-label-md text-on-surface">
                          <span
                            className="material-symbols-outlined text-[16px] flex-shrink-0"
                            style={{ color: '#8CC444', fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center justify-between flex-wrap gap-sm pt-sm" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <Link
                        to={`/case-studies/${c.id}`}
                        className="inline-flex items-center gap-sm text-primary font-bold group-hover:gap-md transition-all"
                      >
                        Learn More <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                      {c.siteUrl && (
                        <a
                          href={c.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-xs text-on-surface-variant text-body-sm hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          Visit
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xxl bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto px-xl text-center">
          <AnimatedSection>
            <h2 className="font-display-lg text-headline-lg mb-lg">Have a vision for your next project?</h2>
            <p className="text-on-primary/80 text-body-lg max-w-2xl mx-auto mb-xl">
              Let's collaborate to build the digital infrastructure and communication strategies your business deserves.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-md">
              <motion.button
                className="bg-white text-primary px-xl py-md rounded-full font-bold"
                onClick={onTalkToUs}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                Start a Conversation
              </motion.button>
              <Link to="/connectivity" className="border-2 border-white/30 text-white px-xl py-md rounded-full font-bold hover:bg-white/10 transition-all active:scale-95 text-center">
                Our Solutions
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
