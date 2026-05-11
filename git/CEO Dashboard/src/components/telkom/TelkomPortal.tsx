import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignaturePad, { SigHandle } from './SignaturePad';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FD {
  // Step 1
  isExistingCustomer: string; fullName: string; idNumber: string;
  mobile: string; altNumber: string; email: string;
  physicalAddress: string; postalAddress: string; deliveryAddress: string;
  coverageChecked: string;
  // Step 2
  employerName: string; employerPhone: string; employerAddress: string;
  grossIncome: string; netIncome: string; householdIncome: string;
  // Step 3
  ackDebit: boolean; debitConsent: boolean; procConsent: boolean; sig1Date: string;
  // Step 4
  serviceType: string; selectedPackage: string; packagePrice: string;
  activationDate: string; hasExistingLine: string; requiresRouter: string; sig2Date: string;
  // Step 5
  agreeTerms: boolean; agreeDebit: boolean; agreeCancellation: boolean; agreePOPIA: boolean; sig3Date: string;
}

const today = new Date().toLocaleDateString('en-ZA');

const blank: FD = {
  isExistingCustomer:'', fullName:'', idNumber:'', mobile:'', altNumber:'', email:'',
  physicalAddress:'', postalAddress:'', deliveryAddress:'', coverageChecked:'',
  employerName:'', employerPhone:'', employerAddress:'', grossIncome:'', netIncome:'', householdIncome:'',
  ackDebit:false, debitConsent:false, procConsent:false, sig1Date:today,
  serviceType:'', selectedPackage:'', packagePrice:'', activationDate:'', hasExistingLine:'', requiresRouter:'', sig2Date:today,
  agreeTerms:false, agreeDebit:false, agreeCancellation:false, agreePOPIA:false, sig3Date:today,
};

// ─── Package data ─────────────────────────────────────────────────────────────

const FIBRE = [
  { name:'Core Fibre Lite',  speed:'50/25 Mbps',   price:'695' },
  { name:'Core Fibre',       speed:'100/50 Mbps',  price:'895' },
  { name:'Endless Fibre',    speed:'50/50 Mbps',   price:'805' },
  { name:'Endless Fibre',    speed:'100/100 Mbps', price:'1 025' },
  { name:'Endless Fibre',    speed:'200/100 Mbps', price:'1 299' },
  { name:'Endless Fibre',    speed:'200/200 Mbps', price:'1 365' },
  { name:'Stream Connect',   speed:'50/25 Mbps',   price:'695' },
  { name:'Stream Connect',   speed:'100/50 Mbps',  price:'895' },
  { name:'Stream Connect',   speed:'200/100 Mbps', price:'1 299' },
  { name:'Easy Connect',     speed:'20/10 Mbps',   price:'345' },
  { name:'Easy Connect',     speed:'40/20 Mbps',   price:'425' },
];

const GATED = [
  { name:'Gated CSS', speed:'40/20 Mbps',   price:'500' },
  { name:'Gated CSS', speed:'40/40 Mbps',   price:'550' },
  { name:'Gated CSS', speed:'75/50 Mbps',   price:'650' },
  { name:'Gated CSS', speed:'75/75 Mbps',   price:'700' },
  { name:'Gated CSS', speed:'150/75 Mbps',  price:'900' },
  { name:'Gated CSS', speed:'150/150 Mbps', price:'950' },
  { name:'Gated CSS', speed:'300/150 Mbps', price:'1 100' },
  { name:'Gated CSS', speed:'500/250 Mbps', price:'1 300' },
];

