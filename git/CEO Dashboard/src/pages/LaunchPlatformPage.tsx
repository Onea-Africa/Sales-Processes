import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE as API } from '../lib/api';
import AvailableDocuments, { DocItem } from '../components/AvailableDocuments';

interface DocumentItem {
    key: string;
    title: string;
    description: string;
    available: boolean;
    filename: string | null;
    uploadedAt: string | null;
    uploader: string | null;
}

interface UserSession {
    displayName: string;
    role: string;
}

interface SignatureRequestStatus {
    id: string;
    status: string;
    createdAt: string;
    viewedAt: string;
    submittedAt: string;
    createdBy: string;
    clientName: string;
    clientEmail: string;
    selectedPackage: string;
    packagePrice: string;
    signUrl: string;
    expiresAt: string;
    revokedAt: string;
    revokedBy: string;
    lastReminderAt: string;
    lastReminderBy: string;
    reminderCount: number;
}

const SESSION_STORAGE_KEY = 'launch_platform_session';

async function readJsonResponse(res: Response) {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        const text = await res.text();
        const looksLikeHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
        throw new Error(looksLikeHtml ? 'API endpoint returned the website page instead of JSON. Check the /api upload and rewrite paths.' : 'API endpoint returned an unexpected response.');
    }
    return res.json();
}

