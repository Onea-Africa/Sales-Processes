import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/motion/AnimatedSection';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import TiltCard from '../components/motion/TiltCard';

interface Props { onTalkToUs: () => void; }

type Credential = {
  name: string;
  image: string;
  issuer?: string;
  validUntil?: string;
  verifyUrl?: string;
};

const team = [
  {
    name: 'Neo',
    role: 'Founder & CEO/MD',
    bio: 'Neo founded Onea Africa with a vision to bridge the digital divide across South Africa. With expertise in telecommunications, IT infrastructure and digital strategy, he leads the company\'s growth partnerships with Openserve and Telkom.',
    photo: '/team/neo.png',
    initials: 'NN',
    accentColor: '#8CC444',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
    credentials: [
      {
        name: 'Google Ads AI-Powered Performance Certified',
        image: '/team/credentials/google-ads-ai-powered-performance.png',
        issuer: 'Skillshop',
      },
      {
        name: 'Grow Offline Sales AI Certified',
        image: '/team/credentials/google-grow-offline-sales-ai.png',
        issuer: 'Skillshop',
      },
      {
        name: 'Google Ads Search Certification',
        image: '/team/credentials/google-ads-search-certification.png',
        issuer: 'Skillshop',
        validUntil: '2027-06-15',
        verifyUrl: 'https://www.credential.net/202519d6-a191-4808-a553-33e5acc3eb93',
      },
      {
        name: 'Google Ads Display Certification',
        image: '/team/credentials/google-ads-display-certification.png',
        issuer: 'Skillshop',
        validUntil: '2027-06-15',
        verifyUrl: 'https://www.credential.net/06dc5084-8ff7-49a0-bdd7-5e4a103cd5de',
      },
    ],
  },
  {
    name: 'Joyce',
    role: 'Operations Lead',
    bio: 'Joyce drives operational excellence across Onea Africa\'s service delivery teams. She oversees client relationships, field operations, and ensures every project is delivered on time and to the highest standard.',
    photo: '/team/joyce.png',
    initials: 'JK',
    accentColor: '#D6139F',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
  },
  {
    name: 'Yolanda',
    role: 'Accounts & Compliance',
    bio: 'Yolanda keeps Onea Africa\'s financial and compliance engine running smoothly. She manages accounts, ensures regulatory compliance, and supports the day-to-day operational integrity of the business.',
    photo: '/team/yolanda.png',
    initials: 'YN',
    accentColor: '#8CC444',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
  },
  {
    name: 'Team Member',
    role: 'IT Intern',
    bio: 'Supporting Onea Africa\'s connectivity, device setup and internal IT service work while gaining hands-on experience across client support and infrastructure delivery.',
    photo: '/team/it-intern.png',
    initials: 'IT',
    accentColor: '#8CC444',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
  },
  {
    name: 'Team Member',
    role: 'Graphic Design Intern',
    bio: 'Assisting with visual design, campaign assets, brand layouts and creative production for Onea Africa and selected client projects.',
    photo: '/team/graphic-design-intern.png',
    initials: 'GD',
    accentColor: '#F4D350',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
  },
  {
    name: 'Team Member',
    role: 'PR, Marketing & Communications Intern',
    bio: 'Supporting content planning, public relations, social media coordination and communications activity across the Onea Africa brand.',
    photo: '/team/pr-marketing-communications-intern.png',
    initials: 'PR',
    accentColor: '#D6139F',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
  },
];

function formatCredentialDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CredentialCarousel({ credentials }: { credentials: Credential[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCredential = credentials[activeIndex] || credentials[0];

  if (!activeCredential) return null;

  const move = (direction: -1 | 1) => {
    setActiveIndex(current => (current + direction + credentials.length) % credentials.length);
  };

  return (
    <div className="mb-xl rounded-xl border border-border-subtle bg-soft-surface p-md">
      <div className="mb-sm flex items-center justify-between gap-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Professional certifications</p>
        <span className="rounded-full bg-white px-sm py-[2px] text-[11px] font-bold text-primary">
          {activeIndex + 1}/{credentials.length}
        </span>
      </div>

      <div className="rounded-lg border border-border-subtle bg-white p-md shadow-sm">
        <div className="flex min-h-[148px] flex-col items-center justify-center">
          <img
            src={activeCredential.image}
            alt={activeCredential.name}
            title={activeCredential.name}
            className="mx-auto h-24 w-full object-contain"
            loading="eager"
          />
          <p className="mt-sm text-[13px] font-bold leading-snug text-text-primary">{activeCredential.name}</p>
          {(activeCredential.issuer || activeCredential.validUntil) && (
            <p className="mt-xs text-[11px] text-on-surface-variant">
              {activeCredential.issuer || 'Credential'}
              {activeCredential.validUntil ? ` - Valid until ${formatCredentialDate(activeCredential.validUntil)}` : ''}
            </p>
          )}
          {activeCredential.verifyUrl && (
            <a
              href={activeCredential.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-xs text-[11px] font-bold text-primary hover:underline"
            >
              Verify credential
            </a>
          )}
        </div>

        <div className="mt-md flex items-center justify-between gap-sm">
          <button
            type="button"
            onClick={() => move(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-soft-surface text-text-primary hover:border-primary"
            aria-label="Previous certification"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <div className="flex items-center justify-center gap-xs">
            {credentials.map((credential, index) => (
              <button
                key={credential.name}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-border-subtle'}`}
                aria-label={`Show ${credential.name}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => move(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-soft-surface text-text-primary hover:border-primary"
            aria-label="Next certification"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ member }: { member: typeof team[number] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <TiltCard className="h-full">
      <div className="bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow h-full flex flex-col">
        {/* Photo */}
        <div className="flex justify-center pt-xl pb-md px-xl" style={{ background: `linear-gradient(160deg, ${member.accentColor}18, ${member.accentColor}06)` }}>
          <div
            className="w-36 h-36 rounded-full overflow-hidden border-4 shadow-lg flex-shrink-0 flex items-center justify-center"
            style={{ borderColor: member.accentColor }}
          >
            {!imgError ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-extrabold text-[36px]"
                style={{ background: `linear-gradient(135deg, ${member.accentColor}, ${member.accentColor}cc)` }}
              >
                {member.initials}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-xl pb-xl flex flex-col flex-1 text-center">
          <h2 className="font-headline-md text-text-primary mb-xs">{member.name}</h2>
          <p className="font-semibold font-label-md mb-lg" style={{ color: member.accentColor }}>{member.role}</p>
          <p className="text-on-surface-variant text-body-md leading-relaxed mb-xl flex-1">{member.bio}</p>
          {'credentials' in member && member.credentials && (
            <CredentialCarousel credentials={member.credentials} />
          )}
          <div className="flex gap-sm justify-center">
            <motion.a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant border border-border-subtle"
              whileHover={{ scale: 1.15, backgroundColor: '#0A66C2', color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </motion.a>
            <motion.a
              href={`mailto:${member.social.email}`}
              aria-label="Email"
              className="w-9 h-9 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant border border-border-subtle"
              whileHover={{ scale: 1.15, backgroundColor: '#8CC444', color: '#fff' }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
            </motion.a>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

export default function TeamPage({ onTalkToUs }: Props) {
  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <AnimatedSection>
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Our Team</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">The People Behind Onea</h1>
            <p className="text-on-surface-variant text-body-lg max-w-2xl">
              A tight-knit team of technology and communications professionals passionate about empowering South African businesses.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team grid */}
      <section className="py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {team.map(member => (
              <StaggerItem key={`${member.name}-${member.role}`}>
                <TeamCard member={member} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Culture strip */}
      <section className="py-xxl bg-soft-surface border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl text-center">
          <AnimatedSection>
            <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Apply Now</span>
            <h2 className="font-headline-md text-text-primary mb-md">Ready to Join the Team?</h2>
            <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto mb-xl">
              Fill in the form and we'll be in touch. All applications go directly to our HR team.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link
                to="/careers#apply"
                className="inline-flex items-center justify-center gap-sm bg-primary text-on-primary px-xl py-md rounded-full font-bold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                Apply Now
              </Link>
              <Link to="/careers" className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all text-center">
                View Open Roles
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
