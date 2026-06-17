import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignaturePad, { SigHandle } from './SignaturePad';
import { trackLeadConversion, trackOneaEvent } from '../../lib/marketing';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FD {
  // Step 1
  isExistingCustomer: string; fullName: string; idNumber: string;
  mobile: string; altNumber: string; email: string;
  physicalAddress: string; postalAddress: string; deliveryAddress: string; gpsCoordinates: string;
  leadArea: string; premisesType: string; premisesOwnAddress: string;
  postalSameAsPhysical: boolean; deliverySameAsPhysical: boolean;
  coverageChecked: string;
  // Step 2
  employerName: string; employerPhone: string; employerAddress: string;
  grossIncome: string; netIncome: string; totalExpenses: string; householdIncome: string;
  // Step 3
  bank: string; branchName: string; branchCode: string; accountHolderName: string;
  accountNumber: string; accountType: string; debitDate: string;
  ackDebit: boolean; debitConsent: boolean; procConsent: boolean; sig1Date: string; sig1Data: string;
  // Step 4
  serviceType: string; selectedPackage: string; packagePrice: string;
  activationDate: string; hasExistingLine: string; requiresRouter: string; sig2Date: string; sig2Data: string;
  // Step 5
  agreeTerms: boolean; sig3Date: string; sig3Data: string;
}

type PackageCardData = {
  isp: string;
  planName: string;
  speed: string;
  price: string;
  detail?: string;
  contract?: string;
  note?: string;
  badge?: string;
  badgeTone?: 'red';
};

type PackageGroup = {
  id: string;
  label: string;
  description: string;
  packages: PackageCardData[];
};

const today = new Date().toLocaleDateString('en-ZA');

const blank: FD = {
  isExistingCustomer:'', fullName:'', idNumber:'', mobile:'', altNumber:'', email:'',
  physicalAddress:'', postalAddress:'', deliveryAddress:'', gpsCoordinates:'', postalSameAsPhysical:false, deliverySameAsPhysical:false, coverageChecked:'',
  leadArea:'', premisesType:'', premisesOwnAddress:'',
  employerName:'', employerPhone:'', employerAddress:'', grossIncome:'', netIncome:'', totalExpenses:'', householdIncome:'',
  bank:'', branchName:'', branchCode:'', accountHolderName:'', accountNumber:'', accountType:'', debitDate:'',
  ackDebit:false, debitConsent:false, procConsent:false, sig1Date:today, sig1Data:'',
  serviceType:'', selectedPackage:'', packagePrice:'', activationDate:'', hasExistingLine:'', requiresRouter:'', sig2Date:today, sig2Data:'',
  agreeTerms:false, sig3Date:today, sig3Data:'',
};

// ─── Package data ─────────────────────────────────────────────────────────────

