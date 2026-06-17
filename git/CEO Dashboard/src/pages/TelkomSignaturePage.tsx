import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SignaturePad, { SigHandle } from '../components/telkom/SignaturePad';
import { trackOneaEvent } from '../lib/marketing';

interface SignatureRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  selectedPackage: string;
  packagePrice: string;
  payload: Record<string, unknown>;
}

const today = new Date().toLocaleDateString('en-ZA');

export default function TelkomSignaturePage() {
  const { token = '' } = useParams();
  const [request, setRequest] = useState<SignatureRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState('');
  const sig1 = useRef<SigHandle>(null);
  const sig2 = useRef<SigHandle>(null);
  const sig3 = useRef<SigHandle>(null);

  useEffect(() => {
    async function loadRequest() {
      setError('');
      setLoading(true);
      try {
        const res = await fetch(`/api/telkom-signature-request.php?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load signature request.');
        setRequest(data.request);
        trackOneaEvent('signature_request_viewed', {
          form: 'telkom_application',
          token,
          selected_package: data.request?.selectedPackage || '',
          monthly_value: data.request?.packagePrice || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load signature request.');
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [token]);

  const submit = async () => {
    if (!request) return;
    const sig1Data = sig1.current?.toDataURL() || '';
    const sig2Data = sig2.current?.toDataURL() || '';
    const sig3Data = sig3.current?.toDataURL() || '';
    if (!sig1Data || !sig2Data || !sig3Data || sig1.current?.isEmpty() || sig2.current?.isEmpty() || sig3.current?.isEmpty()) {
      setError('Please complete all three signatures before submitting.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payload = {
        ...request.payload,
        agreeTerms: true,
        creditVettingConsent: 'Y',
        sig1: sig1Data,
        sig2: sig2Data,
        sig3: sig3Data,
        sig1Data,
        sig2Data,
        sig3Data,
        sig1Date: today,
        sig2Date: today,
        sig3Date: today,
        signingDate: today,
        executionDate: today,
      };
      const res = await fetch('/sendmail-telkom.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: { error?: string; message?: string; id?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || `Server returned ${res.status}` };
      }
      if (!res.ok) throw new Error(data.error || data.message || 'Submission failed.');
      await fetch('/api/telkom-signature-request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, submittedReference: data.id || '' }),
      }).catch(() => {});
      setRefId(data.id || '');
      trackOneaEvent('application_completed', {
        form: 'telkom_application',
        capture_mode: 'assisted_client_signature',
        reference: data.id || '',
        token,
        selected_package: request.selectedPackage,
        monthly_value: request.packagePrice,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-white px-6 py-16 text-center text-gray-600">Loading signature request...</main>;
  }

  if (error && !request) {
    return (
      <main className="min-h-screen bg-[#f8fbec] px-6 py-16 text-[#1a1c18]">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-red-700 shadow-sm">{error}</div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#f8fbec] px-6 py-16 text-[#1a1c18]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#8CC444]/30 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-3xl font-bold">Application Signed</h1>
          <p className="mb-4 text-gray-600">Thank you. Your signed Telkom application has been submitted.</p>
          {refId && <p className="rounded-xl bg-[#8CC444]/10 p-3 font-bold text-[#416900]">Reference: {refId}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#1a1c18]">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Onea Africa Telkom Application</p>
          <h1 className="mt-2 text-3xl font-extrabold">Review and sign</h1>
          <p className="mt-2 text-sm text-gray-600">Please review the application summary and complete all three signatures.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-200 py-2"><span>Name</span><strong>{request?.clientName}</strong></div>
          <div className="flex justify-between gap-4 border-b border-gray-200 py-2"><span>Email</span><strong>{request?.clientEmail}</strong></div>
          <div className="flex justify-between gap-4 border-b border-gray-200 py-2"><span>Package</span><strong>{request?.selectedPackage}</strong></div>
          <div className="flex justify-between gap-4 py-2"><span>Monthly</span><strong className="text-[#8CC444]">R{request?.packagePrice}</strong></div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <section className="space-y-3">
          <h2 className="font-bold">Signature 1: Payment Authorisation</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            By signing here, you authorise the monthly debit order/payment collection for the Telkom service selected in this application, subject to approval and activation.
          </p>
          <SignaturePad ref={sig1} />
        </section>
        <section className="space-y-3">
          <h2 className="font-bold">Signature 2: Service Selection</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            By signing here, you confirm that you selected and accept this package: <strong>{request?.selectedPackage || 'Selected Telkom package'}</strong>
            {request?.packagePrice ? <span> at <strong>R{request.packagePrice}/month</strong>.</span> : '.'}
          </p>
          <SignaturePad ref={sig2} />
        </section>
        <section className="space-y-3">
          <h2 className="font-bold">Signature 3: Agreement</h2>
          <p className="text-sm leading-relaxed text-gray-600">
            By signing here, you confirm that the application details are correct and that you agree to the applicable Telkom service terms and conditions.
            {' '}
            <a
              href="https://www.telkom.co.za/sites/aboutus/regulatory/termsandconditions/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#D6139F] underline"
            >
              View Telkom T&amp;Cs
            </a>
            .
          </p>
          <SignaturePad ref={sig3} />
        </section>

        <div className="flex gap-3">
          <Link to="/" className="rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-600">Cancel</Link>
          <button onClick={submit} disabled={busy} className="flex-1 rounded-full bg-[#8CC444] px-5 py-3 font-bold text-[#102000] disabled:opacity-60">
            {busy ? 'Submitting...' : 'Submit Signed Application'}
          </button>
        </div>
      </div>
    </main>
  );
}
