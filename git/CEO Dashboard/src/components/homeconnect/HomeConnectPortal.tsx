import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE as API } from '../../lib/api';
import { trackLeadConversion } from '../../lib/marketing';
const COLOR = '#11BFE0';
const ACCENT = '#0D9CB8';

const PACKAGES = [
  { name: 'Home Connect 20/10 Mbps', price: '328' },
  { name: 'Home Connect 30/30 Mbps', price: '508' },
  { name: 'Home Connect 40/20 Mbps', price: '518' },
  { name: 'Home Connect 50 Mbps', price: '708' },
  { name: 'Home Connect 50/50 Mbps', price: '788' },
  { name: 'Home Connect 100 Mbps', price: '908' },
  { name: 'Home Connect 100/100 Mbps', price: '1 008' },
  { name: 'Home Connect 200 Mbps', price: '1 158' },
  { name: 'Home Connect 200/200 Mbps', price: '1 228' },
  { name: 'Home Connect 300 Mbps', price: '1 358' },
  { name: 'Home Connect 500 Mbps', price: '1 438' },
];

const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

interface Lead {
  title: string; firstName: string; lastName: string;
  idNumber: string; cellphone: string; whatsapp: string; email: string;
  leadArea: string;
  selectedPackage: string; packagePrice: string;
}

const blank: Lead = {
  title: '', firstName: '', lastName: '', idNumber: '',
  cellphone: '', whatsapp: '', email: '',
  leadArea: '',
  selectedPackage: '', packagePrice: '',
};

// ── Small helpers ─────────────────────────────────────────────────────────────

