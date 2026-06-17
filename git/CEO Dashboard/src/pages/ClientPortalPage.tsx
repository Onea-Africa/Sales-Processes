import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE as API } from '../lib/api';
import { trackOneaEvent } from '../lib/marketing';

const supportCategories = [
  'Fibre line fault',
  'Openserve Connect App help',
  'Telkom prepaid fibre top-up',
  'WiFi coverage extension',
  'Router or ONT issue',
  'Installation follow-up',
  'General support',
];

const openserveSteps = [
  'Download Openserve Connect from Google Play Store or Apple App Store.',
  'Open the app after installation.',
  'Register your profile with your name, email and password, or log in if you already have an account.',
  'On the home screen, press the grey plus button at the top.',
  'Register your ONT by entering the serial number or scanning the barcode.',
  'Open Network Status inside the app.',
  'Use Check My Line to test whether your fibre line is working or whether there may be a fault.',
];

const serviceStages = [
  { label: 'Submitted', description: 'Your request or application has been received.' },
  { label: 'Verification Pending', description: 'Onea checks account, address and service details.' },
  { label: 'Installation / Support Scheduled', description: 'A technician, supplier or support action is being arranged.' },
  { label: 'Active / Resolved', description: 'The service is live or the support request has been closed.' },
];

const quickActions = [
  {
    title: 'Slow or unstable internet',
    category: 'Fibre line fault',
    icon: 'speed',
    description: 'Report line drops, slow speeds or failed Openserve line checks.',
  },
  {
    title: 'Recharge prepaid fibre',
    category: 'Telkom prepaid fibre top-up',
    icon: 'payments',
    description: 'Get help with B-number top-ups, vouchers or the Telkom QR portal.',
  },
  {
    title: 'Extend WiFi coverage',
    category: 'WiFi coverage extension',
    icon: 'wifi',
    description: 'Request mesh WiFi, router placement, cabling or extra access points.',
    href: '/pricing?solution=wifi-home',
  },
  {
    title: 'Smart CCTV & Security',
    category: 'Smart CCTV & Security',
    icon: 'videocam',
    description: 'Camera, NVR, access control and smart security estimate with optional monitoring or support.',
    href: '/pricing?solution=cctv-access',
  },
];

type SpeedResult = {
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  testedAt: string;
};

