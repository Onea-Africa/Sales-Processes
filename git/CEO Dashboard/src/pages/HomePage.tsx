import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import TrustedCarousel from '../components/TrustedCarousel';
import { fetchPublicTestimonials, mergeTestimonials, Testimonial } from '../data/testimonials';
import heroWorkspaceUrl from '../assets/hero-workspace.webp';

interface Props { onTalkToUs: () => void; }

const HEADLINE = 'Business Connectivity,\nIT & Digital Growth\nSolutions';

export default function HomePage({ onTalkToUs }: Props) {
  const [publicTestimonials, setPublicTestimonials] = useState<Testimonial[]>([]);
  const testimonials = mergeTestimonials(publicTestimonials).slice(0, 3);

  useEffect(() => {
    let mounted = true;
    fetchPublicTestimonials()
      .then(items => {
        if (mounted) setPublicTestimonials(items);
      })
      .catch(() => {
        if (mounted) setPublicTestimonials([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="bg-background text-on-background font-body-md">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-xxl pb-xxl px-md">
        {/* Floating blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-xl items-center relative z-10">
          <div className="md:col-span-7 space-y-lg">

            <motion.div
              className="inline-flex items-center gap-sm bg-primary/10 text-primary px-md py-xs rounded-full"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="font-label-md text-label-md uppercase tracking-widest">National Technology Partner</span>
            </motion.div>

            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-text-primary leading-tight whitespace-pre-line">
              {HEADLINE}
            </h1>

            <motion.p
              className="font-body-lg text-body-lg text-on-surface-variant max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              Onea Africa helps homes, SMEs, schools, guesthouses, offices and retail teams get connected, supported and visible online. Start with fibre, WiFi, IT support or digital growth, then request a quote when you are ready.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-md pt-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.25 }}
            >
              <motion.button
                className="bg-onea-green text-text-primary h-[56px] px-xl rounded-lg font-bold text-body-lg shadow-lg"
                onClick={onTalkToUs}
                whileHover={{ scale: 1.04, backgroundColor: '#8CC444', color: '#fff' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Request a Quote
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/connectivity"
                  className="bg-soft-surface text-on-surface h-[56px] px-xl rounded-lg font-bold text-body-lg border border-border-subtle hover:bg-white transition-all flex items-center"
                >
                  Explore Services
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            className="md:col-span-5 relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aspect-square rounded-lg overflow-hidden soft-shadow bg-soft-surface relative z-10">
              <motion.img
                className="w-full h-full object-cover"
                src={heroWorkspaceUrl}
                alt="Professional workspace"
                width="512"
                height="512"
                fetchPriority="high"
                decoding="async"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-onea-yellow/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-onea-violet/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* ── Trust Grid ── */}
      <section className="bg-soft-surface py-xl border-y border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-md">
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-6 gap-lg items-center text-center" stagger={0.07}>
            {[
              { icon: 'verified',         color: '#8CC444', label: 'B-BBEE Level 1' },
              { icon: 'partner_exchange', color: '#8CC444', label: 'Openserve Partner' },
              { icon: 'signal_cellular_alt', color: '#8CC444', label: 'Telkom Partner' },
              { icon: 'computer',         color: '#0078D4', label: 'Microsoft Partner' },
              { icon: 'security',         color: '#D6139F', label: 'Fortinet Partner' },
              { icon: 'public',           color: '#8CC444', label: 'National Coverage' },
            ].map(({ icon, color, label }) => (
              <StaggerItem key={label}>
                <div className="flex flex-col items-center gap-sm">
                  <span className="material-symbols-outlined text-[2rem]" style={{ color }}>{icon}</span>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Trusted By — Auto-scroll carousel ── */}
      <section className="py-xl bg-white border-b border-border-subtle overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-md">
          <AnimatedSection>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center mb-lg">Trusted by</p>
          </AnimatedSection>
          <TrustedCarousel />
        </div>
      </section>

      {/* ── Conversion Path Strip ── */}
      <AnimatedSection>
        <section className="py-lg bg-surface-container-low border-b border-border-subtle">
          <div className="max-w-[1280px] mx-auto px-md flex flex-wrap justify-center gap-xl items-center">
            <span className="font-label-md text-on-surface-variant uppercase tracking-widest">Start Here:</span>
            <Link to="/pricing" className="flex items-center gap-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[20px]">calculate</span> Build an Estimate
            </Link>
            <Link to="/telkom-application" className="flex items-center gap-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[20px]">edit_document</span> Apply for Fibre
            </Link>
            <Link to="/case-studies" className="flex items-center gap-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span> See Client Results
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Three Pillars ── */}
      <section className="py-xxl px-md bg-white">
        <div className="max-w-[1280px] mx-auto">
          <AnimatedSection className="text-center mb-xxl max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-md">Services Built Around Real Business Needs</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Choose a practical service path: better internet and WiFi, managed technology support, or marketing that turns attention into enquiries.</p>
          </AnimatedSection>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-xl">

            <StaggerItem>
              <div className="service-card group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-green/30 h-full">
                <div className="w-16 h-16 bg-onea-green/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[32px]">settings_ethernet</span>
                </div>
                <span className="inline-block px-md py-xs bg-onea-green/10 border border-onea-green text-primary rounded-full font-label-md text-label-md mb-sm">Connect</span>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-md">Fibre, WiFi &amp; IT Support</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Openserve-aligned fibre guidance, WiFi coverage planning, cabling and managed support for homes, offices, schools and growing teams.</p>
                <ul className="space-y-sm mb-xl">
                  {['Strong WiFi Coverage', 'Managed IT Services', 'Cloud Infrastructure'].map(item => (
                    <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <Link to="/connectivity" className="inline-flex items-center gap-sm text-primary font-bold group-hover:gap-md transition-all">
                  View Connectivity <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="service-card group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-yellow/30 h-full">
                <div className="w-16 h-16 bg-onea-yellow/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-[32px]">campaign</span>
                </div>
                <span className="inline-block px-md py-xs bg-onea-yellow/10 border border-onea-yellow text-on-secondary-container rounded-full font-label-md text-label-md mb-sm">Communicate</span>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-md">Digital Marketing</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Search, social content and sales-focused landing pages that guide visitors towards an enquiry, booking or purchase, with tracking that shows which campaigns produce results.</p>
                <ul className="space-y-sm mb-xl">
                  {['Sales-Focused Landing Pages', 'Google & Social Campaigns', 'Lead & Conversion Tracking'].map(item => (
                    <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <Link to="/solutions/corporate-digital-marketing" className="inline-flex items-center gap-sm text-secondary font-bold group-hover:gap-md transition-all">
                  Explore Digital Marketing <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="service-card group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-violet/30 h-full">
                <div className="w-16 h-16 bg-onea-violet/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-tertiary text-[32px]">forum</span>
                </div>
                <span className="inline-block px-md py-xs bg-onea-violet/10 border border-onea-violet text-on-tertiary-container rounded-full font-label-md text-label-md mb-sm">Converse</span>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-md">Communications &amp; PR</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Clear business communication, reputation support and public-facing content for teams that need to build trust before the sale.</p>
                <ul className="space-y-sm mb-xl">
                  {['Media Relations', 'Crisis Management', 'Brand Positioning'].map(item => (
                    <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <button className="inline-flex items-center gap-sm text-tertiary font-bold group-hover:gap-md transition-all" onClick={onTalkToUs}>
                  Talk To Us <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </StaggerItem>

          </StaggerGrid>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-xl bg-primary text-on-primary border-y border-white/10">
        <div className="max-w-[1280px] mx-auto px-md">
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-xl text-center" stagger={0.1}>
            {[
              { n: '1,284+', l: 'Active Connections' },
              { n: '412',    l: 'Installations Done' },
              { n: '99.3%',  l: 'Resolution Rate' },
              { n: '240+',   l: 'Business Clients' },
            ].map(s => (
              <StaggerItem key={s.l}>
                <div className="text-[48px] font-extrabold leading-tight" style={{ color: '#D6139F' }}>
                  <AnimatedCounter raw={s.n} />
                </div>
                <p className="font-label-md text-label-md uppercase tracking-widest mt-xs text-on-primary/70">{s.l}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Partnership ── */}
      <section className="py-xxl px-md bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto bg-primary text-on-primary rounded-xl p-xxl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
            <AnimatedSection direction="left">
              <h2 className="font-headline-lg text-headline-lg mb-md">Proud Technology Partners</h2>
              <div className="flex gap-md mb-lg">
                <span className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px]">partner_exchange</span> Openserve
                </span>
                <span className="inline-flex items-center gap-xs px-md py-xs bg-white/10 rounded-full font-label-md text-label-md" style={{ color: '#a8d4f5' }}>
                  <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span> Telkom
                </span>
              </div>
              <p className="font-body-lg text-body-lg opacity-90 mb-xl">Through Openserve and Telkom-aligned application paths, Onea Africa helps customers compare packages, prepare the right details and move from interest to application without confusion.</p>
              <Link to="/pricing">
                <motion.span
                  className="inline-block bg-onea-yellow text-on-secondary-fixed px-xl h-[56px] leading-[56px] rounded-lg font-bold"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Get Connected Now
                </motion.span>
              </Link>
            </AnimatedSection>
            <AnimatedSection direction="right" className="hidden md:block">
              <img
                className="rounded-lg shadow-2xl w-full"
                src="/partnership-fibre.webp"
                alt="Fibre optic cables"
                width="512"
                height="512"
                loading="lazy"
                decoding="async"
              />
            </AnimatedSection>
          </div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-onea-yellow/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-xxl px-md bg-soft-surface border-y border-border-subtle">
        <div className="max-w-[1280px] mx-auto">
          <AnimatedSection className="text-center mb-xxl">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-md">What Our Clients Say</h2>
            <p className="text-on-surface-variant text-body-lg max-w-xl mx-auto">Real feedback from businesses we've helped connect, communicate and grow.</p>
          </AnimatedSection>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {testimonials.map(t => (
              <StaggerItem key={t.name}>
                <motion.div
                  className="bg-white rounded-lg p-xl border border-border-subtle card-shadow h-full"
                  whileHover={{ y: -6, boxShadow: '0 28px 60px rgba(65,105,0,0.12)' }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex gap-xs mb-lg">
                    {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-[18px]" style={{ color: '#F4D350', fontVariationSettings: "'FILL' 1" }}>star</span>)}
                  </div>
                  <p className="text-on-surface text-body-md leading-relaxed mb-xl italic">"{t.quote}"</p>
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-border-subtle flex items-center justify-center flex-shrink-0">
                      {t.logoUrl
                        ? <img src={t.logoUrl} alt="" width="48" height="48" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white font-bold text-[14px]" style={{ background: `linear-gradient(135deg, ${t.gradFrom}, ${t.gradTo})` }}>{t.initials}</div>
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-body-md">{t.name}</p>
                      <p className="text-on-surface-variant text-body-sm">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-xxl px-md bg-white">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-xxl items-start">
          <AnimatedSection direction="left">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-md">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant text-body-lg mb-xl">Still have questions? <button className="text-primary font-bold hover:underline" onClick={onTalkToUs}>Talk to our team.</button></p>
          </AnimatedSection>
          <AnimatedSection direction="right">
            <div className="space-y-md">
              {[
                { q: 'What areas does Onea Africa service?', a: 'Onea Africa serves clients nationally across South Africa. We are based in Gauteng, but our fibre, LTE, WiFi, IT and digital support paths are built for customers in multiple provinces. Contact us to confirm availability for your address or site.' },
                { q: 'Do you offer once-off services or only retainers?', a: 'Both. We offer once-off projects (website builds, brand identity, IT setup) as well as ongoing managed services (WiFi maintenance, digital marketing retainers, PR campaigns).' },
                { q: 'How long does a WiFi installation take?', a: 'Most WiFi installations are done the same day or within 24 hours. Larger sites may take up to a day longer. Fibre installations typically take 1 to 3 business days from order confirmation.' },
                { q: 'Can I bundle connectivity, marketing and PR?', a: 'Yes — and we encourage it. Clients who bundle services across our three pillars get a tailored package with a single point of contact and a unified growth strategy.' },
                { q: 'What is your B-BBEE level?', a: 'Onea Africa is a B-BBEE Level 1 contributor. We can provide our certificate on request for your supplier development and compliance reporting.' },
              ].map((item, i) => (
                <details key={i} className="group bg-soft-surface rounded-lg border border-border-subtle overflow-hidden">
                  <summary className="px-xl py-lg font-semibold text-on-surface cursor-pointer flex justify-between items-center gap-md list-none">
                    {item.q}
                    <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                  </summary>
                  <div className="px-xl pb-lg text-on-surface-variant text-body-md leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

    </main>
  );
}