const LTE = [
  { name:'LTE',          speed:'25 GB',    price:'109' },
  { name:'LTE',          speed:'45 GB',    price:'139' },
  { name:'LTE',          speed:'80 GB',    price:'179' },
  { name:'LTE',          speed:'160 GB',   price:'229' },
  { name:'LTE',          speed:'240 GB',   price:'299' },
  { name:'LTE',          speed:'360 GB',   price:'399' },
  { name:'LTE Unlimited',speed:'10 Mbps',  price:'299' },
  { name:'LTE Unlimited',speed:'20 Mbps',  price:'449' },
  { name:'LTE Unlimited',speed:'30 Mbps',  price:'599' },
  { name:'LTE Data',     speed:'2 TB',     price:'749' },
];

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-gray-50 outline-none transition-all text-[15px] focus:border-[#8CC444] focus:ring-2 focus:ring-[#8CC444]/20';

function Lbl({ t, req }: { t: string; req?: boolean }) {
  return <label className="text-[13px] font-semibold text-gray-500 ml-1 mb-1 block">{t}{req && <span className="text-[#D6139F] ml-1">*</span>}</label>;
}

function Sec({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 pb-2 border-b border-gray-100">
      <span className="material-symbols-outlined text-[20px]" style={{ color: '#8CC444' }}>{icon}</span>
      <h3 className="font-bold text-gray-800 text-[15px]">{text}</h3>
    </div>
  );
}

function Radio({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-[14px] font-medium transition-all ${
        selected ? 'border-[#8CC444] bg-[#8CC444]/8 text-[#416900]' : 'border-gray-200 text-gray-600 hover:border-[#8CC444]/40'}`}>
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#8CC444]' : 'border-gray-300'}`}>
        {selected && <span className="w-2 h-2 rounded-full bg-[#8CC444]" />}
      </span>
      {label}
    </button>
  );
}