const PACKAGE_GROUPS: PackageGroup[] = [
  {
    id: 'metro',
    label: 'MetroFibre',
    description: 'Telkom UnlimitedHome Lite. 12-month contract. Includes uncapped data with no FUP or throttling, router included, and installation included subject to 12-month active service.',
    packages: [
      ['30/30', '529'], ['40/40', '579'], ['50/50', '615'], ['60/60', '759'], ['80/80', '715'], ['100/100', '869'], ['150/150', '949'], ['250/250', '979'], ['500/500', '1229'],
    ].map(([speed, price]) => ({ isp: 'Telkom', planName: 'UnlimitedHome Lite', speed: `${speed} Mbps`, price, note: speed === '500/500' ? 'Selected areas only' : undefined })),
  },
  {
    id: 'openserve',
    label: 'Openserve',
    description: 'Telkom Fibre over Openserve. Easy Connect and equivalent-speed Prepaid Compact Fibre offers are subject to infrastructure and network coverage availability. Easy Connect and Prepaid Compact Fibre use a Wi-Fi-enabled ONT, so no separate router is required. Current 12-month Stream Connect offers include installation and a router. Contract packages remain subject to credit vetting.',
    packages: [
      { isp: 'Telkom', planName: 'Easy Connect Fibre', speed: '10/5 Mbps', price: '309', contract: '12 months', note: 'Openserve uncapped data. No separate router is provided or required: the Wi-Fi-enabled ONT works in place of the router. Available only where Openserve Web Connect infrastructure is available. Subject to credit vetting.', badge: 'Best seller - New', badgeTone: 'red' },
      ['Easy Connect Fibre', '20/10', '345'], ['Easy Connect Fibre', '40/20', '425'],
      ['Prepaid Compact Fibre', '20/10', '349'], ['Prepaid Compact Fibre', '25/25', '499'], ['Prepaid Compact Fibre', '50/25', '700'],
      ['Stream Connect Fibre', '50/25', '695'], ['Stream Connect Fibre', '100/50', '895'], ['Stream Connect Fibre', '200/100', '1299'],
      ['Fibre', '50/25', '654.75'], ['Fibre', '50/50', '764.75'], ['Fibre', '100/50', '854.75'], ['Fibre', '100/100', '984.75'], ['Fibre', '200/100', '1258.75'], ['Fibre', '200/200', '1324.75'], ['Fibre', '300/150', '1488.75'], ['Fibre', '500/250', '1658.75'],
    ].map(pkg => Array.isArray(pkg)
      ? ({
          isp: 'Telkom',
          planName: pkg[0],
          speed: `${pkg[1]} Mbps`,
          price: pkg[2],
          contract: pkg[0] === 'Prepaid Compact Fibre' ? '30 days' : '12 months',
          note: pkg[0] === 'Easy Connect Fibre'
            ? 'No separate router is provided or required: the Wi-Fi-enabled ONT works in place of the router. Available only where Openserve Web Connect infrastructure is available. Subject to credit vetting.'
            : pkg[0] === 'Prepaid Compact Fibre'
              ? 'No separate router is required. The service includes a Wi-Fi-enabled ONT. Available only where Openserve infrastructure supports this prepaid speed.'
              : pkg[0] === 'Stream Connect Fibre'
                ? 'Runs over the Openserve Fibre Connect footprint. The current 12-month offer includes installation and a router. Subject to infrastructure and network coverage availability and credit vetting.'
              : 'Subject to credit vetting.',
        })
      : pkg
    ),
  },
  {
    id: 'vumatel',
    label: 'Vumatel',
    description: 'Telkom UnlimitedHome. 12-month contract. Available in all Vumatel fibre areas. Includes uncapped data with no FUP or throttling, router included, and installation included subject to 12-month active service.',
    packages: [
      ['30/30', '495'], ['50/25', '695'], ['50/50', '810'], ['100/50', '879'], ['100/100', '960'], ['200/200', '1169'], ['500/200', '1375'], ['1000/250', '1460'],
    ].map(([speed, price]) => ({ isp: 'Telkom', planName: 'UnlimitedHome', speed: `${speed} Mbps`, price })),
  },
  {
    id: 'lte',
    label: 'LTE',
    description: "Telkom LTE delivers mobile broadband across South Africa's Telkom network. Standard and unlimited plans run on a 24-month contract. The 2TB data plan is month-to-month. Night Surfer data is available between 12:00am and 7:00am only.",
    packages: [
      { isp: 'Telkom', planName: 'LTE SIM-only', speed: '25GB total', detail: '12.5GB anytime + 12.5GB Night Surfer', price: '109', note: 'HUAWEI E5576 router add-on: +R20 PM x24' },
      { isp: 'Telkom', planName: 'LTE SIM-only', speed: '45GB total', detail: '22.5GB anytime + 22.5GB Night Surfer', price: '139', note: 'HUAWEI E5576 router add-on: +R20 PM x24' },
      { isp: 'Telkom', planName: 'LTE SIM-only', speed: '80GB total', detail: '40GB anytime + 40GB Night Surfer', price: '179', note: 'HUAWEI E5576 router add-on: +R20 PM x24' },
      { isp: 'Telkom', planName: 'LTE SIM-only', speed: '160GB total', detail: '80GB anytime + 80GB Night Surfer', price: '229', note: 'Router options: Smart Router +R89 PM | HUAWEI B535 CAT7 +R90 PM | D-Link CAT6 +R90 PM' },
      { isp: 'Telkom', planName: 'LTE SIM-only', speed: '240GB total', detail: '120GB anytime + 120GB Night Surfer', price: '299', note: 'Router options: Smart Router +R89 PM | HUAWEI B535 CAT7 +R90 PM | D-Link CAT6 +R90 PM' },
      { isp: 'Telkom', planName: 'LTE SIM-only', speed: '360GB total', detail: '180GB anytime + 180GB Night Surfer', price: '399', note: 'Router options: Smart Router +R89 PM | HUAWEI B535 CAT7 +R90 PM | D-Link CAT6 +R90 PM' },
      { isp: 'Telkom', planName: 'Unlimited LTE', speed: '10 Mbps', detail: '100GB max speed, next 20GB at 4Mbps, thereafter 2Mbps', price: '299', note: 'D-Link CAT6 or HUAWEI B535 CAT7 +R90 PM x24' },
      { isp: 'Telkom', planName: 'Unlimited LTE', speed: '20 Mbps', detail: '500GB max speed, next 50GB at 4Mbps, thereafter 2Mbps', price: '449', note: 'D-Link CAT6 or HUAWEI B535 CAT7 +R90 PM x24' },
      { isp: 'Telkom', planName: 'Unlimited LTE', speed: '30 Mbps', detail: '600GB max speed, next 50GB at 4Mbps, thereafter 2Mbps', price: '599', note: 'D-Link CAT6 or HUAWEI B535 CAT7 +R90 PM x24' },
      { isp: 'Telkom', planName: 'LTE Data Plan', speed: '2TB per month', detail: 'Fastest available speed. No FUP. Full 2TB at max speed.', price: '749', contract: 'Month-to-month', note: 'D-Link CAT6 or HUAWEI B535 CAT7 +R90 PM x24' },
    ],
  },
].sort((a, b) => {
  const order = ['openserve', 'lte', 'metro', 'vumatel'];
  return order.indexOf(a.id) - order.indexOf(b.id);
});

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
    <label onClick={onChange} className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
          checked ? 'bg-[#8CC444] border-[#8CC444]' : 'border-gray-300 group-hover:border-[#8CC444]/50'}`}>
        {checked && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
      </div>
      <span className="text-[14px] text-gray-700 leading-relaxed">{text}</span>
    </label>
  );
}

function PkgCard({ pkg, selected, onSelect }:
  { pkg: PackageCardData; selected: boolean; onSelect: () => void }) {
  const speedLine = pkg.detail || pkg.speed.replace(' Mbps', ' Mbps');
  return (
    <button type="button" onClick={onSelect}
      className={`text-left p-4 rounded-xl border-2 transition-all relative bg-white text-gray-800 shadow-sm ${
        selected ? 'border-[#8CC444] ring-2 ring-[#8CC444]/20' : 'border-[#00AEEF]/25 hover:border-[#00AEEF]'}`}>
      {selected && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#8CC444] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[13px]">check</span>
        </span>
      )}
      {pkg.badge && (
        <span className="mb-2 inline-flex rounded-full bg-red-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
          {pkg.badge}
        </span>
      )}
      <p className="text-[15px] font-extrabold leading-tight pr-7">{pkg.isp} {pkg.planName} {pkg.speed}</p>
      <p className="text-[12px] text-gray-600 mt-1">{speedLine}</p>
      <p className="text-[17px] font-bold mt-2" style={{ color: '#8CC444' }}>R{pkg.price}<span className="text-[11px] font-normal text-gray-500">/month</span></p>
      {(pkg.contract || pkg.note) && (
        <p className="text-[11px] text-gray-500 mt-2 leading-snug">{pkg.contract ? `${pkg.contract}. ` : ''}{pkg.note}</p>
      )}
    </button>
  );
}

function SigSection({ sigRef, name, date, onClear, value, onValueChange }: {
  sigRef: React.RefObject<SigHandle>; name: string; date: string; onClear: () => void;
  value?: string; onValueChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-500">Sign in the box below</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => sigRef.current?.adopt(name, date)}
            className="text-[12px] font-semibold text-[#D6139F] hover:text-[#8CC444] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">edit_note</span> Adopt
          </button>
          <button type="button" onClick={onClear}
            className="text-[12px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">refresh</span> Clear
          </button>
        </div>
      </div>
      <SignaturePad ref={sigRef} value={value} onValueChange={onValueChange} />
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
        <Lbl t="Are you an existing Telkom customer?" req />
        <div className="flex gap-3 mt-1">
          <Radio label="Yes" selected={d.isExistingCustomer === 'yes'} onSelect={() => s('isExistingCustomer', 'yes')} />
          <Radio label="No"  selected={d.isExistingCustomer === 'no'}  onSelect={() => s('isExistingCustomer', 'no')} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Lbl t="Full Names" req /><input data-field="fullName" value={d.fullName} onChange={e=>s('fullName',e.target.value)} className={inp} placeholder="As per ID document" /></div>
        <div><Lbl t="ID / Passport Number" req /><input data-field="idNumber" value={d.idNumber} onChange={e=>s('idNumber',e.target.value)} className={inp} placeholder="SA ID (13 digits) or passport" /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Lbl t="Mobile Number" req /><input data-field="mobile" value={d.mobile} onChange={e=>s('mobile',e.target.value)} className={inp} placeholder="+27 60 000 0000" type="tel" /></div>
        <div><Lbl t="Alternative Number" /><input value={d.altNumber} onChange={e=>s('altNumber',e.target.value)} className={inp} placeholder="+27 11 000 0000" type="tel" /></div>
      </div>

      <div><Lbl t="Email Address" req /><input data-field="email" value={d.email} onChange={e=>s('email',e.target.value)} className={inp} placeholder="you@email.com" type="email" /></div>

      <Sec icon="home" text="Address Details" />

      <div><Lbl t="Area / Township / Town" req />
        <input data-field="leadArea" value={d.leadArea} onChange={e=>s('leadArea',e.target.value)} className={inp} placeholder="e.g. Soshanguve, Centurion or Midrand" />
      </div>
      <div><Lbl t="Physical Address" req />
        <textarea data-field="physicalAddress" value={d.physicalAddress} onChange={e=>s('physicalAddress',e.target.value)} className={`${inp} resize-none`} rows={3} placeholder={"Unit / stand number, street name and number\nSuburb, city and postal code"} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Lbl t="Installation Premises Type" req />
          <select data-field="premisesType" value={d.premisesType} onChange={e=>s('premisesType',e.target.value)} className={inp}>
            <option value="">Select premises type</option>
            <option value="main-house">Main house / standalone property</option>
            <option value="apartment-unit">Apartment / complex unit</option>
            <option value="cottage">Cottage</option>
            <option value="backroom">Backroom</option>
            <option value="granny-flat">Granny flat</option>
            <option value="business-premises">Business premises</option>
            <option value="other-secondary-dwelling">Other secondary dwelling</option>
          </select>
        </div>
        <div>
          <Lbl t="Does this unit have its own recognized street address?" req />
          <div data-field="premisesOwnAddress" className="flex flex-wrap gap-3 mt-1">
            <Radio label="Yes" selected={d.premisesOwnAddress === 'yes'} onSelect={() => s('premisesOwnAddress', 'yes')} />
            <Radio label="No / unsure" selected={d.premisesOwnAddress === 'no'} onSelect={() => s('premisesOwnAddress', 'no')} />
          </div>
        </div>
      </div>
      {['cottage', 'backroom', 'granny-flat', 'other-secondary-dwelling'].includes(d.premisesType) && d.premisesOwnAddress === 'no' && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-800">
          Onea Africa may need to request address creation before the application can be provisioned.
        </div>
      )}
      <div><Lbl t="GPS Coordinates" />
        <input value={d.gpsCoordinates} onChange={e=>s('gpsCoordinates',e.target.value)} className={inp} placeholder="-25.7479, 28.2293" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <Lbl t="Postal Address" req={!d.postalSameAsPhysical} />
          <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
            <input type="checkbox" checked={d.postalSameAsPhysical} onChange={e=>s('postalSameAsPhysical',e.target.checked)} className="accent-[#D6139F]" />
            Adopt physical address
          </label>
        </div>
        <textarea data-field="postalAddress" value={d.postalSameAsPhysical ? d.physicalAddress : d.postalAddress} disabled={d.postalSameAsPhysical} onChange={e=>s('postalAddress',e.target.value)} className={`${inp} resize-none disabled:opacity-70`} rows={3} placeholder={"Unit/Stand) Street name and no.\n(Suburb City"} />
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <Lbl t="Delivery / Installation Address" req={!d.deliverySameAsPhysical} />
          <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
            <input type="checkbox" checked={d.deliverySameAsPhysical} onChange={e=>s('deliverySameAsPhysical',e.target.checked)} className="accent-[#D6139F]" />
            Adopt physical address
          </label>
        </div>
        <textarea data-field="deliveryAddress" value={d.deliverySameAsPhysical ? d.physicalAddress : d.deliveryAddress} disabled={d.deliverySameAsPhysical} onChange={e=>s('deliveryAddress',e.target.value)} className={`${inp} resize-none disabled:opacity-70`} rows={3} placeholder={"Unit/Stand) Street name and no.\n(Suburb City"} />
      </div>

      <div>
        <Lbl t="Has coverage been confirmed at your address?" req />
        <div data-field="coverageChecked" className="flex gap-3 mt-1">
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

      <Sec icon="payments" text="Expenses & Household Income" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {([
          ['grossIncome', 'Gross Monthly Income', true],
          ['netIncome',   'Net Monthly Income',   true],
          ['totalExpenses', 'Total Monthly Expenses', true],
          ['householdIncome', 'Household Income', false],
        ] as const).map(([k, l, r]) => (
          <div key={k}>
            <Lbl t={l} req={r} />
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[13px]">R</span>
              <input data-field={k} value={d[k] as string} onChange={e=>s(k,e.target.value)} className={`${inp} pl-8`} placeholder="0.00" type="number" min="0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 — Payment Consent + Signature ────────────────────────────────────

function Step3({ d, s, sigRef, assisted = false }: { d: FD; s: (k: keyof FD, v: string | boolean) => void; sigRef: React.RefObject<SigHandle>; assisted?: boolean }) {
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

      <div data-field="paymentConsent" className="space-y-3">
        <Check checked={d.ackDebit}    onChange={() => s('ackDebit',    !d.ackDebit)}    text="I acknowledge that debit order details and supporting documentation will be required before service activation." />
        <Check checked={d.debitConsent} onChange={() => s('debitConsent',!d.debitConsent)} text="I consent to Onea Africa initiating a debit order on my nominated bank account once verified." />
        <Check checked={d.procConsent} onChange={() => s('procConsent', !d.procConsent)} text="I consent to electronic processing of my personal information for service application purposes in accordance with POPIA." />
      </div>

      <Sec icon="account_balance" text="Bank Account Details" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Lbl t="Bank" req /><input data-field="bank" value={d.bank} onChange={e=>s('bank',e.target.value)} className={inp} placeholder="FNB, ABSA, Standard Bank..." /></div>
        <div><Lbl t="Branch Name" /><input data-field="branchName" value={d.branchName} onChange={e=>s('branchName',e.target.value)} className={inp} placeholder="Branch name" /></div>
        <div><Lbl t="Branch Code" /><input data-field="branchCode" value={d.branchCode} onChange={e=>s('branchCode',e.target.value)} className={inp} placeholder="250655" inputMode="numeric" /></div>
        <div><Lbl t="Account Holder Name" req /><input data-field="accountHolderName" value={d.accountHolderName} onChange={e=>s('accountHolderName',e.target.value)} className={inp} placeholder="Name on bank account" /></div>
        <div><Lbl t="Account Number" /><input data-field="accountNumber" value={d.accountNumber} onChange={e=>s('accountNumber',e.target.value)} className={inp} placeholder="Account number" inputMode="numeric" /></div>
        <div>
          <Lbl t="Account Type" req />
          <div data-field="accountType" className="flex flex-wrap gap-3">
            {['Cheque', 'Savings', 'Transmission'].map(type => (
              <Radio key={type} label={type} selected={d.accountType === type} onSelect={() => s('accountType', type)} />
            ))}
          </div>
        </div>
        <div>
          <Lbl t="Preferred Debit Date" req />
          <select data-field="debitDate" value={d.debitDate} onChange={e=>s('debitDate',e.target.value)} className={inp}>
            <option value="">Select debit date</option>
            <option value="5th">5th</option>
            <option value="15th">15th</option>
            <option value="20th">20th</option>
            <option value="25th">25th</option>
            <option value="Last day of the month">Last day of the month</option>
          </select>
        </div>
      </div>

      {assisted ? (
        <div className="rounded-xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4 text-[13px] text-gray-700">
          The client will sign this payment authorisation from the secure signature request link.
        </div>
      ) : (
        <>
          <Sec icon="draw" text="Digital Signature — Sections 1 to 3" />
          <p className="text-[13px] text-gray-500">By signing, you confirm all information in Sections 1–3 is accurate and complete.</p>
          <div data-field="sig1"><SigSection sigRef={sigRef} name={d.fullName} date={d.sig1Date} value={d.sig1Data} onValueChange={(value) => s('sig1Data', value)} onClear={() => sigRef.current?.clear()} /></div>
        </>
      )}
    </div>
  );
}

// ─── Step 4 — Service & Package Selection ────────────────────────────────────

function Step4({ d, s, sigRef, assisted = false, collectSignature = true }: { d: FD; s: (k: keyof FD, v: string | boolean) => void; sigRef: React.RefObject<SigHandle>; assisted?: boolean; collectSignature?: boolean }) {
  const activeGroup = PACKAGE_GROUPS.find(group => group.id === d.serviceType) || null;
  const selectedPackage = activeGroup?.packages.find(pkg => d.selectedPackage === `${pkg.isp} ${pkg.planName} ${pkg.speed}`) || null;
  const usesWifiOnt = selectedPackage?.planName === 'Easy Connect Fibre' || selectedPackage?.planName === 'Prepaid Compact Fibre';
  const includesRouter = selectedPackage?.planName === 'Stream Connect Fibre';

  const pickPkg = (pkg: PackageCardData) => {
    s('selectedPackage', `${pkg.isp} ${pkg.planName} ${pkg.speed}`);
    s('packagePrice', pkg.price.replace(/\s/g, ''));
    if (pkg.planName === 'Easy Connect Fibre' || pkg.planName === 'Prepaid Compact Fibre') {
      s('requiresRouter', 'no');
    } else if (pkg.planName === 'Stream Connect Fibre') {
      s('requiresRouter', 'yes');
    }
    trackOneaEvent('package_selected', {
      form: 'telkom_application',
      capture_mode: assisted ? 'assisted' : 'direct',
      service_type: activeGroup?.id || '',
      isp_partner: pkg.isp,
      plan_name: pkg.planName,
      speed: pkg.speed,
      monthly_value: pkg.price.replace(/\s/g, ''),
    });
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <Sec icon="router" text="Choose FNO / LTE Network" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PACKAGE_GROUPS.map(group => (
          <button key={group.id} type="button"
            data-field="serviceType"
            onClick={() => { s('serviceType', group.id); s('selectedPackage', ''); s('packagePrice', ''); }}
            className={`text-left p-4 rounded-xl border-2 transition-all bg-white ${
              d.serviceType === group.id ? 'border-[#8CC444] bg-[#8CC444]/8' : 'border-gray-200 hover:border-[#00AEEF]/60'
            }`}>
            <span className={`material-symbols-outlined text-[26px] block mb-1 ${d.serviceType === group.id ? 'text-[#8CC444]' : 'text-[#00AEEF]'}`}>
              {group.id === 'lte' ? 'signal_cellular_alt' : 'settings_ethernet'}
            </span>
            <p className={`font-bold text-[15px] ${d.serviceType === group.id ? 'text-[#416900]' : 'text-gray-800'}`}>{group.label}</p>
            <p className="text-[11px] text-gray-500">{group.id === 'lte' ? 'Mobile broadband' : 'Fibre packages'}</p>
          </button>
        ))}
      </div>

      {activeGroup && (
        <>
          <Sec icon="inventory_2" text={`${activeGroup.label} Packages`} />
          <div className="rounded-xl border border-[#00AEEF]/20 bg-[#00AEEF]/5 p-4">
            <p className="text-[13px] text-gray-700 leading-relaxed">{activeGroup.description}</p>
          </div>
          <div data-field="selectedPackage" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeGroup.packages.map((p, i) => (
              <PkgCard key={`${activeGroup.id}-${i}`} pkg={p}
                selected={d.selectedPackage === `${p.isp} ${p.planName} ${p.speed}`}
                onSelect={() => pickPkg(p)} />
            ))}
          </div>
        </>
      )}

      <Sec icon="event" text="Activation Preferences" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Lbl t="Preferred Activation Date" req />
          <input data-field="activationDate" type="date" value={d.activationDate} onChange={e=>s('activationDate',e.target.value)} className={inp} min={minDateStr} />
          <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">
            This is a preferred date only. Activation is subject to delivery, installation, site inspection, and network availability.
          </p>
        </div>
      </div>

      <div>
        <Lbl t="Do you have an existing active line?" req />
        <div data-field="hasExistingLine" className="flex gap-3 mt-1">
          <Radio label="Yes" selected={d.hasExistingLine==='yes'} onSelect={()=>s('hasExistingLine','yes')} />
          <Radio label="No"  selected={d.hasExistingLine==='no'}  onSelect={()=>s('hasExistingLine','no')} />
        </div>
      </div>

      {usesWifiOnt ? (
        <div data-field="requiresRouter" className="rounded-xl border border-[#8CC444]/30 bg-[#8CC444]/10 p-4">
          <p className="text-[13px] font-semibold text-[#416900]">No separate router required</p>
          <p className="mt-1 text-[12px] leading-relaxed text-gray-600">
            This package uses a Wi-Fi-enabled Optical Network Terminal (ONT), which works in place of a separate router.
          </p>
        </div>
      ) : includesRouter ? (
        <div data-field="requiresRouter" className="rounded-xl border border-[#8CC444]/30 bg-[#8CC444]/10 p-4">
          <p className="text-[13px] font-semibold text-[#416900]">Router and installation included</p>
          <p className="mt-1 text-[12px] leading-relaxed text-gray-600">
            The current 12-month Stream Connect offer includes a router and installation, subject to Telkom's product terms and network availability.
          </p>
        </div>
      ) : (
        <div>
          <Lbl t="Do you require a router / LTE device?" req />
          <div data-field="requiresRouter" className="flex gap-3 mt-1">
            <Radio label="Yes, I need one"  selected={d.requiresRouter==='yes'} onSelect={()=>s('requiresRouter','yes')} />
            <Radio label="I have my own"    selected={d.requiresRouter==='no'}  onSelect={()=>s('requiresRouter','no')} />
          </div>
        </div>
      )}

      {!collectSignature ? (
        <div className="rounded-xl border border-[#8CC444]/25 bg-[#8CC444]/10 p-4 text-[13px] text-gray-700">
          Choose the best package first. You will confirm this selected service with your signature on the final agreement step.
        </div>
      ) : assisted ? (
        <div className="rounded-xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4 text-[13px] text-gray-700">
          The client will sign the service selection from the secure signature request link.
        </div>
      ) : (
        <>
          <Sec icon="draw" text="Service Selection Signature" />
          <p className="text-[13px] text-gray-500">Your signature confirms the selected package and preferences above.</p>
          <div data-field="sig2"><SigSection sigRef={sigRef} name={d.fullName} date={d.sig2Date} value={d.sig2Data} onValueChange={(value) => s('sig2Data', value)} onClear={() => sigRef.current?.clear()} /></div>
        </>
      )}
    </div>
  );
}

// ─── Step 5 — Agreement ───────────────────────────────────────────────────────

function Step5({ d, s, sigRef, serviceSigRef, assisted = false }: { d: FD; s: (k: keyof FD, v: string | boolean) => void; sigRef: React.RefObject<SigHandle>; serviceSigRef: React.RefObject<SigHandle>; assisted?: boolean }) {
  const telkomAgreement = `I, being the undersigned, declare, agree and confirm that:
1. If acting in a representative capacity, I am duly and fully authorised to do so, and I personally indemnify and hold Telkom harmless should it appear that I am not so authorised.
2. The information supplied herein is complete, true and correct as at the date of signature/electronic processing.
3. Electronic processing of this transaction will be binding on me as if I signed a physical application form, upon my online tick-box agreement and submission or telephonic confirmation.
4. I shall be in breach by cancelling any debit order without Telkom's prior written consent, or where a debit order is returned unpaid or stopped. Telkom may suspend my account, appoint collection agencies, and use NAEDO to collect arrears and associated costs.
I am bound to Telkom's standard terms and conditions for fixed-line and mobile services, product-specific terms, spend-limit rules, and any terms published at www.telkom.co.za. I consent to Telkom credit-vetting this application. These terms are available online and may be printed or emailed on request.`;

  return (
    <div className="space-y-4">
      <Sec icon="gavel" text="6. Agreement" />

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-[300px] overflow-y-auto">
        <p className="whitespace-pre-line text-[12px] text-gray-700 leading-relaxed">{telkomAgreement}</p>
      </div>

      <Sec icon="checklist" text="Agreement Confirmation" />

      <div data-field="agreementConsent" className="space-y-3">
        <Check checked={d.agreeTerms} onChange={()=>s('agreeTerms',!d.agreeTerms)} text="I have read, understood, and agree to the Telkom agreement, terms and conditions, debit-order obligations, spend-limit rules, and credit-vetting consent above." />
      </div>

      <div className="rounded-xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4">
        <p className="text-[13px] font-semibold text-gray-700">Terms copy</p>
        <p className="text-[12px] text-gray-600 mt-1">A copy of the completed application and terms confirmation will be emailed to:</p>
        <p className="text-[14px] font-bold text-[#D6139F] mt-2">{d.email || 'Customer email address'}</p>
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

      {assisted ? (
        <div className="rounded-xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4 text-[13px] text-gray-700">
          The client will also confirm the selected service package from the secure signature request link.
        </div>
      ) : (
        <>
          <Sec icon="draw" text="Service Selection Signature" />
          <p className="text-[13px] text-gray-500">
            This signature confirms the package selected above: {d.selectedPackage || 'selected Telkom package'}.
          </p>
          <div data-field="sig2">
            <SigSection sigRef={serviceSigRef} name={d.fullName} date={d.sig2Date} value={d.sig2Data} onValueChange={(value) => s('sig2Data', value)} onClear={() => serviceSigRef.current?.clear()} />
          </div>
        </>
      )}

      {assisted ? (
        <div className="rounded-xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4 text-[13px] text-gray-700">
          The client will complete the final legally binding signature from the secure signature request link.
        </div>
      ) : (
        <>
          <Sec icon="draw" text="Final Legally Binding Signature" />
          <p className="text-[13px] text-gray-500">This signature constitutes your full and binding acceptance of all sections of this application and the Telkom terms above.</p>
          <div data-field="sig3"><SigSection sigRef={sigRef} name={d.fullName} date={d.sig3Date} value={d.sig3Data} onValueChange={(value) => s('sig3Data', value)} onClear={() => sigRef.current?.clear()} /></div>
        </>
      )}
    </div>
  );
}