export default function ClientPortalPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [category, setCategory] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [speedRunning, setSpeedRunning] = useState(false);
  const [speedError, setSpeedError] = useState('');
  const [speedResult, setSpeedResult] = useState<SpeedResult | null>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackOneaEvent('client_portal_view', { section: 'client_portal' });
  }, []);

  function chooseCategory(nextCategory: string) {
    setCategory(nextCategory);
    trackOneaEvent('support_intent_selected', {
      category: nextCategory,
      source: 'client_portal_quick_action',
    });
    supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function runSpeedCheck() {
    setSpeedRunning(true);
    setSpeedError('');
    setSpeedResult(null);

    try {
      const pingSamples: number[] = [];
      for (let i = 0; i < 4; i += 1) {
        const start = performance.now();
        const res = await fetch(`${API}/api/speed-test.php?ping=${Date.now()}-${i}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Could not reach the Onea test endpoint.');
        await res.text();
        pingSamples.push(performance.now() - start);
      }

      const avgPing = pingSamples.reduce((sum, value) => sum + value, 0) / pingSamples.length;
      const jitter = pingSamples.reduce((sum, value) => sum + Math.abs(value - avgPing), 0) / pingSamples.length;

      let downloadedBytes = 0;
      const downloadStart = performance.now();
      for (let i = 0; i < 12; i += 1) {
        const res = await fetch(`/og-image.png?speed=${Date.now()}-${i}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Download test could not complete.');
        const blob = await res.blob();
        downloadedBytes += blob.size;
      }
      const downloadSeconds = Math.max(0.001, (performance.now() - downloadStart) / 1000);
      const downloadMbps = (downloadedBytes * 8) / downloadSeconds / 1_000_000;

      const uploadBytes = 768 * 1024;
      const uploadPayload = new Uint8Array(uploadBytes);
      for (let i = 0; i < uploadPayload.length; i += 1) {
        uploadPayload[i] = i % 251;
      }
      const uploadStart = performance.now();
      const uploadRes = await fetch(`${API}/api/speed-test.php?upload=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: uploadPayload.buffer,
      });
      if (!uploadRes.ok) throw new Error('Upload test could not complete.');
      const uploadSeconds = Math.max(0.001, (performance.now() - uploadStart) / 1000);
      const uploadMbps = (uploadBytes * 8) / uploadSeconds / 1_000_000;

      const result = {
        pingMs: Math.round(avgPing),
        jitterMs: Math.round(jitter),
        downloadMbps: Number(downloadMbps.toFixed(1)),
        uploadMbps: Number(uploadMbps.toFixed(1)),
        testedAt: new Date().toLocaleString(),
      };
      setSpeedResult(result);
      trackOneaEvent('speed_check_completed', result);
    } catch (err) {
      setSpeedError(err instanceof Error ? err.message : 'Speed check could not complete.');
    } finally {
      setSpeedRunning(false);
    }
  }

  function attachSpeedResult() {
    if (!speedResult) return;
    const resultText = [
      'Onea Speed & WiFi Check result:',
      `Download: ${speedResult.downloadMbps} Mbps`,
      `Upload: ${speedResult.uploadMbps} Mbps`,
      `Ping: ${speedResult.pingMs} ms`,
      `Jitter: ${speedResult.jitterMs} ms`,
      `Tested: ${speedResult.testedAt}`,
      '',
      'Issue / room affected:',
    ].join('\n');
    setCategory('Fibre line fault');
    setSupportMessage(current => current.trim() ? `${current.trim()}\n\n${resultText}` : resultText);
    supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      leadArea: String(form.get('leadArea') || '').trim(),
      category: String(form.get('category') || '').trim(),
      serviceRef: String(form.get('serviceRef') || '').trim(),
      message: supportMessage.trim(),
      website: String(form.get('website') || '').trim(),
    };

    try {
      const res = await fetch(`${API}/api/support.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to submit support request.');
      trackOneaEvent('support_submitted', {
        category: payload.category,
        has_service_reference: Boolean(payload.serviceRef),
        ticket_id: data.ticketId || '',
      });
      setSuccess(`Support request received. Reference: ${data.ticketId || 'Onea Support'}`);
      event.currentTarget.reset();
      setSupportMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit support request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-[#FBFCF6] text-[#17210B]">
      <section className="border-b border-[#D9DBCD] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Client Portal</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Support, line checks and fibre help in one place.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#4B5540]">
            Log a support request, learn how to test your Openserve fibre line, recharge prepaid fibre, or ask Onea Africa to extend your WiFi coverage.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Service Status</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {serviceStages.map((stage, index) => (
                <div key={stage.label} className="rounded-lg border border-[#D9DBCD] bg-[#FBFCF6] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4D350] text-sm font-bold">{index + 1}</span>
                    <p className="font-bold">{stage.label}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4B5540]">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {quickActions.map(action => (
            action.href ? (
              <Link
                key={action.title}
                to={action.href}
                onClick={() => trackOneaEvent('client_portal_quote_redirect', { category: action.category, destination: action.href })}
                className="rounded-lg border border-[#D9DBCD] bg-white p-5 text-left shadow-sm transition hover:border-[#8CC444]"
              >
                <span className="material-symbols-outlined text-[#D6139F]">{action.icon}</span>
                <h3 className="mt-3 font-bold">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4B5540]">{action.description}</p>
              </Link>
            ) : (
              <button
                key={action.title}
                type="button"
                onClick={() => chooseCategory(action.category)}
                className="rounded-lg border border-[#D9DBCD] bg-white p-5 text-left shadow-sm transition hover:border-[#8CC444]"
              >
                <span className="material-symbols-outlined text-[#D6139F]">{action.icon}</span>
                <h3 className="mt-3 font-bold">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4B5540]">{action.description}</p>
              </button>
            )
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border-2 border-[#8CC444]/35 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Onea Speed & WiFi Check</p>
              <h2 className="mt-3 text-2xl font-bold">Check your line before logging a support request.</h2>
              <p className="mt-2 text-sm leading-6 text-[#4B5540]">
                Run a quick browser-based estimate for download, upload, ping and jitter. For best results, stand in the room or office area where the WiFi feels weak.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={runSpeedCheck}
                  disabled={speedRunning}
                  className="inline-flex items-center gap-2 rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000] disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-[18px] ${speedRunning ? 'animate-spin' : ''}`}>
                    {speedRunning ? 'progress_activity' : 'speed'}
                  </span>
                  {speedRunning ? 'Testing...' : 'Start Speed Check'}
                </button>
                {speedResult && (
                  <button
                    type="button"
                    onClick={attachSpeedResult}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D6139F] px-5 py-3 text-sm font-bold text-[#102000] hover:bg-[#FBE8F6]"
                  >
                    Add Result To Support Request
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>
              {speedError && <p className="mt-4 text-sm font-semibold text-red-600">{speedError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Download', speedResult ? `${speedResult.downloadMbps} Mbps` : '--', '#8CC444'],
                ['Upload', speedResult ? `${speedResult.uploadMbps} Mbps` : '--', '#D6139F'],
                ['Ping', speedResult ? `${speedResult.pingMs} ms` : '--', '#F4D350'],
                ['Jitter', speedResult ? `${speedResult.jitterMs} ms` : '--', '#102000'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-[#D9DBCD] bg-[#FBFCF6] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4B5540]">{label}</p>
                  <p className="mt-2 text-xl font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#6A725F]">
            This is an estimate from your browser to the Onea website. It helps support identify WiFi and line symptoms, but final ISP diagnostics may still require an Openserve line check or onsite assessment.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div ref={supportRef} className="scroll-mt-24 rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Log a support request</h2>
          <p className="mt-2 text-sm text-[#4B5540]">This goes to helpdesk@onea.co.za and syncs the client contact to HubSpot when configured.</p>

          {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {success && <div className="mt-5 rounded-lg border border-[#8CC444]/40 bg-[#8CC444]/10 p-4 text-sm font-semibold text-[#416900]">{success}</div>}

          <form onSubmit={submitSupport} className="mt-6 space-y-4">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#4B5540]">Full Name *</span>
                <input name="name" required className="w-full rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#4B5540]">Email *</span>
                <input name="email" type="email" required className="w-full rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#4B5540]">Phone</span>
                <input name="phone" type="tel" className="w-full rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#4B5540]">Support Category *</span>
                <select name="category" required value={category} onChange={event => setCategory(event.target.value)} className="w-full rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]">
                  <option value="">Select category</option>
                  {supportCategories.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#4B5540]">Area / Township / Town *</span>
              <input name="leadArea" required placeholder="e.g. Soshanguve, Centurion or Midrand" className="w-full rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#4B5540]">B-number / Service Reference</span>
              <input name="serviceRef" placeholder="For prepaid fibre, enter the B-number if available" className="w-full rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#4B5540]">Message *</span>
              <textarea
                name="message"
                required
                rows={5}
                value={supportMessage}
                onChange={event => setSupportMessage(event.target.value)}
                className="w-full resize-none rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] px-4 py-3 outline-none focus:border-[#8CC444]"
              />
            </label>
            <button disabled={busy} className="w-full rounded-full bg-[#8CC444] px-5 py-3 font-bold text-[#102000] disabled:opacity-60">
              {busy ? 'Sending...' : 'Send to Helpdesk'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Openserve Connect App</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-[#3C4630]">
              {openserveSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F4D350] text-xs font-bold">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Top up Telkom prepaid fibre</h2>
            <p className="mt-2 text-sm text-[#4B5540]">Use the Telkom QR portal after the 14-day starter period from activation.</p>
            <a href="https://qr.telkom.co.za/qr_portal/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000]">
              Open Telkom Top-Up Portal
            </a>
            <div className="mt-5 grid gap-4 text-sm text-[#3C4630]">
              <div className="rounded-lg bg-[#F8FAF1] p-4">
                <p className="font-bold">Card payment</p>
                <p className="mt-1">Click Top-Up, choose Prepaid Fibre, enter your B-number, choose your package and complete payment.</p>
              </div>
              <div className="rounded-lg bg-[#F8FAF1] p-4">
                <p className="font-bold">Load a voucher</p>
                <p className="mt-1">Click Load Voucher, choose Load Fibre Voucher, enter your B-number and voucher code, then submit.</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Extend your fibre or WiFi</h2>
            <p className="mt-2 text-sm leading-6 text-[#4B5540]">
              Onea Africa can help extend coverage with router placement, mesh WiFi, additional access points, cabling, or fibre-ready network planning for larger homes and offices.
            </p>
            <Link to="/pricing?solution=wifi-home" className="mt-4 inline-flex rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000]">
              Estimate residential WiFi coverage
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