function Check({ checked, onChange, text }: { checked: boolean; onChange: () => void; text: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div onClick={onChange}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
          checked ? 'bg-[#8CC444] border-[#8CC444]' : 'border-gray-300 group-hover:border-[#8CC444]/50'}`}>
        {checked && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
      </div>
      <span className="text-[14px] text-gray-700 leading-relaxed">{text}</span>
    </label>
  );
}

function PkgCard({ name, speed, price, selected, onSelect }:
  { name: string; speed: string; price: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect}
      className={`text-left p-4 rounded-xl border-2 transition-all relative ${
        selected ? 'border-[#8CC444] bg-[#8CC444]/8 shadow-sm' : 'border-gray-200 hover:border-[#8CC444]/40 bg-white'}`}>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#8CC444] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[13px]">check</span>
        </span>
      )}
      <p className="text-[12px] text-gray-400 font-medium mb-0.5">{name}</p>
      <p className="text-[18px] font-extrabold text-gray-800 leading-tight">{speed}</p>
      <p className="text-[17px] font-bold mt-1" style={{ color: '#8CC444' }}>R{price}<span className="text-[11px] font-normal text-gray-500">/mo</span></p>
    </button>
  );
}

function SigSection({ sigRef, name, date, onClear }: {
  sigRef: React.RefObject<SigHandle>; name: string; date: string; onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-500">Sign in the box below</p>
        <button type="button" onClick={onClear}
          className="text-[12px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">refresh</span> Clear
        </button>
      </div>
      <SignaturePad ref={sigRef} />
      <div className="flex justify-between text-[11px] text-gray-400 px-1">
        <span>{name || 'Customer name'}</span>
        <span>{date}</span>
      </div>
    </div>
  );
}

// ─── Step 1 — Customer Details ────────────────────────────────────────────────

function Step1({ d, s }: { d: FD; s: (k: keyof FD, v: string | boolean) => void }) {
  return (
    <div className="space-y-4">
      <Sec icon="person" text="Personal Information" />

      <div>
        <Lbl t="Are you an existing Onea Africa customer?" req />
        <div className="flex gap-3 mt-1">
          <Radio label="Yes" selected={d.isExistingCustomer === 'yes'} onSelect={() => s('isExistingCustomer', 'yes')} />
          <Radio label="No"  selected={d.isExistingCustomer === 'no'}  onSelect={() => s('isExistingCustomer', 'no')} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Lbl t="Full Names" req /><input value={d.fullName} onChange={e=>s('fullName',e.target.value)} className={inp} placeholder="As per ID document" /></div>
        <div><Lbl t="ID / Passport Number" req /><input value={d.idNumber} onChange={e=>s('idNumber',e.target.value)} className={inp} placeholder="SA ID (13 digits) or passport" /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Lbl t="Mobile Number" req /><input value={d.mobile} onChange={e=>s('mobile',e.target.value)} className={inp} placeholder="+27 60 000 0000" type="tel" /></div>
        <div><Lbl t="Alternative Number" /><input value={d.altNumber} onChange={e=>s('altNumber',e.target.value)} className={inp} placeholder="+27 11 000 0000" type="tel" /></div>
      </div>

      <div><Lbl t="Email Address" req /><input value={d.email} onChange={e=>s('email',e.target.value)} className={inp} placeholder="you@email.com" type="email" /></div>

      <Sec icon="home" text="Address Details" />

      <div><Lbl t="Physical Address" req />
        <textarea value={d.physicalAddress} onChange={e=>s('physicalAddress',e.target.value)} className={`${inp} resize-none`} rows={2} placeholder="Street, Suburb, City, Province, Postal Code" />
      </div>
      <div><Lbl t="Postal Address" />
        <textarea value={d.postalAddress} onChange={e=>s('postalAddress',e.target.value)} className={`${inp} resize-none`} rows={2} placeholder="Leave blank if same as physical" />
      </div>
      <div><Lbl t="Delivery / Installation Address" />
        <textarea value={d.deliveryAddress} onChange={e=>s('deliveryAddress',e.target.value)} className={`${inp} resize-none`} rows={2} placeholder="Leave blank if same as physical" />
      </div>

      <div>
        <Lbl t="Has coverage been confirmed at your address?" req />
        <div className="flex gap-3 mt-1">
          <Radio label="Yes — confirmed"   selected={d.coverageChecked === 'yes'} onSelect={() => s('coverageChecked', 'yes')} />
          <Radio label="Not yet checked"   selected={d.coverageChecked === 'no'}  onSelect={() => s('coverageChecked', 'no')} />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Employment Details ─────────────────────────────────────────────

function Step2({ d, s }: { d: FD; s: (k: keyof FD, v: string | boolean) => void }) {
  return (
    <div className="space-y-4">
      <Sec icon="business_center" text="Employment Information" />
      <p className="text-[13px] text-gray-500">Used for affordability assessment. If unemployed, enter "Unemployed".</p>

      <div><Lbl t="Employer / Company Name" />
        <input value={d.employerName} onChange={e=>s('employerName',e.target.value)} className={inp} placeholder="Company name or 'Self-employed' / 'Unemployed'" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Lbl t="Employer Contact Number" /><input value={d.employerPhone} onChange={e=>s('employerPhone',e.target.value)} className={inp} placeholder="+27 11 000 0000" type="tel" /></div>
        <div><Lbl t="Employer Address" /><input value={d.employerAddress} onChange={e=>s('employerAddress',e.target.value)} className={inp} placeholder="City or suburb" /></div>
      </div>

      <Sec icon="payments" text="Income Information" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          ['grossIncome', 'Gross Monthly Income', true],
          ['netIncome',   'Net Monthly Income',   true],
          ['householdIncome', 'Household Income', false],
        ] as const).map(([k, l, r]) => (
          <div key={k}>
            <Lbl t={l} req={r} />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[13px]">R</span>
              <input value={d[k] as string} onChange={e=>s(k,e.target.value)} className={`${inp} pl-8`} placeholder="0.00" type="number" min="0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 — Payment Consent + Signature ────────────────────────────────────

function Step3({ d, s, sigRef }: { d: FD; s: (k: keyof FD, v: string | boolean) => void; sigRef: React.RefObject<SigHandle> }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-l-4 bg-amber-50 p-4 border-amber-300">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-amber-600 text-[20px] flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className="font-bold text-amber-800 text-[14px] mb-1">Important — Payment Setup</p>
            <p className="text-[13px] text-amber-700 leading-relaxed">
              Debit order details and supporting documents are compulsory for service activation. A Onea Africa consultant will contact you securely after submission to complete verification and debit order setup.
            </p>
          </div>
        </div>
      </div>

      <Sec icon="verified_user" text="Consent & Acknowledgements" />

      <div className="space-y-3">
        <Check checked={d.ackDebit}    onChange={() => s('ackDebit',    !d.ackDebit)}    text="I acknowledge that debit order details and supporting documentation will be required before service activation." />
        <Check checked={d.debitConsent} onChange={() => s('debitConsent',!d.debitConsent)} text="I consent to Onea Africa initiating a debit order on my nominated bank account once verified." />
        <Check checked={d.procConsent} onChange={() => s('procConsent', !d.procConsent)} text="I consent to electronic processing of my personal information for service application purposes in accordance with POPIA." />
      </div>

      <Sec icon="draw" text="Digital Signature — Sections 1 to 3" />
      <p className="text-[13px] text-gray-500">By signing, you confirm all information in Sections 1–3 is accurate and complete.</p>
      <SigSection sigRef={sigRef} name={d.fullName} date={d.sig1Date} onClear={() => sigRef.current?.clear()} />
    </div>
  );
}

// ─── Step 4 — Service & Package Selection ────────────────────────────────────

function Step4({ d, s, sigRef }: { d: FD; s: (k: keyof FD, v: string | boolean) => void; sigRef: React.RefObject<SigHandle> }) {
  const pkgs = d.serviceType === 'fibre' ? FIBRE : d.serviceType === 'gated' ? GATED : d.serviceType === 'lte' ? LTE : [];

  const pickPkg = (pkg: { name: string; speed: string; price: string }) => {
    s('selectedPackage', `${pkg.name} ${pkg.speed}`);
    s('packagePrice', pkg.price.replace(/\s/g, ''));
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <Sec icon="router" text="Service Type" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([
          { v:'fibre', l:'Fibre',            icon:'settings_ethernet', sub:'Wired home/business fibre' },
          { v:'lte',   l:'LTE / Wireless',   icon:'signal_cellular_alt', sub:'Mobile data packages' },
          { v:'gated', l:'Gated Community',  icon:'location_city',     sub:'CSS estate connections' },
        ]).map(svc => (
          <button key={svc.v} type="button"
            onClick={() => { s('serviceType', svc.v); s('selectedPackage', ''); s('packagePrice', ''); }}
            className={`text-left p-4 rounded-xl border-2 transition-all ${d.serviceType === svc.v ? 'border-[#8CC444] bg-[#8CC444]/8' : 'border-gray-200 hover:border-[#8CC444]/30'}`}>
            <span className={`material-symbols-outlined text-[28px] block mb-1 ${d.serviceType === svc.v ? 'text-[#8CC444]' : 'text-gray-400'}`}>{svc.icon}</span>
            <p className={`font-bold text-[15px] ${d.serviceType === svc.v ? 'text-[#416900]' : 'text-gray-700'}`}>{svc.l}</p>
            <p className="text-[12px] text-gray-500">{svc.sub}</p>
          </button>
        ))}
      </div>

      {d.serviceType && (
        <>
          <Sec icon="inventory_2" text={`${d.serviceType === 'fibre' ? 'Fibre' : d.serviceType === 'lte' ? 'LTE' : 'Gated Community'} Packages`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pkgs.map((p, i) => (
              <PkgCard key={i} name={p.name} speed={p.speed} price={p.price}
                selected={d.selectedPackage === `${p.name} ${p.speed}`}
                onSelect={() => pickPkg(p)} />
            ))}
          </div>
        </>
      )}

      <Sec icon="event" text="Activation Preferences" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Lbl t="Preferred Activation Date" req />
          <input type="date" value={d.activationDate} onChange={e=>s('activationDate',e.target.value)} className={inp} min={minDateStr} />
        </div>
      </div>

      <div>
        <Lbl t="Do you have an existing active line?" req />
        <div className="flex gap-3 mt-1">
          <Radio label="Yes" selected={d.hasExistingLine==='yes'} onSelect={()=>s('hasExistingLine','yes')} />
          <Radio label="No"  selected={d.hasExistingLine==='no'}  onSelect={()=>s('hasExistingLine','no')} />
        </div>
      </div>

      <div>
        <Lbl t="Do you require a router / LTE device?" req />
        <div className="flex gap-3 mt-1">
          <Radio label="Yes, I need one"  selected={d.requiresRouter==='yes'} onSelect={()=>s('requiresRouter','yes')} />
          <Radio label="I have my own"    selected={d.requiresRouter==='no'}  onSelect={()=>s('requiresRouter','no')} />
        </div>
      </div>

      <Sec icon="draw" text="Service Selection Signature" />
      <p className="text-[13px] text-gray-500">Your signature confirms the selected package and preferences above.</p>
      <SigSection sigRef={sigRef} name={d.fullName} date={d.sig2Date} onClear={() => sigRef.current?.clear()} />
    </div>
  );
}

// ─── Step 5 — Agreement ───────────────────────────────────────────────────────

function Step5({ d, s, sigRef }: { d: FD; s: (k: keyof FD, v: string | boolean) => void; sigRef: React.RefObject<SigHandle> }) {
  return (
    <div className="space-y-4">
      <Sec icon="gavel" text="Service Agreement Terms" />

      <div className="space-y-3">
        {([
          { icon:'receipt_long',  title:'Service Agreement',      text:'This application constitutes a service agreement between you and Onea Africa (Pty) Ltd for the provision of internet connectivity via the Telkom network infrastructure.' },
          { icon:'payment',       title:'Debit Order Obligation', text:'Monthly fees are payable in advance by debit order. Failed payments may result in service suspension. A reconnection fee applies. You accept the debit order terms upon signing.' },
          { icon:'cancel',        title:'Cancellation Policy',    text:'A minimum 30-day written cancellation notice is required sent to connect@onea.co.za. Early termination within a contracted period may attract a cancellation penalty as per your signed agreement.' },
          { icon:'privacy_tip',   title:'POPIA Privacy Notice',   text:'Your personal data is processed solely for service delivery, credit assessment, and compliance. Data is stored securely and not shared with third parties. You may request access or correction at any time.' },
        ] as const).map(t => (
          <div key={t.title} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#8CC444] flex-shrink-0 mt-0.5">{t.icon}</span>
              <div>
                <p className="font-bold text-gray-800 text-[14px] mb-1">{t.title}</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">{t.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sec icon="checklist" text="Agreement Confirmations" />

      <div className="space-y-3">
        <Check checked={d.agreeTerms}        onChange={()=>s('agreeTerms',!d.agreeTerms)}               text="I have read and agree to the Onea Africa Service Terms & Conditions." />
        <Check checked={d.agreeDebit}        onChange={()=>s('agreeDebit',!d.agreeDebit)}               text="I understand and accept the debit order obligation and monthly payment terms." />
        <Check checked={d.agreeCancellation} onChange={()=>s('agreeCancellation',!d.agreeCancellation)} text="I accept the cancellation policy including the 30-day written notice requirement." />
        <Check checked={d.agreePOPIA}        onChange={()=>s('agreePOPIA',!d.agreePOPIA)}               text="I consent to Onea Africa processing my personal information as per the POPIA Privacy Notice above." />
      </div>

      {d.selectedPackage && (
        <div className="rounded-xl bg-[#8CC444]/10 border border-[#8CC444]/25 p-4 mt-2">
          <p className="font-bold text-[#416900] text-[14px] mb-3">Application Summary</p>
          <div className="space-y-1.5 text-[13px]">
            {[
              ['Customer',       d.fullName],
              ['ID / Passport',  d.idNumber],
              ['Mobile',         d.mobile],
              ['Package',        d.selectedPackage],
              ['Monthly Fee',    `R ${d.packagePrice}/month`],
              ['Activation',     d.activationDate],
              ['Router Needed',  d.requiresRouter === 'yes' ? 'Yes' : 'No'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className={`font-semibold ${l === 'Monthly Fee' ? 'text-[#8CC444]' : 'text-gray-800'}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Sec icon="draw" text="Final Legally Binding Signature" />
      <p className="text-[13px] text-gray-500">This signature constitutes your full and binding acceptance of all sections of this application.</p>
      <SigSection sigRef={sigRef} name={d.fullName} date={d.sig3Date} onClear={() => sigRef.current?.clear()} />
    </div>
  );
}

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS = [
  { n:1, label:'Your Details', icon:'person' },
  { n:2, label:'Employment',   icon:'business_center' },
  { n:3, label:'Consent',      icon:'verified_user' },
  { n:4, label:'Package',      icon:'router' },
  { n:5, label:'Agreement',    icon:'gavel' },
];

