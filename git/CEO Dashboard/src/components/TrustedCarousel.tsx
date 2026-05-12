import { useState } from 'react';

interface Logo {
  id: string;
  initials: string;
  name: string;
  bg: string;
  accent: string;
  logoUrl?: string;
  siteUrl?: string;
}

const FALLBACK: Logo[] = [
  { id: 'sr', initials: 'SR', name: 'Shepherd Removals',  bg: '#EA2300', accent: '#38D4FB', logoUrl: '/clients/shepherd.png',          siteUrl: 'https://shepherdremovals.co.za/' },
  { id: 'lt', initials: 'LT', name: 'Lekhuleni Telecoms', bg: '#8CC444', accent: '#8CC444', logoUrl: '/clients/lekhuleni.png',          siteUrl: 'https://lekhulenitelecoms.co.za/' },
  { id: 'rc', initials: 'RC', name: 'Rachips',             bg: '#8CC444', accent: '#F4D350', logoUrl: '/clients/rachips.png' },
  { id: 'tc', initials: 'TC', name: 'Tsireledzo Care',     bg: '#D6139F', accent: '#F4D350' },
  { id: 'md', initials: 'MD', name: 'MulDiv Consulting',   bg: '#8CC444', accent: '#8CC444' },
  { id: 'ps', initials: 'PS', name: 'Purple Sands',        bg: '#6B3FA0', accent: '#F4D350' },
  { id: 'rb', initials: 'RB', name: 'Rathusha BlueStar',   bg: '#1565C0', accent: '#8CC444', logoUrl: '/clients/rathusha-bluestar.jpg', siteUrl: 'https://www.facebook.com/RathushaBlueStar/' },
];

function LogoItem({ logo }: { logo: Logo }) {
  const bubble = (
    <div className="flex flex-col items-center gap-sm mx-lg group flex-shrink-0 cursor-pointer">
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl text-white shadow-sm group-hover:scale-110 transition-transform duration-300"
        style={{
          background: logo.logoUrl ? '#fff' : `linear-gradient(135deg, ${logo.bg}, ${logo.accent})`,
          border: logo.logoUrl ? '1.5px solid #e8eee1' : 'none',
        }}
      >
        {logo.logoUrl
          ? <img src={logo.logoUrl} alt={logo.name} className="w-full h-full object-cover rounded-full" />
          : logo.initials
        }
      </div>
      <span className="font-label-md text-[11px] text-on-surface-variant text-center max-w-[72px] leading-tight">
        {logo.name}
      </span>
    </div>
  );

  return logo.siteUrl ? (
    <a href={logo.siteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${logo.name}`}>
      {bubble}
    </a>
  ) : bubble;
}

export default function TrustedCarousel() {
  const [logos] = useState<Logo[]>(FALLBACK);

  const items = [...logos, ...logos];

  return (
    <div className="overflow-hidden w-full" aria-label="Trusted by our clients">
      <div className="marquee-track">
        {items.map((logo, i) => <LogoItem key={`${logo.id}-${i}`} logo={logo} />)}
      </div>
    </div>
  );
}