function Lbl({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[13px] font-semibold text-gray-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Field({ label, required, invalid, ...props }: { label: string; required?: boolean; invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Lbl required={required}>{label}</Lbl>
      <input
        {...props}
        className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${invalid ? 'error' : ''}`}
        style={{ '--tw-ring-color': COLOR } as React.CSSProperties}
      />
    </div>
  );
}

// ── Step 1 — Package Selection ────────────────────────────────────────────────

function StepPackage({ selected, onSelect }: { selected: string; onSelect: (name: string, price: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">Choose the package that suits your home.</p>
      {PACKAGES.map(pkg => {
        const active = selected === pkg.name;
        return (
          <motion.button
            key={pkg.name}
            onClick={() => onSelect(pkg.name, pkg.price)}
            className="w-full text-left rounded-2xl border-2 px-5 py-4 flex items-center justify-between transition-all"
            style={{
              borderColor: active ? COLOR : '#e5e7eb',
              background: active ? `${COLOR}08` : '#fff',
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div>
              <p className="font-semibold text-gray-800 text-sm">{pkg.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{pkg.name.includes('/') ? 'Asymmetric upload/download' : 'Standard speed'}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="font-extrabold text-lg" style={{ color: COLOR }}>R{pkg.price}</p>
              <p className="text-xs text-gray-400">/month</p>
            </div>
            {active && (
              <span className="material-symbols-outlined ml-3 text-[20px]" style={{ color: COLOR }}>check_circle</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Step 2 — Lead Form ────────────────────────────────────────────────────────

function StepForm({ data, onChange, invalid }: { data: Lead; onChange: (k: keyof Lead, v: string) => void; invalid: Record<string, boolean>; }) {
  return (
    <div className="space-y-5">
      {/* Selected package summary */}
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `${COLOR}10`, border: `1.5px solid ${COLOR}30` }}>
        <span className="material-symbols-outlined text-[22px]" style={{ color: COLOR }}>wifi</span>
        <div>
          <p className="text-xs text-gray-500">Selected package</p>
          <p className="font-bold text-sm text-gray-800">{data.selectedPackage} — <span style={{ color: COLOR }}>R{data.packagePrice}/month</span></p>
        </div>
      </div>

      {/* Title */}
      <div>
        <Lbl required>Title</Lbl>
        <div className={`flex gap-2 flex-wrap ${invalid.title ? 'error rounded-2xl p-2' : ''}`}>
          {TITLES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange('title', t)}
              className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all"
              style={{
                borderColor: data.title === t ? COLOR : '#e5e7eb',
                background: data.title === t ? `${COLOR}12` : '#fff',
                color: data.title === t ? COLOR : '#374151',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" required invalid={invalid.firstName} value={data.firstName} onChange={e => onChange('firstName', e.target.value)} placeholder="e.g. John" />
        <Field label="Last Name" required invalid={invalid.lastName} value={data.lastName} onChange={e => onChange('lastName', e.target.value)} placeholder="e.g. Doe" />
      </div>

      <Field label="ID / Passport Number" required invalid={invalid.idNumber} value={data.idNumber} onChange={e => onChange('idNumber', e.target.value)} placeholder="13-digit ID or passport number" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Cellphone Number" required invalid={invalid.cellphone} type="tel" value={data.cellphone} onChange={e => onChange('cellphone', e.target.value)} placeholder="+27 xx xxx xxxx" />
        <Field label="WhatsApp Number" type="tel" value={data.whatsapp} onChange={e => onChange('whatsapp', e.target.value)} placeholder="If different from cellphone" />
      </div>

      <div>
        <Field label="Email Address" required invalid={invalid.email} type="email" value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="you@example.com" />
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Your email address will be used as your login username.
        </p>
      </div>

      <Field label="Area / Township / Town" required invalid={invalid.leadArea} value={data.leadArea} onChange={e => onChange('leadArea', e.target.value)} placeholder="e.g. Mamelodi, Pretoria East or Midrand" />
    </div>
  );
}

// ── Main Portal ───────────────────────────────────────────────────────────────

const DRAFT_KEY = 'onea_hcn_draft';

function buildMailto(d: Lead) {
  const body = [
    `Package: ${d.selectedPackage} — R${d.packagePrice}/month`,
    ``,
    `Title: ${d.title}`,
    `First Name: ${d.firstName}`,
    `Last Name: ${d.lastName}`,
    `ID / Passport: ${d.idNumber}`,
    `Cellphone: ${d.cellphone}`,
    `WhatsApp: ${d.whatsapp || 'N/A'}`,
    `Email: ${d.email}`,
    `Area / Township / Town: ${d.leadArea}`,
    ``,
    `Please process this Home Connect application.`,
  ].join('\n');
  return `mailto:sales@onea.co.za?subject=${encodeURIComponent(`Home Connect Application — ${d.firstName} ${d.lastName}`)}&body=${encodeURIComponent(body)}`;
}

export default function HomeConnectPortal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [data, setData] = useState<Lead>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...blank, ...JSON.parse(saved) } : blank;
    } catch { return blank; }
  });
  const [submitting, setSub] = useState(false);
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [drafted, setDrafted] = useState(false);
  const [refId, setRefId] = useState('');
  const hasDraft = !!localStorage.getItem(DRAFT_KEY);

  // Warm up the backend on mount
  useEffect(() => { fetch(`${API}/api/health`).catch(() => { }); }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (k: keyof Lead, v: string) => {
    setData(d => ({ ...d, [k]: v }));
    if (invalidFields[k]) {
      setInvalidFields(prev => ({ ...prev, [k]: false }));
    }
    if (error) setError('');
  };

  const scrollToFirstInvalid = () => {
    const invalid = document.querySelector('input.error, select.error, textarea.error') as HTMLElement | null;
    if (invalid) {
      invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      invalid.focus?.();
    }
  };

  const validateStep2 = () => {
    const invalid: Record<string, boolean> = {};
    if (!data.title) invalid.title = true;
    if (!data.firstName) invalid.firstName = true;
    if (!data.lastName) invalid.lastName = true;
    if (!data.idNumber) invalid.idNumber = true;
    if (!data.cellphone) invalid.cellphone = true;
    if (!data.email || !data.email.includes('@')) invalid.email = true;
    if (!data.leadArea) invalid.leadArea = true;
    return invalid;
  };

  const canNext1 = !!data.selectedPackage;
  const canNext2 = !!data.title && !!data.firstName && !!data.lastName &&
    !!data.idNumber && !!data.cellphone && !!data.email && !!data.leadArea;

  const submit = async () => {
    const invalid = validateStep2();
    if (Object.keys(invalid).length > 0) {
      setInvalidFields(invalid);
      setError('Please complete the highlighted fields before submitting.');
      requestAnimationFrame(scrollToFirstInvalid);
      return;
    }

    setError('');
    setDrafted(false);
    setSub(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35000);
    try {
      const res = await fetch(`${API}/api/homeconnect-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error((await res.json()).error || 'Server error');
      const json = await res.json();
      localStorage.removeItem(DRAFT_KEY);
      setRefId(json.id);
      trackLeadConversion({
        form_name: 'homeconnect_application',
        service_type: 'home_connectivity',
        package_name: data.selectedPackage,
        lead_area: data.leadArea,
        lead_source: 'homeconnect_portal',
        submission_id: json.id || '',
      });
      setStep('success');
    } catch (e: unknown) {
      clearTimeout(timer);
      // Save draft to localStorage so data is never lost
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* quota full */ }
      setDrafted(true);
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg.includes('abort') || msg.includes('Failed to fetch') || msg.includes('network')
          ? 'Server unreachable — your details have been saved as a draft.'
          : msg || 'Something went wrong — your details have been saved as a draft.'
      );
    } finally {
      setSub(false);
    }
  };

  const STEPS = ['Choose Package', 'Your Details'];

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex-1 overflow-y-auto flex items-start justify-center py-4 px-2">
        <motion.div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}>
                  <span className="material-symbols-outlined text-[20px] text-white">home_iot_device</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">Home Connect</h2>
                  <p className="text-xs text-gray-400">Residential Internet Application</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-600">close</span>
              </button>
            </div>

            {/* Step pills */}
            {step !== 'success' && (
              <div className="flex gap-2">
                {STEPS.map((label, i) => {
                  const idx = i + 1;
                  const done = (step === 2 && idx === 1);
                  const active = step === idx;
                  return (
                    <div key={label} className="flex items-center gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{
                          background: done || active ? COLOR : '#e5e7eb',
                          color: done || active ? '#fff' : '#9ca3af',
                        }}
                      >
                        {done ? <span className="material-symbols-outlined text-[12px]">check</span> : idx}
                      </div>
                      <span className={`text-xs font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
                      {i < STEPS.length - 1 && <span className="text-gray-200 mx-1">›</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Draft restored banner */}
          {hasDraft && step !== 'success' && (
            <div className="px-6 py-2 flex items-center gap-2 text-xs font-medium" style={{ background: `${COLOR}12`, color: '#0a7a96' }}>
              <span className="material-symbols-outlined text-[14px]">restore</span>
              Draft restored — your previous details have been loaded.
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-6 min-h-[420px]">
            <AnimatePresence mode="wait">
              {step === 'success' ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center text-center py-10"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: `${COLOR}15` }}>
                    <span className="material-symbols-outlined text-[40px]" style={{ color: COLOR }}>check_circle</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Application Received!</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm">
                    A Onea Africa consultant will contact you shortly to complete your application.
                  </p>
                  <div className="rounded-2xl px-6 py-4 mb-6 text-left w-full max-w-sm" style={{ background: `${COLOR}08`, border: `1.5px solid ${COLOR}25` }}>
                    <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                    <p className="font-mono font-bold text-gray-800 text-sm">{refId}</p>
                    <p className="text-xs text-gray-500 mt-2 mb-0.5">Package</p>
                    <p className="font-semibold text-sm text-gray-800">{data.selectedPackage} — <span style={{ color: COLOR }}>R{data.packagePrice}/mo</span></p>
                  </div>
                  <p className="text-xs text-gray-400">A confirmation has been sent to <strong>{data.email}</strong></p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-8 py-3 rounded-full font-bold text-white text-sm"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}
                  >
                    Done
                  </button>
                </motion.div>
              ) : step === 1 ? (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Select Your Package</h3>
                  <StepPackage selected={data.selectedPackage} onSelect={(name, price) => setData(d => ({ ...d, selectedPackage: name, packagePrice: price }))} />
                </motion.div>
              ) : (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <h3 className="font-bold text-gray-900 text-base mb-1">Your Details</h3>
                  <StepForm data={data} onChange={set} invalid={invalidFields} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          {step !== 'success' && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => step === 1 ? onClose() : setStep(1)}
                className="px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-all"
              >
                {step === 1 ? 'Cancel' : '← Back'}
              </button>

              <div className="flex items-center gap-3 flex-wrap justify-end">
                {error && (
                  <div className="text-right max-w-[220px]">
                    <p className="text-red-500 text-xs">{error}</p>
                    {drafted && (
                      <a
                        href={buildMailto(data)}
                        className="inline-flex items-center gap-1 text-xs font-semibold mt-1 underline"
                        style={{ color: COLOR }}
                      >
                        <span className="material-symbols-outlined text-[13px]">mail</span>
                        Send via email instead
                      </a>
                    )}
                  </div>
                )}
                {step === 1 ? (
                  <motion.button
                    onClick={() => setStep(2)}
                    disabled={!canNext1}
                    className="px-6 py-2.5 rounded-full font-bold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}
                    whileHover={canNext1 ? { scale: 1.03 } : {}}
                    whileTap={canNext1 ? { scale: 0.97 } : {}}
                  >
                    Continue →
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={submit}
                    disabled={!canNext2 || submitting}
                    className="px-6 py-2.5 rounded-full font-bold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}
                    whileHover={canNext2 && !submitting ? { scale: 1.03 } : {}}
                    whileTap={canNext2 && !submitting ? { scale: 0.97 } : {}}
                  >
                    {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
