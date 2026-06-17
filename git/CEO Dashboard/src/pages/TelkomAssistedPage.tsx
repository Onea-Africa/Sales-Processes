import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TelkomPortal from '../components/telkom/TelkomPortal';

const SESSION_STORAGE_KEY = 'launch_platform_session';

interface StoredSession {
  token: string;
  session: {
    displayName: string;
    role: string;
  };
}

export default function TelkomAssistedPage() {
  const navigate = useNavigate();
  const [stored, setStored] = useState<StoredSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed?.token && parsed?.session) {
        setStored(parsed);
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  if (!stored?.token) {
    return (
      <main className="min-h-screen bg-[#f8fbec] px-6 py-16 text-[#1a1c18]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Launch Platform</p>
          <h1 className="mb-3 text-3xl font-bold">Login required</h1>
          <p className="mb-6 text-sm text-[#424938]">
            Sign in first, then open the assisted Telkom application from Launch Platform.
          </p>
          <Link to="/launch-platform" className="inline-flex rounded-full bg-[#8CC444] px-5 py-3 font-bold text-[#102000]">
            Go to Launch Platform
          </Link>
        </div>
      </main>
    );
  }

  return <TelkomPortal assisted authToken={stored.token} onClose={() => navigate('/launch-platform')} />;
}