export default function LaunchPlatformPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const redirectTo = new URLSearchParams(location.search).get('redirect') || '';
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [session, setSession] = useState<UserSession | null>(null);
    const [token, setToken] = useState('');
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [uploadKey, setUploadKey] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [webhookStatus, setWebhookStatus] = useState<any>(null);
    const [webhookStatusError, setWebhookStatusError] = useState('');
    const [auditData, setAuditData] = useState<any>(null);
    const [auditError, setAuditError] = useState('');
    const [signatureStatus, setSignatureStatus] = useState<{ sentCount: number; pendingCount: number; viewedCount: number; submittedCount: number; revokedCount: number; expiredCount: number; requests: SignatureRequestStatus[] } | null>(null);
    const [signatureStatusError, setSignatureStatusError] = useState('');
    const [copiedSignatureId, setCopiedSignatureId] = useState('');
    const [remindingSignatureId, setRemindingSignatureId] = useState('');
    const [revokingSignatureId, setRevokingSignatureId] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored) as { token: string; session: UserSession };
            if (parsed?.token && parsed?.session) {
                setToken(parsed.token);
                setSession(parsed.session);
                if (redirectTo.startsWith('/')) {
                    navigate(redirectTo, { replace: true });
                }
            }
        } catch {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, [navigate, redirectTo]);

    useEffect(() => {
        if (!token) {
            setDocuments([]);
            return;
        }
        fetchDocuments();
        fetchWebhookStatus();
        fetchSignatureStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function fetchSignatureStatus() {
        setSignatureStatusError('');
        try {
            const res = await fetch(`${API}/api/telkom-signature-status.php`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await readJsonResponse(res);
            if (!res.ok) {
                throw new Error(data.error || 'Unable to load signature status.');
            }
            setSignatureStatus(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setSignatureStatusError(err.message);
            } else {
                setSignatureStatusError('Unable to load signature status.');
            }
        }
    }

    async function fetchWebhookStatus() {
        setWebhookStatusError('');
        try {
            const res = await fetch(`${API}/api/webhook-status.php`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await readJsonResponse(res);
                throw new Error(data.error || 'Unable to load webhook status.');
            }
            const data = await readJsonResponse(res);
            setWebhookStatus(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setWebhookStatusError(err.message);
            } else {
                setWebhookStatusError('Unable to load webhook status.');
            }
        }
    }

    async function fetchSubmissionAudit() {
        setAuditError('');
        setAuditData(null);
        try {
            const res = await fetch(`${API}/api/submission-audit.php`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await readJsonResponse(res);
            if (!res.ok) {
                throw new Error(data.error || 'Unable to load audit data.');
            }
            setAuditData(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setAuditError(err.message);
            } else {
                setAuditError('Unable to load audit data.');
            }
        }
    }

    async function fetchDocuments() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API}/api/documents.php`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                if (res.status === 401) {
                    logout();
                    setError('Session expired. Please log in again.');
                    return;
                }
                const data = await readJsonResponse(res);
                throw new Error(data.error || 'Unable to load documents.');
            }
            const data = await readJsonResponse(res);
            setDocuments(data.documents || []);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unable to load documents at this time.');
            }
        } finally {
            setLoading(false);
        }
    }

    function saveSession(tokenValue: string, sessionData: UserSession) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token: tokenValue, session: sessionData }));
        setToken(tokenValue);
        setSession(sessionData);
    }

    function logout() {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setToken('');
        setSession(null);
        setDocuments([]);
        setError('');
        setMessage('You have been logged out.');
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch(`${API}/api/documents-login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await readJsonResponse(res);
            if (!res.ok) {
                throw new Error(data.error || 'Login failed.');
            }
            saveSession(data.token, { displayName: data.displayName, role: data.role });
            setUsername('');
            setPassword('');
            setMessage('Login successful.');
            if (redirectTo.startsWith('/')) {
                navigate(redirectTo, { replace: true });
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unable to sign in.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload(documentItem: DocumentItem) {
        setError('');
        setMessage('');
        if (!token) {
            setError('Login required to download documents.');
            return;
        }
        try {
            const res = await fetch(`${API}/api/documents.php?docKey=${encodeURIComponent(documentItem.key)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await readJsonResponse(res);
                throw new Error(data.error || 'Unable to download file.');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = documentItem.filename || `${documentItem.key}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unable to download document.');
            }
        }
    }

    const signatureLabel = (status: string) => {
        if (status === 'submitted') return 'Signed';
        if (status === 'revoked') return 'Revoked';
        if (status === 'expired') return 'Expired';
        if (status === 'viewed') return 'Viewed, not signed';
        return 'Sent, not viewed';
    };

    const signatureBadgeClass = (status: string) => {
        if (status === 'submitted') return 'bg-[#8CC444]/20 text-[#416900]';
        if (status === 'revoked') return 'bg-red-100 text-red-700';
        if (status === 'expired') return 'bg-slate-200 text-slate-700';
        if (status === 'viewed') return 'bg-[#F4D350]/30 text-[#6A5500]';
        return 'bg-[#D6139F]/10 text-[#A20E78]';
    };

    const followUpLabel = (item: SignatureRequestStatus) => {
        if (item.status === 'submitted') return 'Complete';
        if (item.status === 'revoked') return 'Revoked';
        if (item.status === 'expired') return 'Expired';
        if (!item.createdAt) return 'New';
        const ageHours = (Date.now() - new Date(item.createdAt.replace(' ', 'T')).getTime()) / 36e5;
        if (ageHours >= 48) return 'Urgent';
        if (ageHours >= 24) return 'Follow up';
        return 'New';
    };

    const followUpClass = (label: string) => {
        if (label === 'Complete') return 'bg-[#8CC444]/15 text-[#416900]';
        if (label === 'Revoked') return 'bg-red-100 text-red-700';
        if (label === 'Expired') return 'bg-slate-200 text-slate-700';
        if (label === 'Urgent') return 'bg-red-100 text-red-700';
        if (label === 'Follow up') return 'bg-[#F4D350]/30 text-[#6A5500]';
        return 'bg-[#fbfcf6] text-[#5f6656]';
    };

    async function copySignatureLink(item: SignatureRequestStatus) {
        setError('');
        setMessage('');
        try {
            await navigator.clipboard.writeText(item.signUrl);
            setCopiedSignatureId(item.id);
            setMessage(`Signing link copied for ${item.clientName || item.clientEmail}.`);
            window.setTimeout(() => setCopiedSignatureId(''), 2500);
        } catch {
            setError('Could not copy the signing link. Open it and copy from the browser instead.');
        }
    }

    async function sendSignatureReminder(item: SignatureRequestStatus) {
        if (['submitted', 'revoked', 'expired'].includes(item.status)) return;
        setError('');
        setMessage('');
        setRemindingSignatureId(item.id);
        try {
            const res = await fetch(`${API}/api/telkom-signature-reminder.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: item.id }),
            });
            const data = await readJsonResponse(res).catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Unable to send reminder.');
            }
            setMessage(data.message || `Reminder sent to ${item.clientEmail}.`);
            if (data.whatsappUrl && !data.whatsappSent) {
                window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
            }
            fetchSignatureStatus();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unable to send reminder.');
        } finally {
            setRemindingSignatureId('');
        }
    }

    async function revokeSignatureRequest(item: SignatureRequestStatus) {
        if (['submitted', 'revoked', 'expired'].includes(item.status)) return;
        if (!window.confirm(`Revoke the signing link for ${item.clientName || item.clientEmail}?`)) return;
        setError('');
        setMessage('');
        setRevokingSignatureId(item.id);
        try {
            const res = await fetch(`${API}/api/telkom-signature-revoke.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: item.id }),
            });
            const data = await readJsonResponse(res).catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Unable to revoke signing link.');
            }
            setMessage(data.message || `Signing link revoked for ${item.clientEmail}.`);
            fetchSignatureStatus();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unable to revoke signing link.');
        } finally {
            setRevokingSignatureId('');
        }
    }

    async function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setMessage('');

        if (!uploadKey || !uploadFile) {
            setError('Select a document and PDF file to upload.');
            return;
        }
        if (!token) {
            setError('Login required to upload documents.');
            return;
        }

        const formData = new FormData();
        formData.append('docKey', uploadKey);
        formData.append('file', uploadFile);

        try {
            const res = await fetch(`${API}/api/documents-upload.php`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await readJsonResponse(res);
            if (!res.ok) {
                throw new Error(data.error || 'Upload failed.');
            }
            setMessage('Upload successful. Document is now available.');
            setUploadFile(null);
            fetchDocuments();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unable to upload document.');
            }
        }
    }

    const canUpload = session?.role === 'uploader';
    const canView = Boolean(session);
    const staffRole = session?.role || '';
    const canUseAgentTools = ['agent', 'uploader', 'admin', 'pr', 'comms'].includes(staffRole);
    const canUseAssistedTelkom = ['agent', 'uploader', 'pr', 'comms'].includes(staffRole);

    return (
        <div className="min-h-screen bg-[#f8fbec] text-[#1a1c18] px-6 py-10 lg:px-12">
            <div className="max-w-[1280px] mx-auto space-y-10">
                <div className="flex flex-col lg:flex-row justify-between gap-6 items-start">
                    <div className="space-y-4">
                        <p className="font-label-caps uppercase text-sm tracking-[0.24em] text-[#8CC444]">Document Center</p>
                        <h1 className="text-[2.75rem] font-bold leading-tight">{canView ? 'Secure Resources' : 'Managed Enterprise Access'}</h1>
                        <p className="max-w-2xl text-base text-[#424938]">
                            {canView ? 'Access secure corporate resources, performance briefing packs, and operational deployment documentation.' : 'Access secure corporate resources, performance briefing packs, and operational deployment documentation.'}
                        </p>
                        {!canView && (
                            <ul className="space-y-1 text-sm text-[#424938]">
                                <li>• Managed Enterprise Infrastructure</li>
                                <li>• Authorized Client Portals</li>
                                <li>• Strategic Communications Archives</li>
                            </ul>
                        )}
                    </div>
                    {canView && (
                        <div className="rounded-3xl border border-[#8CC444]/30 bg-white p-6 shadow-sm">
                            <p className="text-sm text-[#424938]">Signed in as</p>
                            <p className="font-semibold text-[#102000]">{session?.displayName}</p>
                            <p className="text-sm text-[#424938]">Role: {session?.role}</p>
                            <button
                                onClick={logout}
                                className="mt-4 rounded-full bg-[#8CC444] px-5 py-2 text-sm font-semibold text-[#102000] hover:opacity-90"
                            >
                                Sign out
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}
                {message && <div className="rounded-3xl border border-green-200 bg-green-50 p-5 text-sm text-green-700">{message}</div>}

                {!canView ? (
                    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                        <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-semibold mb-4">Sign in to continue</h2>
                            <p className="text-sm text-[#424938] mb-6">Use your launch platform credentials to access shared documents.</p>
                            <form className="space-y-4" onSubmit={handleLogin}>
                                <label className="block">
                                    <span className="text-sm font-medium text-[#424938]">Username</span>
                                    <input
                                        value={username}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => setUsername(event.target.value)}
                                        className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444]"
                                        placeholder="Nick"
                                        autoComplete="username"
                                        required
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-[#424938]">Password</span>
                                    <input
                                        value={password}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                                        className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444]"
                                        placeholder="••••••••"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-full bg-[#8CC444] px-5 py-3 font-semibold text-[#102000] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? 'Signing in…' : 'Sign in'}
                                </button>
                            </form>
                        </div>
                        <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#D6139F]">Launch Platform</p>
                            <h2 className="text-2xl font-semibold mb-4">Operational portals</h2>
                            <p className="text-sm text-[#424938] mb-6">Use the correct portal for your role. Document Center credentials are separate from dashboard and field agent access where applicable.</p>
                            <div className="space-y-3">
                                <a
                                    href="https://onea.africa/dashboard/login.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between rounded-2xl border border-[#8CC444]/40 bg-[#8CC444]/10 px-5 py-4 text-sm font-bold text-[#102000] transition hover:bg-[#8CC444]/20"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">dashboard</span>
                                        Dashboard
                                    </span>
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">open_in_new</span>
                                </a>
                                <a
                                    href="https://onea.africa/field/login.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between rounded-2xl border border-[#D6139F]/30 bg-[#D6139F]/10 px-5 py-4 text-sm font-bold text-[#102000] transition hover:bg-[#D6139F]/15"
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">engineering</span>
                                        Field Agent
                                    </span>
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">open_in_new</span>
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-8">
                       {canUseAssistedTelkom && (
                           <div className="rounded-3xl border border-[#8CC444]/30 bg-white p-8 shadow-sm">
                               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                       <h2 className="text-2xl font-semibold">Assisted Telkom application</h2>
                                            <p className="text-sm text-[#424938]">Complete the form for a client, then send them a secure signature request.</p>
                                        </div>
                                        <Link
                                            to="/launch-platform/telkom-assisted"
                                            className="rounded-full bg-[#8CC444] px-5 py-3 text-center text-sm font-bold text-[#102000] hover:opacity-90"
                                        >
                                            Start assisted form
                                        </Link>
                               </div>
                           </div>
                       )}

                       {canUseAgentTools && (
                           <div className="rounded-3xl border border-[#D6139F]/25 bg-white p-8 shadow-sm">
                               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                       <h2 className="text-2xl font-semibold">Agent pricing builder</h2>
                                       <p className="text-sm text-[#424938]">Open the Onea pricing builder with internal supplier, margin, labour and installation breakdowns visible.</p>
                                   </div>
                                   <Link
                                       to="/pricing?agent=1"
                                       className="rounded-full bg-[#D6139F] px-5 py-3 text-center text-sm font-bold text-white hover:opacity-90"
                                   >
                                       Open agent pricing
                                   </Link>
                               </div>
                           </div>
                       )}

                       {canUseAgentTools && (
                           <div className="rounded-3xl border border-[#8CC444]/30 bg-white p-8 shadow-sm">
                               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                       <h2 className="text-2xl font-semibold">Supplier Directory</h2>
                                       <p className="text-sm text-[#424938]">View approved supplier accounts, product categories, preferred brands, and matching Onea Solution Builder quote paths.</p>
                                   </div>
                                   <Link
                                       to="/launch-platform/suppliers"
                                       className="rounded-full bg-[#8CC444] px-5 py-3 text-center text-sm font-bold text-[#102000] hover:opacity-90"
                                   >
                                       Open suppliers
                                   </Link>
                               </div>
                           </div>
                       )}

                       {canUseAgentTools && (
                           <div className="rounded-3xl border border-[#102000]/15 bg-white p-8 shadow-sm">
                               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                       <h2 className="text-2xl font-semibold">Hardware Procurement</h2>
                                       <p className="text-sm text-[#424938]">Build controlled hardware quote carts from ASBIS, Nology and manual supplier sources before admin approves reservation or purchase orders.</p>
                                   </div>
                                   <Link
                                       to="/launch-platform/hardware"
                                       className="rounded-full bg-[#102000] px-5 py-3 text-center text-sm font-bold text-white hover:opacity-90"
                                   >
                                       Open hardware
                                   </Link>
                               </div>
                           </div>
                       )}

                       {canUseAgentTools && (
                           <div className="rounded-3xl border border-[#F4D350]/50 bg-white p-8 shadow-sm">
                               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                       <h2 className="text-2xl font-semibold">Content Center</h2>
                                       <p className="text-sm text-[#424938]">Plan Converse content, blogs, case studies, Google Business posts, LinkedIn captions, campaign briefs and job adverts before anything goes public.</p>
                                   </div>
                                   <Link
                                       to="/launch-platform/content"
                                       className="rounded-full bg-[#F4D350] px-5 py-3 text-center text-sm font-bold text-[#102000] hover:opacity-90"
                                   >
                                       Open content
                                   </Link>
                               </div>
                           </div>
                       )}

                       {canUseAssistedTelkom && (
                           <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-semibold">Telkom signature tracker</h2>
                                            <p className="text-sm text-[#424938]">See which client links were sent, viewed, and signed before Onea receives the final application.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={fetchSignatureStatus}
                                            className="rounded-full bg-[#8CC444] px-4 py-2 text-sm font-semibold text-[#102000] hover:opacity-90"
                                        >
                                            Refresh status
                                        </button>
                                    </div>
                                    {signatureStatusError && <p className="mt-4 text-sm text-red-600">{signatureStatusError}</p>}
                                    {signatureStatus ? (
                                        <div className="mt-5 space-y-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-6">
                                                <div className="rounded-2xl border border-[#d9dbcd] bg-[#fbfcf6] p-4">
                                                    <p className="text-[#424938]">Links sent</p>
                                                    <p className="text-2xl font-bold text-[#102000]">{signatureStatus.sentCount ?? signatureStatus.requests.length}</p>
                                                </div>
                                                <div className="rounded-2xl border border-[#f1d1e9] bg-[#D6139F]/5 p-4">
                                                    <p className="text-[#424938]">Not viewed</p>
                                                    <p className="text-2xl font-bold text-[#D6139F]">{signatureStatus.pendingCount}</p>
                                                </div>
                                                <div className="rounded-2xl border border-[#f6eab4] bg-[#F4D350]/20 p-4">
                                                    <p className="text-[#424938]">Viewed</p>
                                                    <p className="text-2xl font-bold text-[#6A5500]">{signatureStatus.viewedCount ?? 0}</p>
                                                </div>
                                                <div className="rounded-2xl border border-[#e5f3d5] bg-[#8CC444]/10 p-4">
                                                    <p className="text-[#424938]">Signed</p>
                                                    <p className="text-2xl font-bold text-[#416900]">{signatureStatus.submittedCount}</p>
                                                </div>
                                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                                                    <p className="text-[#424938]">Revoked</p>
                                                    <p className="text-2xl font-bold text-red-700">{signatureStatus.revokedCount ?? 0}</p>
                                                </div>
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <p className="text-[#424938]">Expired</p>
                                                    <p className="text-2xl font-bold text-slate-700">{signatureStatus.expiredCount ?? 0}</p>
                                                </div>
                                            </div>
                                            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                                                {signatureStatus.requests.length > 0 ? signatureStatus.requests.map(item => (
                                                    <div key={item.id} className="rounded-2xl border border-[#d9dbcd] bg-[#fbfcf6] p-4 text-sm">
                                                        {(() => {
                                                            const followUp = followUpLabel(item);
                                                            return (
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                            <div>
                                                                <p className="font-semibold text-[#102000]">{item.clientName || 'Unnamed client'}</p>
                                                                <p className="text-[#424938]">{item.clientEmail}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${followUpClass(followUp)}`}>
                                                                    {followUp}
                                                                </span>
                                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${signatureBadgeClass(item.status)}`}>
                                                                    {signatureLabel(item.status)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                            );
                                                        })()}
                                                        <div className="mt-3 rounded-xl bg-white p-3">
                                                            <p className="font-semibold text-[#102000]">{item.selectedPackage || 'Package not recorded'}</p>
                                                            {item.packagePrice && <p className="mt-1 text-[#416900]">R{item.packagePrice}/month</p>}
                                                        </div>
                                                        <div className="mt-2 grid gap-1 text-xs text-[#5f6656] sm:grid-cols-2">
                                                            <p>Sent: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown'}</p>
                                                            <p>Viewed: {item.viewedAt ? new Date(item.viewedAt).toLocaleString() : 'Not yet'}</p>
                                                            <p>Agent: {item.createdBy || 'Launch Platform'}</p>
                                                            {item.submittedAt && <p>Signed: {new Date(item.submittedAt).toLocaleString()}</p>}
                                                            {item.expiresAt && <p>Expires: {new Date(item.expiresAt).toLocaleString()}</p>}
                                                            {item.revokedAt && <p>Revoked: {new Date(item.revokedAt).toLocaleString()}</p>}
                                                            {item.lastReminderAt && <p>Reminder: {new Date(item.lastReminderAt).toLocaleString()}</p>}
                                                            {item.reminderCount > 0 && <p>Reminders sent: {item.reminderCount}</p>}
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {!['submitted', 'revoked', 'expired'].includes(item.status) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => sendSignatureReminder(item)}
                                                                    disabled={remindingSignatureId === item.id}
                                                                    className="rounded-full bg-[#D6139F] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60"
                                                                >
                                                                    {remindingSignatureId === item.id ? 'Sending...' : 'Send reminder'}
                                                                </button>
                                                            )}
                                                            {!['submitted', 'revoked', 'expired'].includes(item.status) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => revokeSignatureRequest(item)}
                                                                    disabled={revokingSignatureId === item.id}
                                                                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                                                >
                                                                    {revokingSignatureId === item.id ? 'Revoking...' : 'Revoke link'}
                                                                </button>
                                                            )}
                                                            {!['revoked', 'expired'].includes(item.status) && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copySignatureLink(item)}
                                                                        className="rounded-full border border-[#d9dbcd] bg-white px-4 py-2 text-xs font-bold text-[#102000] hover:border-[#8CC444]"
                                                                    >
                                                                        {copiedSignatureId === item.id ? 'Copied' : 'Copy sign link'}
                                                                    </button>
                                                                    <a
                                                                        href={item.signUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="rounded-full bg-[#8CC444] px-4 py-2 text-xs font-bold text-[#102000] hover:opacity-90"
                                                                    >
                                                                        Open link
                                                                    </a>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-[#424938]">No signature requests have been created yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-[#424938]">Loading signature status...</p>
                                    )}
                                </div>
                            )}

                            <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="text-2xl font-semibold">Available documents</h2>
                                        <p className="text-sm text-[#424938]">Download certificates, company documents, and launch files.</p>
                                    </div>
                                    <p className="text-sm text-[#424938]">{documents.length} documents</p>
                                </div>
                                <div className="mt-6">
                                    <AvailableDocuments docs={documents.filter(d => d.available).map(d => ({
                                        id: d.key,
                                        name: d.title,
                                        uploadedAt: d.uploadedAt || new Date().toISOString(),
                                        url: `${API}/api/documents.php?docKey=${encodeURIComponent(d.key)}`,
                                    } as DocItem))} token={token} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                                <h2 className="text-2xl font-semibold mb-4">Webhook delivery status</h2>
                                {webhookStatusError ? (
                                    <p className="text-sm text-red-600">{webhookStatusError}</p>
                                ) : webhookStatus ? (
                                    <div className="space-y-4 text-sm text-[#424938]">
                                        <div className="rounded-3xl border border-[#e5f3d5] bg-[#f7fbeb] p-4">
                                            <p className="font-semibold">Latest webhook outcome</p>
                                            <p>Status: <span className="font-semibold">{webhookStatus.status?.lastWebhookStatus ?? 'Unknown'}</span></p>
                                            {webhookStatus.status?.lastWebhookMessage && <p>Message: {webhookStatus.status.lastWebhookMessage}</p>}
                                            {webhookStatus.status?.lastWebhookAt && <p>Last updated: {new Date(webhookStatus.status.lastWebhookAt).toLocaleString()}</p>}
                                        </div>
                                        {Array.isArray(webhookStatus.recentFallbacks) && webhookStatus.recentFallbacks.length > 0 ? (
                                            <div className="rounded-3xl border border-[#d9dbcd] bg-white p-4">
                                                <p className="font-semibold mb-3">Recent fallback files</p>
                                                <ul className="space-y-2">
                                                    {webhookStatus.recentFallbacks.map((fallback: any) => (
                                                        <li key={fallback.file} className="text-sm text-[#424938]">
                                                            <span className="font-medium">{fallback.file}</span> — {fallback.type || 'unknown'} at {new Date(fallback.timestamp).toLocaleString()}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[#424938]">No webhook fallback events have been logged yet.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[#424938]">Loading webhook status…</p>
                                )}
                            </div>

                            {(session?.role === 'agent' || session?.role === 'uploader') && (
                                <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="text-2xl font-semibold">Submission audit</h2>
                                            <p className="text-sm text-[#424938]">Review preserved signature files and PDF fallback logs.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={fetchSubmissionAudit}
                                            className="rounded-full bg-[#8CC444] px-4 py-2 text-sm font-semibold text-[#102000] hover:opacity-90"
                                        >Refresh audit</button>
                                    </div>
                                    {auditError && <p className="text-sm text-red-600 mb-4">{auditError}</p>}
                                    {auditData ? (
                                        <div className="space-y-4 text-sm text-[#424938]">
                                            <div className="rounded-3xl border border-[#e5f3d5] bg-[#f7fbeb] p-4">
                                                <p className="font-semibold">Summary</p>
                                                <p>Signature files: <span className="font-semibold">{auditData.signatureFiles?.length ?? 0}</span></p>
                                                <p>PDF error logs: <span className="font-semibold">{auditData.pdfErrorLogs?.length ?? 0}</span></p>
                                                <p>Submission files: <span className="font-semibold">{auditData.submissions?.length ?? 0}</span></p>
                                            </div>
                                            {auditData.signatureFiles?.length > 0 && (
                                                <div className="rounded-3xl border border-[#d9dbcd] bg-white p-4">
                                                    <p className="font-semibold mb-3">Signature files</p>
                                                    <ul className="space-y-2">
                                                        {auditData.signatureFiles.map((file: any) => (
                                                            <li key={file.name} className="text-sm text-[#424938]">
                                                                <span className="font-medium">{file.name}</span> — {Math.round((file.size || 0) / 1024)} KB — updated {new Date(file.modified).toLocaleString()}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {auditData.pdfErrorLogs?.length > 0 && (
                                                <div className="rounded-3xl border border-[#d9dbcd] bg-white p-4">
                                                    <p className="font-semibold mb-3">PDF error logs</p>
                                                    <ul className="space-y-2">
                                                        {auditData.pdfErrorLogs.map((log: any) => (
                                                            <li key={log.name} className="text-sm text-[#424938]">
                                                                <span className="font-medium">{log.name}</span> — {Math.round((log.size || 0) / 1024)} KB — updated {new Date(log.modified).toLocaleString()}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[#424938]">Press refresh to load the latest audit data.</p>
                                    )}
                                </div>
                            )}

                            {canUpload && (
                                <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                                    <h2 className="text-2xl font-semibold mb-4">Upload a document</h2>
                                    <form className="space-y-4" onSubmit={handleUpload}>
                                        <label className="block">
                                            <span className="text-sm font-medium text-[#424938]">Select document</span>
                                            <select
                                                value={uploadKey}
                                                onChange={(event: ChangeEvent<HTMLSelectElement>) => setUploadKey(event.target.value)}
                                                className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444]"
                                                required
                                            >
                                                <option value="">Choose document</option>
                                                {documents.map(doc => (
                                                    <option key={doc.key} value={doc.key}>{doc.title}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-[#424938]">PDF file</span>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(event: ChangeEvent<HTMLInputElement>) => setUploadFile(event.target.files?.[0] || null)}
                                                className="mt-2 w-full text-sm text-[#424938]"
                                                required
                                            />
                                        </label>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="rounded-full bg-[#8CC444] px-5 py-3 font-semibold text-[#102000] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {loading ? 'Uploading…' : 'Upload document'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
                            <h2 className="text-2xl font-semibold mb-4">How this works</h2>
                            <ul className="space-y-3 text-sm text-[#424938]">
                                <li>• Log in using your Document Center credentials.</li>
                                <li>• Access current business documents and resources.</li>
                                {canUpload && <li>• Upload and manage documents with your authorized uploader role.</li>}
                                <li>• All files are securely stored and available for authorized access.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
