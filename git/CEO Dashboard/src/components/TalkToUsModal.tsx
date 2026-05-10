import { useState } from 'react';

interface Props { onClose: () => void; }

const SERVICES = [
  'Broadband / Home Internet',
  'Business Fibre & ISP',
  'IT Services & Support',
  'Network Infrastructure & Cabling',
  'Cloud Services',
  'Hardware & Software Supply',
  'Website Design & Development',
  'Digital Marketing & Social Media',
  'Branding & Creative',
  'PR & Communications',
  'Media Buying',
  'General Enquiry',
];

export default function TalkToUsModal({ onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);
    const payload = {
      name:    fd.get('name'),
      email:   fd.get('email'),
      phone:   fd.get('phone'),
      company: fd.get('company'),
      service: fd.get('service'),
      message: fd.get('message'),
    };

    try {
      const res = await fetch('http://localhost:4000/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(msg.includes('fetch') || msg.includes('NetworkError')
        ? 'Could not reach the server. Please email connect@onea.co.za or WhatsApp +27 69 464 4663.'
        : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-md md:p-xl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] overflow-y-auto">

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
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F4D35020', color: '#416900' }}>
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
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#416900')}
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

              <form className="space-y-lg" onSubmit={handleSubmit}>

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-xs">
                    <label className="font-label-md text-on-surface-variant ml-md block">
                      Full Name <span style={{ color: '#D6139F' }}>*</span>
                    </label>
                    <input
                      name="name"
                      required
                      className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none"
                      style={{ '--tw-ring-color': '#8CC444' } as React.CSSProperties}
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
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
                      className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none"
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
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
                      className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none"
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                      placeholder="+27 69 464 4663"
                      type="tel"
                    />
                  </div>
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
                      defaultValue=""
                      className="w-full appearance-none bg-soft-surface border border-border-subtle rounded-full px-lg py-md pr-[48px] transition-all outline-none cursor-pointer font-body-md text-on-surface"
                      onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
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
                    className="w-full bg-soft-surface border border-border-subtle rounded-lg px-lg py-md transition-all outline-none resize-none"
                    onFocus={e => { e.currentTarget.style.borderColor = '#8CC444'; e.currentTarget.style.boxShadow = '0 0 0 3px #8CC44430'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
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
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#416900'; }}
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

      </div>
    </div>
  );
}
