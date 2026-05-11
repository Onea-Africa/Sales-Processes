import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const API = 'https://onea-africa-backend.onrender.com';

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = '6LdbH-MsAAAAAPHjXb5egDONWDxWE_nZPj7qW464';
const MESSAGE_MAX = 500;

const AREAS = [
  'Business Development',
  'Digital Marketing & Social Media',
  'IT & Technical Support',
  'Web Development',
  'Finance & Accounts',
  'PR & Communications',
  'Creative & Design',
  'Operations & Admin',
  'Other',
];

const SOURCES = ['LinkedIn', 'Facebook', 'Instagram', 'Google Search', 'Referral', 'Other'];

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type CareersModalMode = 'apply' | 'speculative' | 'contact';

interface Props {
  mode: CareersModalMode;
  jobTitle?: string;
  onClose: () => void;
}

const COPY: Record<CareersModalMode, { title: (job?: string) => string; subtitle: string }> = {
  apply:       { title: (job) => `Apply for ${job ?? 'Position'}`, subtitle: "Tell us why you're the right fit." },
  speculative: { title: () => 'Speculative Application',           subtitle: "We're always open to exceptional talent." },
  contact:     { title: () => 'Get in Touch',                      subtitle: "We'd love to hear from you." },
};

function inputFocus(e: React.FocusEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.borderColor = '#8CC444';
  (e.currentTarget as HTMLElement).style.boxShadow   = '0 0 0 3px #8CC44430';
}
function inputBlur(e: React.FocusEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.borderColor = '';
  (e.currentTarget as HTMLElement).style.boxShadow   = '';
}

const baseInput  = 'w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md transition-all outline-none font-body-md text-on-surface';
const baseSelect = `${baseInput} appearance-none cursor-pointer pr-12`;
const baseArea   = 'w-full bg-soft-surface border border-border-subtle rounded-lg px-lg py-md transition-all outline-none resize-none font-body-md text-on-surface';

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="font-label-md text-on-surface-variant ml-md block mb-xs">
      {text}{required && <span style={{ color: '#D6139F' }}> *</span>}
    </label>
  );
}

function SelectArrow() {
  return (
    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[20px]" style={{ color: '#8CC444' }}>
      expand_more
    </span>
  );
}

