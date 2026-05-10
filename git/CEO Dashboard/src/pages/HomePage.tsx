import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTypewriter } from '../hooks/useTypewriter';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import AnimatedCounter from '../components/motion/AnimatedCounter';
import TrustedCarousel from '../components/TrustedCarousel';

interface Props { onTalkToUs: () => void; }

const HEADLINE = 'Connect.\nCommunicate.\nConverse.';

export default function HomePage({ onTalkToUs }: Props) {
  const { displayed, done } = useTypewriter(HEADLINE, 36, 600);

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
              <span className="font-label-md text-label-md uppercase tracking-widest">South African Technology Partner</span>
            </motion.div>

            {/* Typewriter headline */}
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-text-primary leading-tight whitespace-pre-line">
              {displayed}
              {!done && <span className="typewriter-cursor" />}
            </h1>

            <motion.p
              className="font-body-lg text-body-lg text-on-surface-variant max-w-xl"
              initial={{ opacity: 0 }}
              animate={done ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Empowering South African businesses through high-speed infrastructure, strategic digital marketing, and impactful public relations. We are your end-to-end growth engine.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-md pt-md"
              initial={{ opacity: 0, y: 20 }}
              animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            >
              <motion.button
                className="bg-onea-green text-text-primary h-[56px] px-xl rounded-lg font-bold text-body-lg shadow-lg"
                onClick={onTalkToUs}
                whileHover={{ scale: 1.04, backgroundColor: '#8CC444', color: '#fff' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Partner With Us
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/connectivity"
                  className="bg-soft-surface text-on-surface h-[56px] px-xl rounded-lg font-bold text-body-lg border border-border-subtle hover:bg-white transition-all flex items-center"
                >
                  Explore Solutions
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmFE8Ygpe_cFTLlbMRuGrMJ0vqMHkp0rMPNWrNilZzMJmqQPAkAabJCK4i7xA9KbgPJCrzDhzJh6IzEolVWHCdOCaZTLDRyIk-wsSx3BWqb1AgcS0t5-5qJ7ocLIC2CxJqqyj59ZTbjJ4VWFU-VO5nK7gWrtRsm6qaOSeaU1jBjrk98YaSDTLVcHvZP8OMO00mKwDEyPe3ge5pW84DfcCupig5qlLcHOii_X_84jE1TH4xludVK4RpQgfoe_Lc57E8CIkKIbmoHnI"
                alt="Professional workspace"
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
              { icon: 'signal_cellular_alt', color: '#168ECB', label: 'Telkom Partner' },
              { icon: 'computer',         color: '#0078D4', label: 'Microsoft Partner' },
              { icon: 'public',           color: '#8CC444', label: 'National Coverage' },
              { icon: 'groups',           color: '#D6139F', label: 'Community Focused' },
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

      {/* ── Platform Access Strip ── */}
      <AnimatedSection>
        <section className="py-lg bg-surface-container-low border-b border-border-subtle">
          <div className="max-w-[1280px] mx-auto px-md flex flex-wrap justify-center gap-xl items-center">
            <span className="font-label-md text-on-surface-variant uppercase tracking-widest">Platform Access:</span>
            <a href="https://onea.africa/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[20px]">dashboard</span> Onea Dashboard
            </a>
            <a href="https://onea.africa/field" target="_blank" rel="noopener noreferrer" className="flex items-center gap-xs font-semibold text-primary hover:underline">
              <span className="material-symbols-outlined text-[20px]">support_agent</span> Field Agent Portal
            </a>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Three Pillars ── */}
      <section className="py-xxl px-md bg-white">
        <div className="max-w-[1280px] mx-auto">
          <AnimatedSection className="text-center mb-xxl max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-md">Our Three Pillars of Excellence</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">We provide the infrastructure to connect, the strategies to communicate, and the stories to converse with your audience.</p>
          </AnimatedSection>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-xl">

            <StaggerItem>
              <div className="service-card group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-green/30 h-full">
                <div className="w-16 h-16 bg-onea-green/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[32px]">settings_ethernet</span>
                </div>
                <span className="inline-block px-md py-xs bg-onea-green/10 border border-onea-green text-primary rounded-full font-label-md text-label-md mb-sm">Connect</span>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-md">WiFi &amp; IT Solutions</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl">High-speed fibre connectivity and robust IT infrastructure tailored for South African enterprises. Reliable, scalable, and secure.</p>
                <ul className="space-y-sm mb-xl">
                  {['Strong WiFi Coverage', 'Managed IT Services', 'Cloud Infrastructure'].map(item => (
                    <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <Link to="/connectivity" className="inline-flex items-center gap-sm text-primary font-bold group-hover:gap-md transition-all">
                  Learn More <span className="material-symbols-outlined">arrow_forward</span>
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
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Elevate your brand presence through data-driven digital strategies and creative execution that resonates with the local market.</p>
                <ul className="space-y-sm mb-xl">
                  {['Performance Marketing', 'Social Media Strategy', 'Content Creation'].map(item => (
                    <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <Link to="/case-studies" className="inline-flex items-center gap-sm text-secondary font-bold group-hover:gap-md transition-all">
                  Learn More <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="service-card group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-violet/30 h-full">
                <div className="w-16 h-16 bg-onea-violet/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-tertiary text-[32px]">forum</span>
                </div>
                <span className="inline-block px-md py-xs bg-onea-violet/10 border border-onea-violet text-on-tertiary-container rounded-full font-label-md text-label-md mb-sm">Converse</span>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-md">Public Relations</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Building authentic relationships through impactful storytelling and strategic media engagement across South Africa.</p>
                <ul className="space-y-sm mb-xl">
                  {['Media Relations', 'Crisis Management', 'Brand Positioning'].map(item => (
                    <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span> {item}
                    </li>
                  ))}
                </ul>
                <button className="inline-flex items-center gap-sm text-tertiary font-bold group-hover:gap-md transition-all" onClick={onTalkToUs}>
                  Learn More <span className="material-symbols-outlined">arrow_forward</span>
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
                <div className="text-[48px] font-extrabold leading-tight" style={{ color: '#8CC444' }}>
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
              <p className="font-body-lg text-body-lg opacity-90 mb-xl">Through strategic partnerships with Openserve and Telkom, we bring world-class connectivity to the doorstep of South African businesses, ensuring you stay ahead in the digital economy.</p>
              <motion.button
                className="bg-onea-yellow text-on-secondary-fixed px-xl h-[56px] rounded-lg font-bold"
                onClick={onTalkToUs}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Get Connected Now
              </motion.button>
            </AnimatedSection>
            <AnimatedSection direction="right" className="hidden md:block">
              <img
                className="rounded-lg shadow-2xl w-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh30jzt2HDnrxFwintIZ9aVFckUXs2DHij4H1cy6ZaWaHSfwcDTQn3tP2iS0airZ2mesjLSnEHvvOsIUfF-gNMdT4o9naLBiXRepN_0cGIlylC0QeOiAsXsNhLUvthcTi-R436e7xY5e9A8xykb81PIbHrS_JFmDeSb4n9JZ1wyMczmsOXU1RsSaTPOjvS7c27__geqm6wSB4jRgxNeyRDpNgUHQZi0dWzQPoCIHu-HuUaTi2Nb3aTjKovA9dFWWfOiLgPly2QnKc"
                alt="Fibre optic cables"
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
            {[
              { name: 'Shepherd Removals',  initials: 'SR', gradFrom: '#EA2300', gradTo: '#38D4FB',
                quote: 'Onea Africa transformed our brand from the ground up — website, identity and digital presence. We look professional, we rank online, and our enquiries have doubled.',
                role: 'Director, Shepherd Removals & Deliveries' },
              { name: 'Lekhuleni Telecoms', initials: 'LT', gradFrom: '#168ECB', gradTo: '#8CC444',
                quote: 'Their managed hosting and connectivity solutions have been rock-solid. Zero downtime in 18 months. The team is responsive and genuinely understands telecoms.',
                role: 'CEO, Lekhuleni Telecoms & Projects' },
              { name: 'Rachips',            initials: 'RC', gradFrom: '#8CC444', gradTo: '#F4D350',
                quote: 'Onea built our social media presence from scratch. In 6 months we went from 200 followers to over 4,000 and started getting DM orders every week.',
                role: 'Founder, Rachips' },
            ].map(t => (
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
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[14px]" style={{ background: `linear-gradient(135deg, ${t.gradFrom}, ${t.gradTo})` }}>
                      {t.initials}
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
                { q: 'What areas does Onea Africa service?', a: 'We are based in Gauteng and primarily serve the greater Pretoria and Johannesburg region, with connectivity solutions available nationally through our Openserve and Telkom partnerships. Contact us to check availability in your area.' },
                { q: 'Do you offer once-off services or only retainers?', a: 'Both. We offer once-off projects (website builds, brand identity, IT setup) as well as ongoing managed services (WiFi maintenance, digital marketing retainers, PR campaigns).' },
                { q: 'How long does a WiFi installation take?', a: 'A standard business WiFi installation takes 1–3 business days from confirmation of order, depending on site complexity and access point quantity.' },
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
