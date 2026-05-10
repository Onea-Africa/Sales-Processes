import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Solutions', to: '/connectivity' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Blog', to: '/blog' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Team', to: '/team' },
];

export default function Navbar({ onTalkToUs }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white/[0.94] backdrop-blur-md sticky top-0 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <nav className="flex justify-between items-center w-full px-xl py-md max-w-[1280px] mx-auto">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <img src="/Clean_Backround.png" alt="Onea Africa" className="h-8 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-xl">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors pb-1 ${
                location.pathname === link.to
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-md">
          <button
            className="bg-onea-green text-on-primary px-lg py-sm rounded-full font-bold hover:scale-95 transition-transform duration-200 hidden md:inline-flex"
            onClick={onTalkToUs}
          >
            Talk To Us
          </button>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-sm hover:bg-primary/5 rounded-full transition-all"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(v => !v)}
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border-subtle shadow-lg">
          <div className="max-w-[1280px] mx-auto px-xl py-lg flex flex-col gap-md">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`font-semibold text-body-md py-sm border-b border-border-subtle ${
                  location.pathname === link.to ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              className="bg-onea-green text-on-primary px-lg py-sm rounded-full font-bold hover:opacity-90 transition-all mt-md"
              onClick={() => { setMenuOpen(false); onTalkToUs(); }}
            >
              Talk To Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
