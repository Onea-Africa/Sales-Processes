import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE as API } from '../lib/api';
import { trackLeadConversion } from '../lib/marketing';

const DRAFT_KEY = 'onea_talk_draft';

export type TalkToUsPrefill = {
  service?: string;
  message?: string;
};

interface Props {
  onClose: () => void;
  prefill?: TalkToUsPrefill | null;
}

const SERVICES = [
  'Broadband / Home Internet',
  'Business Fibre & ISP',
  'IT Services & Support',
  'Network Infrastructure & Cabling',
  'Cloud Services',
  'Hardware & Software Supply',
  'Apple Device Procurement',
  'Website Design & Development',
  'Hosting & Infrastructure',
  'System Integration',
  'Digital Marketing & Social Media',
  'Branding & Creative',
  'PR & Communications',
  'Residential / Home WiFi',
  'Enterprise / Business WiFi',
  'Website & Platform Development',
  'Communications & PR',
  'Media Buying',
  'General Enquiry',
];

export default function TalkToUsModal({ onClose, prefill }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});

  // Wake up the Render backend while the user fills the form
  useEffect(() => {
    fetch(`${API}/api/health`).catch(() => { });
  }, []);

  // Restore any saved draft into the form
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved) as Record<string, string>;
      const form = document.getElementById('talk-form') as HTMLFormElement | null;
      if (!form) return;
      Object.entries(draft).forEach(([k, v]) => {
        if ((k === 'service' && prefill?.service) || (k === 'message' && prefill?.message)) return;
        const el = form.elements.namedItem(k) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        if (el) el.value = v;
      });
    } catch { /* ignore */ }
  }, [prefill]);

  const scrollToFirstInvalid = () => {
    const form = document.getElementById('talk-form');
    const invalid = form?.querySelector('input.error, select.error, textarea.error') as HTMLElement | null
      || document.querySelector('.error') as HTMLElement | null;
    if (invalid) {
      invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      invalid.focus?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInvalidFields({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      company: String(fd.get('company') ?? '').trim(),
      leadArea: String(fd.get('leadArea') ?? '').trim(),
      service: String(fd.get('service') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      website: String(fd.get('website') ?? '').trim(),
    };

    const invalid: Record<string, boolean> = {};
    if (!payload.name) invalid.name = true;
    if (!payload.email || !payload.email.includes('@')) invalid.email = true;
    if (!payload.phone) invalid.phone = true;
    if (!payload.leadArea) invalid.leadArea = true;
    if (!payload.service) invalid.service = true;
    if (!payload.message) invalid.message = true;

    if (Object.keys(invalid).length > 0) {
      setInvalidFields(invalid);
      setError('Please complete the highlighted fields before submitting.');
      setLoading(false);
      requestAnimationFrame(scrollToFirstInvalid);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);

    try {
      const res = await fetch(`${API}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      localStorage.removeItem(DRAFT_KEY);
      trackLeadConversion({
        form_name: 'talk_to_us',
        service_type: payload.service,
        lead_area: payload.leadArea,
        lead_source: 'website_contact_form',
        submission_id: data.id || data.submissionId || '',
      });
      setSubmitted(true);
    } catch (err: unknown) {
      clearTimeout(timer);
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch { /* quota */ }
      const msg = err instanceof Error ? err.message : 'Submission failed';
      if (msg === 'The user aborted a request.' || msg.includes('aborted')) {
        setError('Server is taking too long to respond — your details have been saved and you can try again.');
      } else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Could not reach the server — your details are saved. Try again or WhatsApp us on +27 69 464 4663.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/40 p-md backdrop-blur-md md:p-xl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Contact Onea Africa"
    >
      <motion.div
        className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] overflow-y-auto"
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >

        {/* Left sidebar */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-soft-surface p-xl border-r border-border-subtle flex-shrink-0">
          <div>
            <div className="font-display-lg text-headline-md font-extrabold text-primary mb-xl">Onea</div>
            <div className="space-y-md">
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8CC44420', color: '#8CC444' }}>
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <p className="font-body-md text-on-surface-variant">High-speed infrastructure design and deployment.</p>
              </div>
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D6139F20', color: '#D6139F' }}>
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <p className="font-body-md text-on-surface-variant">Strategic marketing tailored for emerging markets.</p>
              </div>
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F4D35020', color: '#8CC444' }}>
                  <span className="material-symbols-outlined">public</span>
                </div>
                <p className="font-body-md text-on-surface-variant">Impactful public relations that build lasting trust.</p>
              </div>
            </div>
          </div>
          <div className="mt-xxl">
            <p className="font-body-md text-on-surface-variant leading-relaxed italic border-l-4 pl-md" style={{ borderColor: '#8CC444' }}>
              "Your partner in high-speed infrastructure, strategic marketing, and impactful public relations."
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 p-lg md:p-xl relative">
          <button
            className="absolute top-4 right-4 text-on-surface-variant p-2 rounded-full transition-all hover:text-primary"
            style={{}}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#8CC44420')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-xxl text-center gap-lg">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8CC44420' }}>
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#8CC444', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <h2 className="font-display-lg text-headline-md text-primary">Request Submitted!</h2>
              <p className="text-on-surface-variant text-body-lg max-w-sm">
                Thank you — we'll be in touch within 24 hours. WhatsApp us on <a href="https://wa.me/+27694644663" className="text-primary font-semibold hover:underline" target="_blank" rel="noopener noreferrer">+27 69 464 4663</a> for urgent queries.
              </p>
              <button
                onClick={onClose}
                className="px-xl py-md rounded-full font-bold transition-all text-white"
                style={{ backgroundColor: '#8CC444' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#8CC444')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#8CC444')}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <header className="mb-xl">
                <h2 className="font-display-lg text-headline-md text-primary mb-xs">Talk To Us</h2>
                <p className="font-body-md text-on-surface-variant">Let's build something that works together.</p>
              </header>

              <form id="talk-form" className="space-y-lg" onSubmit={handleSubmit}>
                <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-md block">
                      Full Name <span style={{ color: '#D6139F' }}>*</span>
                    </label>
                    <input
                      name="name"
                      required
                      className={`w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none ${invalidFields.name ? 'error' : ''}`}
                      style={{ '--tw-ring-color': '#8CC444' } as React.CSSProperties}
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                      onChange={() => {
                        if (invalidFields.name) setInvalidFields(prev => ({ ...prev, name: false }));
                        if (error) setError('');
                      }}
                      placeholder="Your full name"
                      type="text"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-md block">
                      Work Email <span style={{ color: '#D6139F' }}>*</span>
                    </label>
                    <input
                      name="email"
                      required
                      className={`w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none ${invalidFields.email ? 'error' : ''}`}
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                      onChange={() => {
                        if (invalidFields.email) setInvalidFields(prev => ({ ...prev, email: false }));
                        if (error) setError('');
                      }}
                      placeholder="you@company.com"
                      type="email"
                    />
                  </div>
                </div>

                {/* Row 2: Company + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-md block">Company Name</label>
                    <input
                      name="company"
                      className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none"
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                      placeholder="Your company"
                      type="text"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-md block">
                      Contact Number <span style={{ color: '#D6139F' }}>*</span>
                    </label>
                    <input
                      name="phone"
                      required
                      className={`w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none ${invalidFields.phone ? 'error' : ''}`}
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                      onChange={() => {
                        if (invalidFields.phone) setInvalidFields(prev => ({ ...prev, phone: false }));
                        if (error) setError('');
                      }}
                      placeholder="+27 69 464 4663"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant ml-md block">
                    Area / Township / Town <span style={{ color: '#D6139F' }}>*</span>
                  </label>
                  <input
                    name="leadArea"
                    required
                    className={`w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none ${invalidFields.leadArea ? 'error' : ''}`}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                    onChange={() => {
                      if (invalidFields.leadArea) setInvalidFields(prev => ({ ...prev, leadArea: false }));
                      if (error) setError('');
                    }}
                    placeholder="e.g. Soshanguve, Centurion or Midrand"
                    type="text"
                  />
                  <p className="text-[11px] text-on-surface-variant ml-md">Used to route your enquiry to the right service area.</p>
                </div>

                {/* Service dropdown — full width */}
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant ml-md block">
                    What can we help you with? <span style={{ color: '#D6139F' }}>*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="service"
                      required
                      defaultValue={prefill?.service || ''}
                      className={`w-full appearance-none bg-soft-surface border border-border-subtle rounded-full px-lg py-md pr-[48px] transition-all outline-none cursor-pointer font-body-md text-on-surface ${invalidFields.service ? 'error' : ''}`}
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                      onChange={() => {
                        if (invalidFields.service) setInvalidFields(prev => ({ ...prev, service: false }));
                        if (error) setError('');
                      }}
                    >
                      <option value="" disabled>Select a service...</option>
                      {SERVICES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[20px]" style={{ color: '#8CC444' }}>
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-xs">
                  <label className="font-label-md text-on-surface-variant ml-md block">Message / Requirements</label>
                  <textarea
                    name="message"
                    defaultValue={prefill?.message || ''}
                    className={`w-full bg-soft-surface border border-border-subtle rounded-lg px-lg py-md transition-all outline-none resize-none ${invalidFields.message ? 'error' : ''}`}
                    onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                    onChange={() => {
                      if (invalidFields.message) setInvalidFields(prev => ({ ...prev, message: false }));
                      if (error) setError('');
                    }}
                    placeholder="Tell us about your project or needs..."
                    rows={3}
                  />
                </div>

                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-sm px-lg py-md rounded-lg bg-red-50 border border-red-200 text-red-700 text-body-md">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="pt-md">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-display-lg text-label-md uppercase tracking-wider font-bold h-14 rounded-full shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-md text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#8CC444' }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#8CC444'; }}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#8CC444')}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <span className="material-symbols-outlined">send</span>
                      </>
                    )}
                  </button>
                  <p className="text-center font-label-md text-on-surface-variant mt-md">
                    Typically responds within 24 hours.
                  </p>
                </div>

              </form>
            </>
          )}
        </div>

      </motion.div>
    </div>
  );
}
