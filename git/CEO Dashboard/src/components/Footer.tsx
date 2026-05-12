import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <footer className="bg-onea-yellow/60 w-full border-t border-border-subtle">

      {/* Newsletter strip */}
      <div className="bg-primary text-on-primary py-xl">
        <div className="max-w-[1280px] mx-auto px-xl flex flex-col md:flex-row items-center justify-between gap-lg">
          <div>
            <p className="font-headline-md text-[20px] font-bold mb-xs">Stay connected with Onea Africa</p>
            <p className="text-on-primary/70 text-body-md">Industry insights, connectivity updates and digital tips — straight to your inbox.</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-sm text-onea-green font-bold bg-white/10 px-xl py-md rounded-full">
              <span className="material-symbols-outlined text-[18px]">check_circle</span> You're subscribed!
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-sm w-full md:w-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 md:w-[260px] px-lg py-sm rounded-full bg-white/10 border border-white/20 text-on-primary placeholder:text-on-primary/40 focus:outline-none focus:ring-2 focus:ring-onea-green text-body-md"
              />
              <button type="submit" className="px-xl py-sm bg-onea-green text-on-primary-fixed font-bold rounded-full hover:opacity-90 transition-all whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1280px] mx-auto px-xl py-xxl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xxl">

          {/* Brand col */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-lg">
              <img src="/logo.png" alt="Onea Africa" className="h-8 md:h-10 w-auto object-contain" />
            </Link>
            <p className="text-on-surface-variant text-body-sm mb-lg leading-relaxed">
              Empowering South African businesses through connectivity, digital marketing and public relations.
            </p>
            {/* Social icons */}
            <div className="flex gap-sm">
              <a href="https://www.facebook.com/ONEAAI" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-onea-violet/10 flex items-center justify-center text-onea-violet hover:bg-onea-violet hover:text-white transition-all shadow-sm border border-onea-violet/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com/ONEA_AFRICA" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="w-10 h-10 rounded-full bg-onea-violet/10 flex items-center justify-center text-onea-violet hover:bg-onea-violet hover:text-white transition-all shadow-sm border border-onea-violet/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.857L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.instagram.com/onea_af" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-onea-violet/10 flex items-center justify-center text-onea-violet hover:bg-onea-violet hover:text-white transition-all shadow-sm border border-onea-violet/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/onea-africa" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-onea-violet/10 flex items-center justify-center text-onea-violet hover:bg-onea-violet hover:text-white transition-all shadow-sm border border-onea-violet/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-lg">Solutions</h4>
            <ul className="space-y-md">
              <li><Link to="/connectivity" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">WiFi &amp; Connectivity</Link></li>
              <li><Link to="/connectivity" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">IT Infrastructure</Link></li>
              <li><Link to="/case-studies" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Digital Marketing</Link></li>
              <li><Link to="/case-studies" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Public Relations</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-lg">Company</h4>
            <ul className="space-y-md">
              <li><Link to="/case-studies" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Case Studies</Link></li>
              <li><Link to="/team" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Our Team</Link></li>
              <li><Link to="/blog" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Blog</Link></li>
              <li><Link to="/careers" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Careers</Link></li>
              <li><Link to="/privacy" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Compliance */}
          <div>
            <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-lg">Contact</h4>
            <ul className="space-y-md">
              <li className="flex items-start gap-sm text-on-surface-variant text-body-md">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">mail</span>
                <a href="mailto:connect@onea.co.za" className="hover:text-primary transition-colors">connect@onea.co.za</a>
              </li>
              <li className="flex items-start gap-sm text-on-surface-variant text-body-md">
                <span className="material-symbols-outlined text-[#25D366] text-[18px] mt-0.5 flex-shrink-0">chat</span>
                <a href="https://wa.me/+27694644663" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">+27 69 464 4663</a>
              </li>
              <li className="flex items-start gap-sm text-on-surface-variant text-body-md">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">location_on</span>
                <span>Pretoria, Gauteng</span>
              </li>
              <li className="flex items-start gap-sm text-on-surface-variant text-body-md">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">language</span>
                <a href="https://www.onea.africa" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.onea.africa</a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Compliance bar */}
      <div className="border-t border-border-subtle bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto px-xl py-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div className="text-[12px] text-on-surface-variant leading-relaxed">
            <span className="font-bold text-on-surface">Onea Africa (Pty) Ltd</span>
            {' '}· Reg No. 2016/461132/07 · VAT 4550322707 · CSD MAAA0662773
            {' '}· B-BBEE Level 1 Contributor · Microsoft Partner ID 7111532
          </div>
          <p className="text-[12px] text-on-surface-variant whitespace-nowrap">© 2026 Onea Africa. All rights reserved.</p>
        </div>
      </div>

    </footer>
  );
}
