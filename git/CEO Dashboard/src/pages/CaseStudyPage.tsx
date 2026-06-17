import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getCaseStudy, getAdjacentStudies } from '../data/caseStudies';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';

interface Props { onTalkToUs: () => void; }

export default function CaseStudyPage({ onTalkToUs }: Props) {
  const { id } = useParams<{ id: string }>();
  const study = id ? getCaseStudy(id) : undefined;

  if (!study) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-xl">
        <Helmet>
          <title>Case Study Not Found | Onea Africa</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href="https://onea.africa/case-studies" />
        </Helmet>
        <div>
          <p className="text-on-surface-variant text-body-lg mb-lg">Case study not found.</p>
          <Link to="/case-studies" className="text-primary font-bold hover:underline">← Back to Case Studies</Link>
        </div>
      </div>
    );
  }

  const { prev, next } = getAdjacentStudies(study.id);

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[640px] flex items-center pt-xxl pb-xxl px-gutter" style={{ background: `linear-gradient(135deg, ${study.gradFrom}18, ${study.gradTo}18)` }}>
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-xl items-center w-full">
          <div className="z-10 order-2 md:order-1">
            <div className="inline-flex items-center gap-sm px-md py-xs rounded-full mb-lg font-label-md border" style={{ color: study.divisionColor, backgroundColor: `${study.divisionColor}15`, borderColor: `${study.divisionColor}30` }}>
              <span className="material-symbols-outlined text-[18px]">{study.divisionIcon}</span>
              {study.division}
            </div>
            <h1 className="font-headline-lg text-display-lg-mobile md:text-display-lg text-text-primary mb-md leading-none">
              {study.tagline}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-xl">
              {study.desc}
            </p>
            <div className="flex items-center gap-lg">
              <div className="bg-primary/10 p-lg rounded-lg border border-primary/20">
                <div className="text-primary font-headline-lg text-headline-lg leading-none">{study.metric1.value}</div>
                <div className="text-on-surface-variant font-label-md uppercase tracking-wide">{study.metric1.label}</div>
              </div>
              <div className="bg-onea-yellow/10 p-lg rounded-lg border border-onea-yellow/20">
                <div className="text-secondary font-headline-lg text-headline-lg leading-none">{study.metric2.value}</div>
                <div className="text-on-surface-variant font-label-md uppercase tracking-wide">{study.metric2.label}</div>
              </div>
            </div>
          </div>

          {/* Client avatar */}
          <div className="relative order-1 md:order-2 flex items-center justify-center h-[320px] md:h-[480px] w-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]" style={{ background: `linear-gradient(135deg, ${study.gradFrom}, ${study.gradTo})` }}>
            <span className="text-white font-extrabold opacity-20 select-none" style={{ fontSize: '200px', lineHeight: 1 }}>{study.initials}</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-extrabold drop-shadow-2xl" style={{ fontSize: '120px', lineHeight: 1 }}>{study.initials}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="bg-soft-surface py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-12 gap-xl">
            <AnimatedSection className="md:col-span-4" direction="left">
              <h2 className="font-headline-md text-headline-md text-text-primary mb-sm">The Challenge</h2>
              <div className="w-16 h-1 bg-primary rounded-full mb-md"></div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-widest">{study.client}</p>
            </AnimatedSection>
            <AnimatedSection className="md:col-span-8" direction="right">
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {study.challenge}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <AnimatedSection className="text-center mb-xl">
            <h2 className="font-headline-md text-headline-md text-text-primary">Strategies Employed</h2>
            <p className="font-body-md text-on-surface-variant">A tailored approach built around the client's specific needs.</p>
          </AnimatedSection>
          <StaggerGrid className="grid md:grid-cols-3 gap-lg">
            {study.strategies.map(s => (
              <StaggerItem key={s.title}>
                <motion.div
                  className="bg-white p-xl rounded-lg border border-border-subtle group h-full"
                  whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-lg"
                    style={{ backgroundColor: `${s.iconColor}18` }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <span className="material-symbols-outlined text-[32px]" style={{ color: s.iconColor }}>{s.icon}</span>
                  </motion.div>
                  <h3 className="font-headline-md text-headline-md mb-md">{s.title}</h3>
                  <p className="font-body-md text-on-surface-variant mb-lg">{s.desc}</p>
                  <ul className="space-y-sm">
                    {s.bullets.map(b => (
                      <li key={b} className="flex items-center gap-sm text-on-surface-variant font-label-md">
                        <span className="material-symbols-outlined text-[18px]" style={{ color: s.iconColor }}>check_circle</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Results */}
      <section className="bg-inverse-surface text-on-primary py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-2 gap-xl items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-md">{study.resultsHeadline}</h2>
              <p className="text-body-lg opacity-80 mb-xl">{study.resultsSummary}</p>
              <div className="space-y-lg">
                {study.bars.map(bar => (
                  <div key={bar.label}>
                    <div className="flex items-end gap-md mb-sm">
                      <span className="font-headline-lg text-[48px] leading-none" style={{ color: bar.color }}>{bar.value}</span>
                      <span className="font-body-md mb-xs opacity-70 pb-1">{bar.label}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              {study.stats.map(stat => (
                <div key={stat.l} className="bg-white/5 border border-white/10 p-lg rounded-lg text-center flex flex-col justify-center min-h-[180px]">
                  <span className={`material-symbols-outlined text-[40px] mb-md ${stat.color}`}>{stat.icon}</span>
                  <div className="text-headline-md font-bold">{stat.n}</div>
                  <div className="text-label-md opacity-60">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Nav */}
      <section className="py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto border-t border-border-subtle pt-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-lg">
            {prev ? (
              <Link to={`/case-studies/${prev.id}`} className="group cursor-pointer">
                <p className="text-label-md text-on-surface-variant mb-xs uppercase tracking-widest font-bold">Previous Project</p>
                <h4 className="text-headline-md font-bold group-hover:text-primary transition-colors flex items-center gap-sm">
                  <span className="material-symbols-outlined">arrow_back</span>
                  {prev.client}
                </h4>
              </Link>
            ) : <div />}
            {next ? (
              <Link to={`/case-studies/${next.id}`} className="text-right group cursor-pointer">
                <p className="text-label-md text-on-surface-variant mb-xs uppercase tracking-widest font-bold">Next Project</p>
                <h4 className="text-headline-md font-bold group-hover:text-primary transition-colors flex items-center gap-sm justify-end">
                  {next.client}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </h4>
              </Link>
            ) : <div />}
          </div>
          <div className="mt-xxl flex justify-center">
            <Link
              to="/case-studies"
              className="bg-primary text-on-primary px-xl py-lg rounded-full font-bold flex items-center gap-md hover:shadow-xl transition-all active:scale-95"
            >
              View All Case Studies
              <span className="material-symbols-outlined">grid_view</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xxl bg-soft-surface border-t border-border-subtle text-center">
        <div className="max-w-[640px] mx-auto px-xl">
          <h2 className="font-headline-md text-text-primary mb-md">Ready to write your success story?</h2>
          <p className="text-on-surface-variant text-body-lg mb-xl">
            Let's talk about how Onea Africa can connect, communicate and grow your business.
          </p>
          <button onClick={onTalkToUs} className="bg-primary text-on-primary px-xl py-md rounded-full font-bold hover:opacity-90 transition-all">
            Start a Conversation
          </button>
        </div>
      </section>

    </div>
  );
}
