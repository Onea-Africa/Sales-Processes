import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE as API } from '../../lib/api';
import { trackLeadConversion } from '../../lib/marketing';

const COLOR = '#00A651';
const ACCENT = '#147A4A';
const DRAFT_KEY = 'onea_openserve_isp_draft';

const PACKAGES = [
  { name: 'Openserve Web Connect 20/10 Mbps', price: '345', note: 'Subject to Openserve Web Connect infrastructure availability.' },
  { name: 'Openserve Web Connect 40/20 Mbps', price: '425', note: 'Subject to Openserve Web Connect infrastructure availability.' },
  { name: 'Openserve Webstream 25/25 Mbps', price: '499' },
  { name: 'Openserve Webstream 50/25 Mbps', price: '695' },
  { name: 'Openserve Webstream 100/50 Mbps', price: '895' },
  { name: 'Openserve Webstream 200/100 Mbps', price: '1 099' },
  { name: 'Openserve Webstream 300/150 Mbps', price: '1 249' },
  { name: 'Openserve Webstream 500/250 Mbps', price: '1 449' },
];

const TITLES = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

interface Lead {
  title: string; firstName: string; lastName: string;
  idNumber: string; cellphone: string; email: string;
  leadArea: string; address: string; selectedPackage: string; packagePrice: string;
}

const blank: Lead = {
  title: '', firstName: '', lastName: '', idNumber: '',
  cellphone: '', email: '', leadArea: '', address: '',
  selectedPackage: '', packagePrice: '',
};

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

