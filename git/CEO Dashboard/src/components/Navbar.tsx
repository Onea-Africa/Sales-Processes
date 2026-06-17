import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { onTalkToUs: () => void; }

// Your original, perfectly spaced main layout links
const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Solutions', to: '/connectivity' }, // Direct link to your platform workspace
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Blog', to: '/blog' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Team', to: '/team' },
];

export default function Navbar({ onTalkToUs }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.header
      className="bg-white/[0.94] backdrop-blur-md sticky top-0 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="flex justify-between items-center w-full px-xl py-md max-w-[1280px] mx-auto">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <img src="/logo.webp" alt="Onea Africa" width="400" height="169" className="h-9 md:h-11 w-auto object-contain" style={{ maxWidth: '200px' }} />
        </Link>

        {/* Desktop links - beautifully spaced using md:flex */}
        <div className="hidden md:flex items-center gap-xl">
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative font-label-md text-label-md uppercase tracking-wider font-semibold transition-colors pb-1 group"
                style={{ color: active ? '#8CC444' : '#424938' }}
              >
                {link.label}
                {/* Animated underline */}
                <span
                  className="absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: '#8CC444',
                    width: active ? '100%' : '0%',
                  }}
                />
                {!active && (
                  <span className="absolute bottom-0 left-0 h-[2px] rounded-full bg-[#8CC444] w-0 group-hover:w-full transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-md">
          <motion.button
            className="bg-onea-green text-on-primary px-lg py-sm rounded-full font-bold hidden md:inline-flex"
            onClick={onTalkToUs}
            whileHover={{ scale: 1.04, backgroundColor: '#8CC444' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            Talk To Us
          </motion.button>
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

      {/* Animated gradient line */}
      <div className="nav-gradient-line" />

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-border-subtle shadow-lg overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <div className="max-w-[1280px] mx-auto px-xl py-lg flex flex-col gap-md">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="font-semibold text-body-md py-sm border-b border-border-subtle block"
                    style={{ color: location.pathname === link.to ? '#8CC444' : '#424938' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                className="bg-onea-green text-on-primary px-lg py-sm rounded-full font-bold hover:opacity-90 transition-all mt-md"
                onClick={() => { setMenuOpen(false); onTalkToUs(); }}
                whileTap={{ scale: 0.97 }}
              >
                Talk To Us
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