// ─── Step Config ──────────────────────────────────────────────────────────────

const STEPS = [
  { n:1, label:'Choose Package', icon:'router' },
  { n:2, label:'Your Details',   icon:'person' },
  { n:3, label:'Employment',     icon:'business_center' },
  { n:4, label:'Consent',        icon:'verified_user' },
  { n:5, label:'Agreement',    icon:'gavel' },
];

// ─── Main Portal ──────────────────────────────────────────────────────────────

export default function TelkomPortal({ onClose, assisted = false, authToken = '' }: { onClose: () => void; assisted?: boolean; authToken?: string }) {
  const [step, setStep]   = useState(1);
  const [data, setData]   = useState<FD>({ ...blank });
  const [err,  setErr]    = useState('');
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);
  const [refId, setRefId] = useState('');
  const [doneMessage, setDoneMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [agentName, setAgentName] = useState('');

  const sig1 = useRef<SigHandle>(null);
  const sig2 = useRef<SigHandle>(null);
  const sig3 = useRef<SigHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    titleRef.current?.focus();
    try {
      trackOneaEvent('form_step_navigation', {
        form: 'telkom_application',
        capture_mode: assisted ? 'assisted' : 'direct',
        step,
        step_label: STEPS[step - 1]?.label,
      });
    } catch {
      // Tracking should never block form navigation.
    }
  }, [step]);

  const set = useCallback((k: keyof FD, v: string | boolean) => {
    setData(p => ({ ...p, [k]: v }));
    setErr('');
  }, []);

  const persistCurrentSignature = (currentStep: number) => {
    if (currentStep === 4) {
      const value = data.sig1Data || sig1.current?.toDataURL() || '';
      if (value) setData(p => ({ ...p, sig1Data: value }));
    }
    if (currentStep === 5) {
      const serviceValue = data.sig2Data || sig2.current?.toDataURL() || '';
      const finalValue = data.sig3Data || sig3.current?.toDataURL() || '';
      if (serviceValue || finalValue) {
        setData(p => ({
          ...p,
          ...(serviceValue ? { sig2Data: serviceValue } : {}),
          ...(finalValue ? { sig3Data: finalValue } : {}),
        }));
      }
    }
  };

  const validate = (): string | null => {
    switch (step) {
      case 1:
        if (!data.serviceType)     return 'Please select a service type.';
        if (!data.selectedPackage) return 'Please select a package.';
        if (!data.activationDate)  return 'Please select a preferred activation date.';
        if (!data.hasExistingLine) return 'Please indicate whether you have an existing line.';
        if (!data.requiresRouter)  return 'Please indicate whether you need a router.';
        return null;
      case 2:
        if (assisted && !agentName.trim()) return 'Agent name is required for assisted capture.';
        if (!data.fullName.trim())    return 'Full name is required.';
        if (!data.idNumber.trim())    return 'ID or passport number is required.';
        if (!data.mobile.trim())      return 'Mobile number is required.';
        if (!data.email.includes('@'))return 'A valid email address is required.';
        if (!data.leadArea.trim())    return 'Area / township / town is required.';
        if (!data.physicalAddress.trim()) return 'Physical address is required.';
        if (!data.premisesType) return 'Installation premises type is required.';
        if (!data.premisesOwnAddress) return 'Please indicate whether the unit has its own recognized street address.';
        if (!data.postalSameAsPhysical && !data.postalAddress.trim()) return 'Postal address is required or adopt the physical address.';
        if (!data.deliverySameAsPhysical && !data.deliveryAddress.trim()) return 'Delivery / installation address is required or adopt the physical address.';
        if (!data.coverageChecked)    return 'Please indicate whether coverage has been checked.';
        return null;
      case 3:
        if (!data.grossIncome) return 'Gross monthly income is required.';
        if (!data.netIncome)   return 'Net monthly income is required.';
        if (!data.totalExpenses) return 'Total monthly expenses are required.';
        return null;
      case 4:
        if (!data.bank.trim()) return 'Bank is required.';
        if (!data.accountHolderName.trim()) return 'Account holder name is required.';
        if (!data.accountType) return 'Account type is required.';
        if (!data.debitDate.trim()) return 'Preferred debit date is required.';
        if (!data.ackDebit || !data.debitConsent || !data.procConsent)
          return 'Please accept all consent items before continuing.';
        if (!assisted && !data.sig1Data && sig1.current?.isEmpty()) return 'Please draw your signature before continuing.';
        return null;
      case 5:
        if (!data.agreeTerms)
          return 'Please confirm the Telkom agreement before submitting.';
        if (!assisted && !data.sig2Data && sig2.current?.isEmpty()) return 'Please sign to confirm your package selection.';
        if (!assisted && !data.sig3Data && sig3.current?.isEmpty()) return 'Please provide your final signature.';
        return null;
      default: return null;
    }
  };

  const fieldFromError = (message: string) => {
    if (message.includes('Full name')) return 'fullName';
    if (message.includes('Agent name')) return 'agentName';
    if (message.includes('ID or passport')) return 'idNumber';
    if (message.includes('Mobile')) return 'mobile';
    if (message.includes('email')) return 'email';
    if (message.includes('Area / township')) return 'leadArea';
    if (message.includes('Physical address')) return 'physicalAddress';
    if (message.includes('premises type')) return 'premisesType';
    if (message.includes('recognized street address')) return 'premisesOwnAddress';
    if (message.includes('Postal address')) return 'postalAddress';
    if (message.includes('Delivery / installation')) return 'deliveryAddress';
    if (message.includes('coverage')) return 'coverageChecked';
    if (message.includes('Gross')) return 'grossIncome';
    if (message.includes('Net')) return 'netIncome';
    if (message.includes('expenses')) return 'totalExpenses';
    if (message.includes('consent')) return 'paymentConsent';
    if (message.includes('Bank')) return 'bank';
    if (message.includes('Branch name')) return 'branchName';
    if (message.includes('Branch code')) return 'branchCode';
    if (message.includes('Account holder')) return 'accountHolderName';
    if (message.includes('Account number')) return 'accountNumber';
    if (message.includes('Account type')) return 'accountType';
    if (message.includes('debit date')) return 'debitDate';
    if (message.includes('service type')) return 'serviceType';
    if (message.includes('package selection')) return 'sig2';
    if (message.includes('package')) return 'selectedPackage';
    if (message.includes('activation')) return 'activationDate';
    if (message.includes('existing line')) return 'hasExistingLine';
    if (message.includes('router')) return 'requiresRouter';
    if (message.includes('agreement')) return 'agreementConsent';
    if (message.includes('final signature')) return 'sig3';
    if (message.includes('signature')) return step === 4 ? 'sig1' : 'sig3';
    return '';
  };

  const focusField = (field: string) => {
    window.setTimeout(() => {
      const target = field ? document.querySelector<HTMLElement>(`[data-field="${field}"]`) : null;
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus?.({ preventScroll: true });
      target.classList.add('ring-2', 'ring-[#D6139F]', 'ring-offset-2');
      window.setTimeout(() => target.classList.remove('ring-2', 'ring-[#D6139F]', 'ring-offset-2'), 1800);
    }, 80);
  };

  const next = async () => {
    const e = validate();
    if (e) { setErr(e); focusField(fieldFromError(e)); return; }
    persistCurrentSignature(step);
    setErr('');
    if (step < 5) { setStep(s => s + 1); return; }
    await submit();
  };

  const submit = async () => {
    setBusy(true);
    setErr('');
    trackOneaEvent(assisted ? 'signature_request_started' : 'application_started', {
      form: 'telkom_application',
      capture_mode: assisted ? 'assisted' : 'direct',
      selected_package: data.selectedPackage,
      monthly_value: data.packagePrice,
      agent: assisted ? agentName.trim() : 'WhatsApp/Online/Referral',
    });

    const selectedGroup = PACKAGE_GROUPS.find(group => group.id === data.serviceType);
    const serviceLabel = data.serviceType === 'lte' ? 'LTE' : 'Fibre';
    const yesNo = (value: string | boolean) => value === true || value === 'yes' ? 'Y' : 'N';
    const postalAddress = data.postalSameAsPhysical ? data.physicalAddress : data.postalAddress;
    const deliveryAddress = data.deliverySameAsPhysical ? data.physicalAddress : data.deliveryAddress;
    const secondaryDwelling = ['cottage', 'backroom', 'granny-flat', 'other-secondary-dwelling'].includes(data.premisesType);
    const addressCreationRequired = secondaryDwelling && data.premisesOwnAddress === 'no';
    const payload = {
      ...data,
      addressCreationRequired,
      captureMode: assisted ? 'assisted' : 'direct',
      agentName: assisted ? agentName.trim() : 'WhatsApp/Online/Referral',
      postalAddress,
      deliveryAddress,
      postalAddressSameAsAbove: yesNo(data.postalSameAsPhysical),
      formType: 'telkom-application',
      firstNames: data.fullName,
      mobileNumber: data.mobile,
      companyName: data.employerName,
      companyContactNo: data.employerPhone,
      companyAddress: data.employerAddress,
      bank: data.bank,
      branchName: data.branchName,
      branchCode: data.branchCode,
      accountHolderName: data.accountHolderName,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      debitOrderMaxAmount: data.packagePrice,
      debitDate: data.debitDate,
      authFullName: data.fullName,
      executionDate: data.sig1Date,
      technologyType: serviceLabel,
      requiredServiceDate: data.activationDate,
      linesRequired: '1',
      useExistingLine: yesNo(data.hasExistingLine),
      preferredNetworkOperator: selectedGroup?.label || 'Telkom',
      currentServiceProvider: selectedGroup?.label || 'Telkom',
      contractPeriod: '24 months',
      selfInstall: yesNo(data.requiresRouter === 'no'),
      signingFullName: data.fullName,
      signingDate: data.sig3Date,
      creditVettingConsent: yesNo(data.agreeTerms),
      tcCopyRequest: 'Y',
      deliveryMethod: 'Emailed',
      confirmationEmail: data.email,
      sig1: data.sig1Data || sig1.current?.toDataURL() || '',
      sig2: data.sig2Data || sig2.current?.toDataURL() || '',
      sig3: data.sig3Data || sig3.current?.toDataURL() || '',
    };

    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 35000);

    try {
      const res  = await fetch(assisted ? '/api/telkom-signature-requests.php' : '/sendmail-telkom.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(assisted && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body:   JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const text = await res.text();
      let result: { error?: string; message?: string; id?: string; whatsappUrl?: string; whatsappSent?: boolean } = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = { error: text.trim() || `Server returned ${res.status}` };
      }
      if (!res.ok) throw new Error(result.error || result.message || `Submission failed with status ${res.status}`);
      setRefId(result.id ?? '');
      setDoneMessage(result.message ?? '');
      setWhatsappUrl(result.whatsappUrl ?? '');
      setWhatsappSent(Boolean(result.whatsappSent));
      trackOneaEvent(assisted ? 'signature_request_sent' : 'application_completed', {
        form: 'telkom_application',
        capture_mode: assisted ? 'assisted' : 'direct',
        reference: result.id ?? '',
        selected_package: data.selectedPackage,
        monthly_value: data.packagePrice,
        agent: assisted ? agentName.trim() : 'WhatsApp/Online/Referral',
        whatsapp_sent: Boolean(result.whatsappSent),
      });
      if (!assisted) {
        trackLeadConversion({
          form_name: 'telkom_application',
          service_type: 'telkom_connectivity',
          package_name: data.selectedPackage,
          value: data.packagePrice,
          lead_area: data.leadArea,
          lead_source: 'telkom_application_portal',
          submission_id: result.id ?? '',
        });
      }
      setDone(true);
    } catch (err: unknown) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('aborted')) setErr('Request timed out — please try again.');
      else if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed to fetch'))
        setErr('Could not reach the server. Please try again or contact connect@onea.co.za.');
      else setErr(msg);
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
        <h2 className="text-[26px] font-extrabold text-gray-800 mb-2">{assisted ? 'Signature Request Sent!' : 'Application Submitted!'}</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed mb-5">
          {doneMessage || (assisted
            ? `The client signature request for ${data.fullName} has been sent.`
            : `Thank you, ${data.fullName}. Your Telkom service application has been received successfully.`)}
        </p>
        {refId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{assisted ? 'Request Reference' : 'Application Reference'}</p>
            <p className="font-bold text-gray-800 text-[18px]">{refId}</p>
          </div>
        )}
      <div className="bg-[#8CC444]/10 rounded-xl p-4 mb-5 border border-[#8CC444]/20 text-left">
          <div className="flex gap-2 mb-2">
            <span className="material-symbols-outlined text-[#8CC444] text-[18px]">mail</span>
            <p className="text-[13px] text-[#416900] font-semibold">{assisted ? `Signature link emailed to ${data.email}` : `Confirmation emailed to ${data.email}`}</p>
          </div>
          <p className="text-[12px] text-[#416900]/80 leading-relaxed ml-6">
          {assisted ? 'The application will only be submitted after the client signs the secure request.' : <>A consultant will contact you within <strong>1–2 business days</strong> to complete verification and debit order setup.</>}
        </p>
      </div>
      {assisted && whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-[#102000] transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          {whatsappSent ? 'WhatsApp Sent - Open Chat' : 'Send Signature Link on WhatsApp'}
        </a>
      )}
        {!assisted && <p className="text-[12px] text-gray-400 mb-6">Urgent? WhatsApp us on <strong>+27 69 464 4663</strong></p>}
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
              <p className="text-[11px] text-gray-400">{assisted ? 'Assisted Telkom Application' : 'Telkom Service Application'}</p>
              <p ref={titleRef} tabIndex={-1} className="text-[14px] font-bold text-gray-800 outline-none">{info.label}</p>
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 pb-4">
        {assisted && step === 2 && (
            <div className="mb-5 rounded-xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4">
              <label className="mb-1 block text-[13px] font-semibold text-gray-600">
                Agent Name <span className="text-[#D6139F]">*</span>
              </label>
              <input
                data-field="agentName"
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                className={inp}
                placeholder="Name of the agent assisting this client"
              />
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-24 }} transition={{ duration:0.18, ease:'easeOut' }}>
            {step===1 && <Step4 d={data} s={set} sigRef={sig2} assisted={assisted} collectSignature={false} />}
            {step===2 && <Step1 d={data} s={set} />}
            {step===3 && <Step2 d={data} s={set} />}
            {step===4 && <Step3 d={data} s={set} sigRef={sig1} assisted={assisted} />}
            {step===5 && <Step5 d={data} s={set} sigRef={sig3} serviceSigRef={sig2} assisted={assisted} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-8 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {err && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-3 text-[13px]">
            <span className="material-symbols-outlined text-[16px] flex-shrink-0">error</span>
            {err}
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
              <><span className="material-symbols-outlined text-[18px]">send</span> {assisted ? 'Send Signature Request' : 'Submit Application'}</>
            ) : (
              <>Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
