import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import CareersApplicationModal, { CareersModalMode } from '../components/CareersApplicationModal';

interface Props { onTalkToUs: () => void; }

type CareerRole = {
  id: string;
  title: string;
  division: string;
  location: string;
  type: string;
  desc: string;
  applyEnabled: boolean;
};

const defaultOpenRoles: CareerRole[] = [
  {
    id: 'field-connectivity-technician',
    title: 'Field Connectivity Technician',
    division: 'Connect',
    location: 'Pretoria, Gauteng',
    type: 'Full-time',
    desc: "Install, configure and maintain WiFi, fibre and CCTV systems for business clients. You'll work closely with the field operations team and represent Onea Africa on-site.",
    applyEnabled: false,
  },
  {
    id: 'digital-marketing-specialist',
    title: 'Digital Marketing Specialist',
    division: 'Communicate',
    location: 'Remote / Pretoria',
    type: 'Full-time',
    desc: 'Manage social media campaigns, content creation and paid digital advertising for a portfolio of SME clients. Data-driven thinker with a creative edge.',
    applyEnabled: false,
  },
  {
    id: 'junior-pr-comms-officer',
    title: 'Junior PR & Comms Officer',
    division: 'Converse',
    location: 'Pretoria, Gauteng',
    type: 'Full-time',
    desc: 'Support media relations, write press releases and assist with stakeholder communications. Ideal for a recent graduate with a passion for storytelling and brand building.',
    applyEnabled: false,
  },
];

const divColor: Record<string, string> = {
  Connect:     '#8CC444',
  Communicate: '#705d00',
  Converse:    '#9a3783',
};

export default function CareersPage({ onTalkToUs: _onTalkToUs }: Props) {
  const rolesRef = useRef<HTMLDivElement>(null);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalMode,  setModalMode]  = useState<CareersModalMode>('speculative');
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [publishedRoles, setPublishedRoles] = useState<CareerRole[]>([]);

  useEffect(() => {
    fetch('/api/careers-public.php', { headers: { Accept: 'application/json' } })
      .then(response => (response.ok ? response.json() : null))
      .then(payload => {
        if (!Array.isArray(payload?.positions)) return;
        setPublishedRoles(payload.positions.map((position: Partial<CareerRole>) => ({
          id: String(position.id || position.title || ''),
          title: String(position.title || ''),
          division: String(position.division || 'Connect'),
          location: String(position.location || ''),
          type: String(position.type || 'Full-time'),
          desc: String(position.desc || ''),
          applyEnabled: true,
        })).filter((position: CareerRole) => position.id && position.title));
      })
      .catch(() => {
        setPublishedRoles([]);
      });
  }, []);

  const openRoles = useMemo(() => {
    const merged = new Map<string, CareerRole>();
    defaultOpenRoles.forEach(role => merged.set(role.id, role));
    publishedRoles.forEach(role => merged.set(role.id, role));
    return Array.from(merged.values());
  }, [publishedRoles]);

  const openApply = (mode: CareersModalMode, jobTitle?: string) => {
    setModalMode(mode);
    setModalTitle(jobTitle);
    setModalOpen(true);
  };

  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* ── Hero ── */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection>
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Careers</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">Build Africa's Digital Future</h1>
            <p className="text-on-surface-variant text-body-lg max-w-2xl">
              Join a team that connects communities, amplifies brands, and builds the infrastructure that powers South African businesses.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Why Onea Africa? ── */}
      <section className="py-xxl border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="text-center mb-xxl">
            <h2 className="font-headline-md text-text-primary">Why Onea Africa?</h2>
          </AnimatedSection>
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-3 gap-xl">
            {[
              { icon: 'diversity_3', title: 'Community First',   desc: 'We exist to uplift South African businesses and the communities they serve.' },
              { icon: 'lightbulb',   title: 'Innovation Driven', desc: 'Technology moves fast. We empower our team to learn, experiment, and grow.' },
              { icon: 'verified',    title: 'B-BBEE Level 1',    desc: 'We are proud contributors to transformation and economic inclusion in South Africa.' },
            ].map(v => (
              <StaggerItem key={v.title}>
                <motion.div
                  className="bg-soft-surface rounded-lg p-xl border border-border-subtle text-center"
                  whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(65,105,0,0.1)' }}
                  transition={{ duration: 0.22 }}
                >
                  <span className="material-symbols-outlined text-primary text-[40px] mb-md block">{v.icon}</span>
                  <h3 className="font-headline-md text-[20px] text-text-primary mb-sm">{v.title}</h3>
                  <p className="text-on-surface-variant text-body-md">{v.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── Open Positions ── */}
      <section className="py-xxl" ref={rolesRef}>
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection className="mb-xxl">
            <h2 className="font-headline-md text-text-primary">Open Positions</h2>
          </AnimatedSection>

          <div className="space-y-xl">
            {openRoles.map((role, i) => (
              <AnimatedSection key={role.title} delay={i * 0.08}>
                <motion.div
                  className="bg-white rounded-lg border border-border-subtle p-xl card-shadow"
                  whileHover={{ borderColor: '#8CC44466', boxShadow: '0 16px 40px rgba(65,105,0,0.08)' }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-sm mb-sm">
                        <span className="font-bold px-md py-xs rounded-full text-white text-[12px]"
                          style={{ backgroundColor: divColor[role.division] }}>
                          {role.division}
                        </span>
                        <span className="text-on-surface-variant text-body-sm">{role.location}</span>
                        <span className="text-on-surface-variant text-body-sm">·</span>
                        <span className="text-on-surface-variant text-body-sm">{role.type}</span>
                      </div>
                      <h3 className="font-headline-md text-[22px] text-text-primary mb-sm">{role.title}</h3>
                      <p className="text-on-surface-variant text-body-md max-w-2xl">{role.desc}</p>
                    </div>
                    {role.applyEnabled ? (
                      <motion.button
                        onClick={() => openApply('apply', role.title)}
                        className="bg-primary text-on-primary px-xl py-md rounded-full font-bold whitespace-nowrap flex-shrink-0"
                        whileHover={{ scale: 1.04, opacity: 0.9 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        Apply Now
                      </motion.button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-full border border-border-subtle bg-soft-surface px-xl py-md font-bold text-on-surface-variant whitespace-nowrap flex-shrink-0"
                      >
                        Applications opening soon
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          {/* ── Apply Now CTA ── */}
          <AnimatedSection className="mt-xxl">
            <div className="bg-soft-surface border border-border-subtle rounded-2xl p-xl md:p-xxl text-center">
              <span className="material-symbols-outlined text-primary text-[40px] mb-md block">edit_note</span>
              <h3 className="font-headline-md text-[24px] text-text-primary mb-sm">General Careers Interest</h3>
              <p className="text-on-surface-variant text-body-lg mb-xl max-w-lg mx-auto">
                Want to join Onea Africa even if a specific role is not open yet? Send your details and our team will keep them on file.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <motion.button
                  onClick={() => openApply('speculative')}
                  className="inline-flex items-center justify-center gap-sm px-xl py-md rounded-full font-bold text-white shadow-md"
                  style={{ backgroundColor: '#8CC444' }}
                  whileHover={{ scale: 1.04, opacity: 0.92 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  Send General CV
                </motion.button>
                <motion.button
                  onClick={() => rolesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center justify-center gap-sm px-xl py-md rounded-full font-bold border-2 border-primary text-primary hover:bg-primary/5 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <span className="material-symbols-outlined text-[20px]">expand_less</span>
                  View Other Roles
                </motion.button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <CareersApplicationModal
            mode={modalMode}
            jobTitle={modalTitle}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