export default function CareersApplicationModal({ mode, jobTitle, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [message,   setMessage]   = useState('');
  const [cvFile,    setCvFile]    = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Wake up the Render backend while the user fills the form
  useEffect(() => {
    fetch(`${API}/api/health`).catch(() => {});
  }, []);

  const { title, subtitle } = COPY[mode];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('CV must be under 5 MB.');
      e.target.value = '';
      return;
    }
    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.currentTarget);

    let recaptchaToken = '';
    try {
      await new Promise<void>(resolve => window.grecaptcha.ready(resolve));
      recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'careers' });
    } catch { /* proceed without token — backend allows it */ }

    let cvBase64   = '';
    let cvFilename = '';
    if (cvFile) {
      cvBase64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = ev => resolve((ev.target?.result as string).split(',')[1] ?? '');
        reader.readAsDataURL(cvFile);
      });
      cvFilename = cvFile.name;
    }

    const payload = {
      mode,
      name:           fd.get('name') as string,
      email:          fd.get('email') as string,
      phone:          fd.get('phone') as string,
      idNumber:       fd.get('idNumber') as string,
      position:       mode === 'apply'       ? (jobTitle ?? '')
                    : mode === 'speculative' ? (fd.get('area') as string)
                    : '',
      message:        fd.get('message') as string,
      linkedin:       (fd.get('linkedin') as string) || '',
      source:         (fd.get('source') as string) || '',
      cvBase64,
      cvFilename,
      recaptchaToken,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    try {
      const res  = await fetch(`${API}/api/applications`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: unknown) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : 'Submission failed';
      if (msg.includes('aborted') || msg.includes('AbortError')) {
        setError('Server is taking too long to respond — please try again in a moment.');
      } else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Could not reach the server — please try again or email hr@onea.co.za directly.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-xl"
      style={{ backgroundColor: 'rgba(25,29,20,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[95vh] flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{    opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        {/* ── Green header bar ── */}
        <div className="flex items-start justify-between px-xl py-lg flex-shrink-0" style={{ backgroundColor: '#8CC444' }}>
          <div>
            <h2 className="text-white font-headline-md text-[20px] leading-tight">{title(jobTitle)}</h2>
            <p className="text-white/80 text-body-sm mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="mt-0.5 ml-lg w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
          >
            <span className="material-symbols-outlined text-white text-[20px]">close</span>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">
          <div className="px-xl py-lg">
            {submitted ? (
              /* Success */
              <div className="flex flex-col items-center justify-center py-xxl text-center gap-lg">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8CC44420' }}>
                  <span className="material-symbols-outlined text-[44px]" style={{ color: '#8CC444', fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <h3 className="font-headline-md text-[22px]" style={{ color: '#8CC444' }}>All done!</h3>
                <p className="text-on-surface-variant text-body-lg max-w-sm leading-relaxed">
                  Thank you for reaching out. We will be in touch soon.
                </p>
                <button
                  onClick={onClose}
                  className="px-xl py-md rounded-full font-bold text-white"
                  style={{ backgroundColor: '#8CC444' }}
                >
                  Close
                </button>
              </div>
            ) : (
              /* Form */
              <form ref={formRef} className="space-y-lg pb-xl" onSubmit={handleSubmit}>

                {/* Row 1 — Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                  <div>
                    <Label text="Full Name" required />
                    <input name="name" type="text" required placeholder="Your full name"
                      className={baseInput} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div>
                    <Label text="Email Address" required />
                    <input name="email" type="email" required placeholder="you@email.com"
                      className={baseInput} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>

                {/* Row 2 — Phone + Position/Area (context-dependent) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                  <div>
                    <Label text="Phone Number" required />
                    <input name="phone" type="tel" required placeholder="+27 69 464 4663"
                      className={baseInput} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>

                  {/* Apply — pre-filled read-only job title */}
                  {mode === 'apply' && (
                    <div>
                      <Label text="Position" />
                      <input
                        value={jobTitle ?? ''}
                        readOnly
                        className={`${baseInput} cursor-default`}
                        style={{ backgroundColor: '#f0f4e8', color: '#424938' }}
                      />
                    </div>
                  )}

                  {/* Speculative — area dropdown */}
                  {mode === 'speculative' && (
                    <div>
                      <Label text="Area of Interest" required />
                      <div className="relative">
                        <select name="area" required defaultValue="" className={baseSelect} onFocus={inputFocus} onBlur={inputBlur}>
                          <option value="" disabled>Select area...</option>
                          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <SelectArrow />
                      </div>
                    </div>
                  )}
                </div>

                {/* ID / Passport Number */}
                <div>
                  <Label text="SA ID / Passport Number" required />
                  <input
                    name="idNumber"
                    type="text"
                    required
                    placeholder="SA ID (13 digits) or passport number"
                    className={baseInput}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <p className="text-[11px] text-on-surface-variant ml-md mt-xs">
                    Required for HR verification. Kept strictly confidential.
                  </p>
                </div>

                {/* CV Upload (apply / speculative only) */}
                {mode !== 'contact' && (
                  <div>
                    <Label text="Upload CV (PDF, DOC, DOCX · max 5 MB)" />
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={handleFile}
                    />
                    {cvFile ? (
                      <div className="flex items-center gap-md px-lg py-md bg-soft-surface border border-border-subtle rounded-full" style={{ borderColor: '#8CC444' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#8CC444' }}>description</span>
                        <span className="flex-1 text-body-md text-on-surface truncate">{cvFile.name}</span>
                        <span className="text-body-sm text-on-surface-variant whitespace-nowrap">{(cvFile.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          onClick={() => { setCvFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                          className="text-on-surface-variant hover:text-red-500 transition-colors"
                          aria-label="Remove file"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex items-center justify-center gap-sm px-lg py-md bg-soft-surface border border-dashed border-border-subtle rounded-lg transition-all hover:border-primary hover:bg-primary/5 text-on-surface-variant hover:text-primary font-label-md"
                      >
                        <span className="material-symbols-outlined text-[22px]">upload_file</span>
                        Choose CV file
                      </button>
                    )}
                  </div>
                )}

                {/* Message — full width with live counter */}
                <div>
                  <Label
                    text={mode === 'contact' ? 'Message — your enquiry' : 'Brief Cover Note'}
                    required
                  />
                  <div className="relative">
                    <textarea
                      name="message"
                      required
                      maxLength={MESSAGE_MAX}
                      rows={5}
                      placeholder={
                        mode === 'apply'
                          ? "Tell us why you're the right fit for this role, your relevant experience, and what excites you about Onea Africa..."
                          : mode === 'speculative'
                          ? "Share your background, what you're passionate about, and what you'd bring to the team..."
                          : "How can we help you? Let us know what you'd like to discuss..."
                      }
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className={baseArea}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                    />
                    <span className={`absolute bottom-3 right-4 text-[12px] font-label-md tabular-nums pointer-events-none ${message.length >= MESSAGE_MAX ? 'text-red-500' : 'text-on-surface-variant'}`}>
                      {message.length}/{MESSAGE_MAX}
                    </span>
                  </div>
                </div>

                {/* Row 3 — LinkedIn + Source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                  <div>
                    <Label text="LinkedIn Profile URL" />
                    <input name="linkedin" type="url" placeholder="https://linkedin.com/in/yourname"
                      className={baseInput} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div>
                    <Label text="How did you hear about us?" />
                    <div className="relative">
                      <select name="source" defaultValue="" className={baseSelect} onFocus={inputFocus} onBlur={inputBlur}>
                        <option value="">Select...</option>
                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <SelectArrow />
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-sm px-lg py-md rounded-lg bg-red-50 border border-red-200 text-red-700 text-body-md">
                    <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full font-bold text-white uppercase tracking-wider text-label-md shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-md disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#8CC444' }}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      {mode === 'apply' ? 'Submit Application' : mode === 'speculative' ? 'Send Application' : 'Send Message'}
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-on-surface-variant leading-relaxed">
                  Protected by reCAPTCHA —{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy</a>
                  {' & '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms</a>
                </p>

              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
