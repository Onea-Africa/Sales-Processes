interface Props { onTalkToUs: () => void; }

const team = [
  {
    name: 'Neanivaro Mukwevho',
    role: 'Founder & Director',
    bio: 'Neanivaro founded Onea Africa with a vision to bridge the digital divide across South Africa. With expertise in telecommunications, IT infrastructure and digital strategy, he leads the company\'s growth partnerships with Openserve and Telkom.',
    initials: 'NM',
    gradFrom: '#416900',
    gradTo: '#8CC444',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'neo@onea.co.za',
    },
  },
  {
    name: 'Joyce Mukwevho',
    role: 'Operations Lead',
    bio: 'Joyce drives operational excellence across Onea Africa\'s service delivery teams. She oversees client relationships, field operations, and ensures every project is delivered on time and to the highest standard.',
    initials: 'JM',
    gradFrom: '#D6139F',
    gradTo: '#F4D350',
    social: {
      linkedin: 'https://www.linkedin.com/company/onea-africa',
      email: 'connect@onea.co.za',
    },
  },
];

export default function TeamPage({ onTalkToUs }: Props) {
  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Our Team</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">The People Behind Onea</h1>
          <p className="text-on-surface-variant text-body-lg max-w-2xl">
            A tight-knit team of technology and communications professionals passionate about empowering South African businesses.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl max-w-[900px] mx-auto">
            {team.map(member => (
              <div key={member.name} className="bg-white rounded-lg border border-border-subtle overflow-hidden card-shadow group hover:-translate-y-1 transition-transform duration-300">
                <div className="h-[260px] flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${member.gradFrom}, ${member.gradTo})` }}>
                  <span className="text-white font-extrabold text-[80px] opacity-30 select-none">{member.initials}</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-extrabold text-[64px] drop-shadow-lg">{member.initials}</span>
                  </div>
                </div>
                <div className="p-xl">
                  <h2 className="font-headline-md text-text-primary mb-xs">{member.name}</h2>
                  <p className="text-primary font-semibold font-label-md mb-lg">{member.role}</p>
                  <p className="text-on-surface-variant text-body-md leading-relaxed mb-xl">{member.bio}</p>
                  <div className="flex gap-sm">
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant hover:bg-[#0A66C2] hover:text-white transition-all border border-border-subtle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href={`mailto:${member.social.email}`} aria-label="Email" className="w-9 h-9 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-white transition-all border border-border-subtle">
                      <span className="material-symbols-outlined text-[16px]">mail</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture strip */}
      <section className="py-xxl bg-soft-surface border-t border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-xl text-center">
          <h2 className="font-headline-md text-text-primary mb-md">We're growing</h2>
          <p className="text-on-surface-variant text-body-lg max-w-2xl mx-auto mb-xl">
            Onea Africa is built on purpose, community and excellence. If you share our values, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center">
            <button onClick={onTalkToUs} className="bg-primary text-on-primary px-xl py-md rounded-full font-bold hover:opacity-90 transition-all">
              Get in Touch
            </button>
            <a href="/careers" className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all text-center">
              View Open Roles
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