function StepPackage({ selected, onSelect }: { selected: string; onSelect: (name: string, price: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">Select an Openserve ISP fibre package for your home or office. Web Connect offers are subject to infrastructure availability at the installation address.</p>
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
              <p className="text-xs text-gray-400 mt-0.5">High-speed fibre - uncapped</p>
              {pkg.note && <p className="text-[11px] text-gray-500 mt-1 leading-snug">{pkg.note}</p>}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className="font-bold text-sm" style={{ color: COLOR }}>R {pkg.price}<span className="text-gray-400 font-normal">/mo</span></p>
              {active && (
                <span className="material-symbols-outlined text-[18px]" style={{ color: COLOR, fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function StepDetails({ data, set, invalid }: { data: Lead; set: (k: keyof Lead, v: string) => void; invalid: Record<string, boolean>; }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">
        Package: <strong style={{ color: COLOR }}>{data.selectedPackage} - R {data.packagePrice}/mo</strong>
      </p>

      {/* Title + First + Last */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Lbl required>Title</Lbl>
          <select
            value={data.title}
            onChange={e => set('title', e.target.value)}
            required
            className={`w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white appearance-none ${invalid.title ? 'error' : ''}`}
            style={{ '--tw-ring-color': COLOR } as React.CSSProperties}
          >
            <option value="">-</option>
            {TITLES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Field label="First Name" required invalid={invalid.firstName} value={data.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" />
        <Field label="Last Name" required invalid={invalid.lastName} value={data.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" />
      </div>

      {/* ID + Cell */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="SA ID / Passport" required invalid={invalid.idNumber} value={data.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="000000 0000 000" />
        <Field label="Cell Number" required invalid={invalid.cellphone} value={data.cellphone} onChange={e => set('cellphone', e.target.value)} placeholder="+27 81 234 5678" type="tel" />
      </div>

      {/* Email */}
      <Field label="Email Address" required invalid={invalid.email} value={data.email} onChange={e => set('email', e.target.value)} placeholder="jane@email.com" type="email" />
      <Field label="Area / Township / Town" required invalid={invalid.leadArea} value={data.leadArea} onChange={e => set('leadArea', e.target.value)} placeholder="e.g. Atteridgeville, Centurion or Midrand" />

      {/* Installation address */}
      <div>
        <Lbl required>Installation Address</Lbl>
        <textarea
          value={data.address}
          onChange={e => set('address', e.target.value)}
          required
          rows={2}
          placeholder="Street, suburb, city, postal code"
          className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white resize-none ${invalid.address ? 'error' : ''}`}
          style={{ '--tw-ring-color': COLOR } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

export default function OpenserveIspPortal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'package' | 'details' | 'success'>('package');
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
  const hasDraft = !!localStorage.getItem(DRAFT_KEY);

  useEffect(() => { fetch(`${API}/api/health`).catch(() => { }); }, []);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

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

  const validateStep = () => {
    const invalid: Record<string, boolean> = {};
    if (!data.title) invalid.title = true;
    if (!data.firstName) invalid.firstName = true;
    if (!data.lastName) invalid.lastName = true;
    if (!data.idNumber) invalid.idNumber = true;
    if (!data.cellphone) invalid.cellphone = true;
    if (!data.email || !data.email.includes('@')) invalid.email = true;
    if (!data.leadArea) invalid.leadArea = true;
    if (!data.address) invalid.address = true;
    return invalid;
  };

  const canNext = !!data.selectedPackage;
  const canSubmit = !!data.title && !!data.firstName && !!data.lastName &&
    !!data.idNumber && !!data.cellphone && !!data.email && !!data.leadArea && !!data.address;

  const submit = async () => {
    const invalid = validateStep();
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
      const res = await fetch(`${API}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.title} ${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.cellphone,
          leadArea: data.leadArea,
          service: `Openserve ISP Fibre - ${data.selectedPackage} (R ${data.packagePrice}/mo)`,
          message: `ID/Passport: ${data.idNumber}\nInstallation address: ${data.address}`,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error((await res.json()).error || 'Server error');
      localStorage.removeItem(DRAFT_KEY);
      trackLeadConversion({
        form_name: 'openserve_isp_enquiry',
        service_type: 'openserve_fibre',
        package_name: data.selectedPackage,
        value: data.packagePrice,
        lead_area: data.leadArea,
        lead_source: 'openserve_isp_portal',
      });
      setStep('success');
    } catch (e: unknown) {
      clearTimeout(timer);
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* quota */ }
      setDrafted(true);
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg.includes('abort') || msg.includes('Failed to fetch') || msg.includes('network')
          ? 'Server unreachable - your details have been saved as a draft.'
          : msg || 'Something went wrong - your details have been saved as a draft.'
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
          <div className="flex items-center justify-between px-6 py-5" style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white text-[28px]">router</span>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Openserve ISP Fibre</h2>
                <p className="text-white/70 text-xs">Uncapped fibre packages for home and office</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors" aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Step indicators (only while not success) */}
          {step !== 'success' && (
            <div className="flex border-b border-gray-100">
              {STEPS.map((label, i) => {
                const done = (step === 'details' && i === 0);
                const active = (step === 'package' && i === 0) || (step === 'details' && i === 1);
                return (
                  <div key={label} className="flex-1 flex items-center justify-center gap-2 py-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        background: done || active ? COLOR : '#e5e7eb',
                        color: done || active ? '#fff' : '#9ca3af',
                      }}
                    >
                      {done ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                    </div>
                    <span className="text-xs font-medium" style={{ color: active ? COLOR : '#9ca3af' }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Draft banner */}
          {hasDraft && step === 'package' && !drafted && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm" style={{ background: `${COLOR}10`, color: COLOR }}>
              <span className="material-symbols-outlined text-[18px]">history</span>
              You have a saved draft - your previous details have been restored.
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5">
            <AnimatePresence mode="wait">

              {/* Step 1 - Package */}
              {step === 'package' && (
                <motion.div key="pkg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepPackage selected={data.selectedPackage} onSelect={(name, price) => { set('selectedPackage', name); set('packagePrice', price); }} />
                  <button
                    onClick={() => setStep('details')}
                    disabled={!canNext}
                    className="mt-6 w-full py-4 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}
                  >
                    Continue - Enter Your Details
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </motion.div>
              )}

              {/* Step 2 - Details */}
              {step === 'details' && (
                <motion.div key="det" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <StepDetails data={data} set={set} invalid={invalidFields} />

                  {error && (
                    <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
                      {error}
                      {drafted && (
                        <a href={`mailto:sales@onea.co.za?subject=Openserve%20ISP%20Application%20-%20${encodeURIComponent(data.selectedPackage)}&body=Name%3A%20${encodeURIComponent(`${data.title} ${data.firstName} ${data.lastName}`)}%0AID%3A%20${encodeURIComponent(data.idNumber)}%0ACell%3A%20${encodeURIComponent(data.cellphone)}%0AEmail%3A%20${encodeURIComponent(data.email)}%0AArea%3A%20${encodeURIComponent(data.leadArea)}%0AAddress%3A%20${encodeURIComponent(data.address)}`}
                          className="underline font-semibold ml-1 flex-shrink-0">Email us instead</a>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep('package')}
                      className="px-5 py-4 rounded-2xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={submit}
                      disabled={submitting || !canSubmit}
                      className="flex-1 py-4 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}
                    >
                      {submitting ? (
                        <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Submitting...</>
                      ) : (
                        <>Submit Application<span className="material-symbols-outlined text-[18px]">send</span></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Success */}
              {step === 'success' && (
                <motion.div
                  key="done"
                  className="flex flex-col items-center text-center py-10 gap-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${COLOR}15` }}>
                    <span className="material-symbols-outlined text-[44px]" style={{ color: COLOR, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h3 className="font-bold text-2xl" style={{ color: COLOR }}>Application Received!</h3>
                  <p className="text-gray-500 max-w-sm leading-relaxed">
                    Thank you, <strong>{data.firstName}</strong>. We've received your Openserve ISP fibre application and will be in touch within 24 hours to confirm availability in your area.
                  </p>
                  <p className="text-sm text-gray-400">
                    Questions? WhatsApp us on{' '}
                    <a href="https://wa.me/+27694644663" className="font-semibold hover:underline" style={{ color: COLOR }}>+27 69 464 4663</a>
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-8 py-3 rounded-full font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${COLOR}, ${ACCENT})` }}
                  >
                    Done
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