// ─── Main Portal ──────────────────────────────────────────────────────────────

const TLK_DRAFT_KEY = 'onea_tlk_draft';

function buildTelkomMailto(d: FD) {
  const body = [
    `Telkom Application — ${d.fullName}`,
    ``,
    `Full Name: ${d.fullName}`,
    `ID/Passport: ${d.idNumber}`,
    `Mobile: ${d.mobile}`,
    `Email: ${d.email}`,
    `Address: ${d.physicalAddress}`,
    `Package: ${d.selectedPackage} (${d.serviceType}) — R${d.packagePrice}/month`,
    `Activation Date: ${d.activationDate}`,
    ``,
    `Please process this Telkom application. Note: signatures were captured but could not be submitted due to a server error.`,
  ].join('\n');
  return `mailto:sales@onea.co.za?subject=${encodeURIComponent(`Telkom Application — ${d.fullName}`)}&body=${encodeURIComponent(body)}`;
}

export default function TelkomPortal({ onClose }: { onClose: () => void }) {
  const [step, setStep]     = useState(1);
  const [data, setData]     = useState<FD>(() => {
    try {
      const saved = localStorage.getItem(TLK_DRAFT_KEY);
      return saved ? { ...blank, ...JSON.parse(saved) } : { ...blank };
    } catch { return { ...blank }; }
  });
  const [err,      setErr]     = useState('');
  const [drafted,  setDrafted] = useState(false);
  const [busy,     setBusy]    = useState(false);
  const [done,     setDone]    = useState(false);
  const [refId,    setRefId]   = useState('');
  const hasDraft = !!localStorage.getItem(TLK_DRAFT_KEY);

  const sig1 = useRef<SigHandle>(null);
  const sig2 = useRef<SigHandle>(null);
  const sig3 = useRef<SigHandle>(null);

  const set = useCallback((k: keyof FD, v: string | boolean) => {
    setData(p => ({ ...p, [k]: v }));
    setErr('');
  }, []);

  const validate = (): string | null => {
    switch (step) {
      case 1:
        if (!data.fullName.trim())    return 'Full name is required.';
        if (!data.idNumber.trim())    return 'ID or passport number is required.';
        if (!data.mobile.trim())      return 'Mobile number is required.';
        if (!data.email.includes('@'))return 'A valid email address is required.';
        if (!data.physicalAddress.trim()) return 'Physical address is required.';
        if (!data.coverageChecked)    return 'Please indicate whether coverage has been checked.';
        return null;
      case 2:
        if (!data.grossIncome) return 'Gross monthly income is required.';
        if (!data.netIncome)   return 'Net monthly income is required.';
        return null;
      case 3:
        if (!data.ackDebit || !data.debitConsent || !data.procConsent)
          return 'Please accept all consent items before continuing.';
        if (sig1.current?.isEmpty()) return 'Please draw your signature before continuing.';
        return null;
      case 4:
        if (!data.serviceType)     return 'Please select a service type.';
        if (!data.selectedPackage) return 'Please select a package.';
        if (!data.activationDate)  return 'Please select a preferred activation date.';
        if (!data.hasExistingLine) return 'Please indicate whether you have an existing line.';
        if (!data.requiresRouter)  return 'Please indicate whether you need a router.';
        if (sig2.current?.isEmpty()) return 'Please sign to confirm your package selection.';
        return null;
      case 5:
        if (!data.agreeTerms || !data.agreeDebit || !data.agreeCancellation || !data.agreePOPIA)
          return 'Please confirm all agreement items before submitting.';
        if (sig3.current?.isEmpty()) return 'Please provide your final signature.';
        return null;
      default: return null;
    }
  };

  const next = async () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr('');
    if (step < 5) { setStep(s => s + 1); return; }
    await submit();
  };

  const submit = async () => {
    setBusy(true);
    setErr('');

    const payload = {
      ...data,
      sig1: sig1.current?.toDataURL() ?? '',
      sig2: sig2.current?.toDataURL() ?? '',
      sig3: sig3.current?.toDataURL() ?? '',
    };

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35000);

    // Wake up backend first
    try { await fetch('https://onea-africa-backend.onrender.com/api/health'); } catch { /* ignore */ }

    try {
      const res  = await fetch('https://onea-africa-backend.onrender.com/api/telkom-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');
      localStorage.removeItem(TLK_DRAFT_KEY);
      setRefId(result.id ?? '');
      setDone(true);
    } catch (err: unknown) {
      clearTimeout(timer);
      // Save draft (without large signature data)
      try {
        const { ...draftData } = data;
        localStorage.setItem(TLK_DRAFT_KEY, JSON.stringify(draftData));
      } catch { /* quota */ }
      setDrafted(true);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('aborted') || msg.toLowerCase().includes('failed to fetch'))
        setErr('Server unreachable — your details have been saved as a draft.');
      else setErr(msg || 'Something went wrong — your details have been saved as a draft.');
    } finally {
      setBusy(false);
    }
  };

  // Success screen
  if (done) return (
    <div className="fixed inset-0 z-[80] bg-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full bg-[#8CC444]/15 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[52px] text-[#8CC444]" style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-[26px] font-extrabold text-gray-800 mb-2">Application Submitted!</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-5">
          Thank you, <strong>{data.fullName}</strong>. Your Telkom service application has been received successfully.
        </p>
        {refId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Application Reference</p>
            <p className="font-bold text-gray-800 text-[18px]">{refId}</p>
          </div>
        )}
        <div className="bg-[#8CC444]/10 rounded-xl p-4 mb-5 border border-[#8CC444]/20 text-left">
          <div className="flex gap-2 mb-2">
            <span className="material-symbols-outlined text-[#8CC444] text-[18px]">mail</span>
            <p className="text-[13px] text-[#416900] font-semibold">Confirmation emailed to {data.email}</p>
          </div>
          <p className="text-[12px] text-[#416900]/80 leading-relaxed ml-6">
            A consultant will contact you within <strong>1–2 business days</strong> to complete verification and debit order setup.
          </p>
        </div>
        <p className="text-[12px] text-gray-400 mb-6">Urgent? WhatsApp us on <strong>+27 69 464 4663</strong></p>
        <button onClick={onClose} className="w-full py-4 rounded-full font-bold text-white text-[16px] transition-opacity hover:opacity-90" style={{ backgroundColor:'#8CC444' }}>
          Done
        </button>
      </motion.div>
    </div>
  );

  const info = STEPS[step - 1];

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Onea Africa" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block leading-tight">
              <p className="text-[11px] text-gray-400">Telkom Service Application</p>
              <p className="text-[14px] font-bold text-gray-800">{info.label}</p>
            </div>
          </div>

          {/* Desktop step pills */}
          <div className="hidden lg:flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  step === s.n ? 'bg-[#8CC444] text-white' :
                  step >  s.n ? 'bg-[#8CC444]/15 text-[#416900]' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.n
                    ? <span className="material-symbols-outlined text-[13px]">check</span>
                    : <span className="text-[11px] font-bold">{s.n}</span>
                  }
                  <span>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-0.5 mx-0.5 ${step > s.n ? 'bg-[#8CC444]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <button onClick={onClose} aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
        </div>

        {/* Mobile progress */}
        <div className="lg:hidden">
          <div className="h-1 bg-gray-100">
            <div className="h-full transition-all duration-500" style={{ width:`${(step/5)*100}%`, backgroundColor:'#8CC444' }} />
          </div>
          <div className="flex justify-between px-4 py-2">
            <span className="text-[12px] text-gray-400">Step {step} of 5</span>
            <span className="text-[12px] font-bold text-[#8CC444]">{info.label}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-24 }} transition={{ duration:0.18, ease:'easeOut' }}>
              {step===1 && <Step1 d={data} s={set} />}
              {step===2 && <Step2 d={data} s={set} />}
              {step===3 && <Step3 d={data} s={set} sigRef={sig1} />}
              {step===4 && <Step4 d={data} s={set} sigRef={sig2} />}
              {step===5 && <Step5 d={data} s={set} sigRef={sig3} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-8 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {hasDraft && !err && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-2 mb-3 text-[12px]">
            <span className="material-symbols-outlined text-[15px] flex-shrink-0">restore</span>
            Draft restored — your previous details have been loaded.
          </div>
        )}
        {err && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-3 text-[13px]">
            <div className="flex items-center gap-2 text-red-700">
              <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
              {err}
            </div>
            {drafted && (
              <a
                href={buildTelkomMailto(data)}
                className="inline-flex items-center gap-1 mt-1.5 ml-6 text-[12px] font-semibold text-[#8CC444] underline"
              >
                <span className="material-symbols-outlined text-[13px]">mail</span>
                Send details via email instead
              </a>
            )}
          </div>
        )}
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button type="button" onClick={step===1 ? onClose : () => { setErr(''); setStep(s=>s-1); }}
            className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-semibold text-[14px] hover:border-gray-300 transition-all flex-shrink-0">
            <span className="material-symbols-outlined text-[17px]">{step===1 ? 'close' : 'arrow_back'}</span>
            {step===1 ? 'Cancel' : 'Back'}
          </button>
          <button type="button" onClick={next} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold text-white text-[15px] disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ backgroundColor:'#8CC444' }}>
            {busy ? (
              <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Submitting...</>
            ) : step===5 ? (
              <><span className="material-symbols-outlined text-[18px]">send</span> Submit Application</>
            ) : (
              <>Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
