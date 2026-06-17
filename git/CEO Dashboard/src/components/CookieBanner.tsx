import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('onea_cookie_consent');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('onea_cookie_consent', 'accepted');
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
    window.dispatchEvent(new CustomEvent('onea-consent-update', { detail: 'accepted' }));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('onea_cookie_consent', 'declined');
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.dispatchEvent(new CustomEvent('onea-consent-update', { detail: 'declined' }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-subtle shadow-lg"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-[1280px] mx-auto px-xl py-lg flex flex-col md:flex-row items-center gap-md">
        <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0">cookie</span>
        <p className="text-body-md text-on-surface-variant flex-1">
          We use cookies to improve your experience and comply with POPIA. By continuing, you agree to our{' '}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-sm flex-shrink-0">
          <button
            onClick={decline}
            className="px-lg py-sm rounded-full border border-border-subtle text-on-surface-variant font-semibold hover:bg-soft-surface transition-all text-body-md"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-lg py-sm rounded-full bg-primary text-on-primary font-bold hover:opacity-90 transition-all text-body-md"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
