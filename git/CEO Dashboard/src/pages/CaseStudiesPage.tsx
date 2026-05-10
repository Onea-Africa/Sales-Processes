import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';

interface Props { onTalkToUs: () => void; }

const cards = [
  {
    id: 'shepherd-removals',
    cat: 'Communicate',
    badge: 'text-white text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#EA2300',
    initials: 'SR',
    gradFrom: '#EA2300',
    gradTo: '#38D4FB',
    title: 'Shepherd Removals & Deliveries',
    desc: 'Brand identity, IT services and website development for a growing removals and logistics company.',
  },
  {
    id: 'lekhuleni-telecoms',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#8CC444',
    initials: 'LT',
    gradFrom: '#168ECB',
    gradTo: '#8CC444',
    title: 'Lekhuleni Telecoms & Projects',
    desc: 'Hosting, website development, IT services and connectivity solutions for a telecoms and projects company.',
  },
  {
    id: 'rachips',
    cat: 'Communicate',
    badge: 'text-white text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#D6139F',
    initials: 'RC',
    gradFrom: '#8CC444',
    gradTo: '#F4D350',
    title: 'Rachips',
    desc: 'IT services, branding and social media management to grow brand presence and digital engagement.',
  },
  {
    id: 'ishani-cakes',
    cat: 'Communicate',
    badge: 'text-white text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#D6139F',
    initials: 'IC',
    gradFrom: '#D6139F',
    gradTo: '#F4D350',
    title: 'Ishani Cakes',
    desc: 'IT services, digital marketing and content creation to build an engaging online presence for a specialty cake brand.',
  },
  {
    id: 'muldiv-consulting',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#8CC444',
    initials: 'MD',
    gradFrom: '#8CC444',
    gradTo: '#8CC444',
    title: 'MulDiv Consulting & Advisory',
    desc: 'Managed hosting solutions providing reliable infrastructure for a consulting and advisory services firm.',
  },
  {
    id: 'purple-sands-trading',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#8CC444',
    initials: 'PS',
    gradFrom: '#6B3FA0',
    gradTo: '#F4D350',
    title: 'Purple Sands Trading',
    desc: 'IT services and technology support to keep a trading business running reliably and efficiently.',
  },
  {
    id: 'rathusha-bluestar',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider',
    badgeBg: '#8CC444',
    initials: 'RB',
    gradFrom: '#1565C0',
    gradTo: '#8CC444',
    title: 'Rathusha BlueStar',
    desc: 'IT services and technical support solutions for a dynamic business operating across multiple sectors.',
  },
];

const FILTERS = ['All Projects', 'Connectivity', 'Digital Marketing', 'Communications'];
const catMap: Record<string, string> = {
  Connectivity: 'Connect',
  'Digital Marketing': 'Communicate',
  Communications: 'Converse',
};

export default function CaseStudiesPage({ onTalkToUs }: Props) {
  const [active, setActive] = useState('All Projects');

  const visible = active === 'All Projects'
    ? cards
    : cards.filter(c => c.cat === catMap[active]);

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

      {/* Filter Bar */}
      <section className="py-xl border-b border-border-subtle bg-white sticky top-[80px] z-40">
        <div className="max-w-[1280px] mx-auto px-xl">
          <div className="flex flex-wrap items-center gap-md">
            <span className="text-label-md text-on-surface-variant mr-md">Filter by:</span>
            {FILTERS.map(f => (
              <motion.button
                key={f}
                className={`px-lg py-sm rounded-full font-semibold transition-all ${
                  active === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-soft-surface text-on-surface-variant hover:bg-onea-green/10 hover:text-primary'
                }`}
                onClick={() => setActive(f)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="py-xxl bg-background">
        <div className="max-w-[1280px] mx-auto px-xl">
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {visible.map(cs => (
              <StaggerItem key={cs.id}>
                <motion.div whileHover={{ y: -6, boxShadow: '0 24px 50px rgba(65,105,0,0.10)' }} transition={{ duration: 0.25 }}>
                  <Link
                    to={`/case-studies/${cs.id}`}
                    className="group bg-white rounded-lg overflow-hidden card-shadow border border-border-subtle block"
                  >
                    <div className="aspect-[4/3] relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cs.gradFrom}, ${cs.gradTo})` }}>
                      <span className="text-white font-bold text-[72px] opacity-25 select-none">{cs.initials}</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-extrabold text-[56px] drop-shadow-lg">{cs.initials}</span>
                      </div>
                      <div className="absolute top-md left-md">
                        <span className={cs.badge} style={{ backgroundColor: cs.badgeBg }}>
                          {cs.cat}
                        </span>
                      </div>
                    </div>
                    <div className="p-xl">
                      <h3 className="font-headline-md text-text-primary mb-md leading-snug">{cs.title}</h3>
                      <p className="text-on-surface-variant line-clamp-2 mb-xl">{cs.desc}</p>
                      <span className="inline-flex items-center gap-sm text-primary font-bold group/link">
                        View Case Study
                        <span className="material-symbols-outlined transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
          <AnimatedSection className="mt-xxl flex justify-center">
            <button className="px-xl py-md border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-all active:scale-95">
              Load More Case Studies
            </button>
          </AnimatedSection>
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
