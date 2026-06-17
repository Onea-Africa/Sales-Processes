import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { suppliers, supplierCategories, type Supplier, type SupplierCategory } from '../data/suppliers';

type LaunchSession = {
  token?: string;
  session?: {
    displayName?: string;
    role?: string;
  };
};

const SESSION_STORAGE_KEY = 'launch_platform_session';
const BUILDER_IDS = new Set([
  'wifi-home',
  'wifi-business',
  'website',
  'hosting',
  'systems',
  'marketing',
  'communications',
  'it-hardware',
  'cybersecurity-firewall',
  'apple-devices',
  'voip-uc',
  'cctv-access',
  'structured-cabling',
  'cloud-licensing',
  'energy-ups',
  'pos-hardware',
]);

const categoryClasses: Record<SupplierCategory, string> = {
  'IT Hardware & Software': 'bg-[#0078D4]/10 text-[#005a9e] border-[#0078D4]/25',
  'Gadgets & Consumer Electronics': 'bg-[#8CC444]/15 text-[#416900] border-[#8CC444]/30',
  'Apple Devices & Ecosystem': 'bg-[#6e6e73]/10 text-[#3f3f46] border-[#6e6e73]/20',
  Networking: 'bg-[#D32F2F]/10 text-[#a92323] border-[#D32F2F]/20',
  'All-Rounder': 'bg-[#00897B]/10 text-[#00695c] border-[#00897B]/20',
};

function readLaunchSession(): LaunchSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as LaunchSession;
    return parsed?.token && parsed?.session ? parsed : null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function searchableText(supplier: Supplier) {
  return [
    supplier.name,
    supplier.accountNumber,
    supplier.category,
    supplier.bestFor,
    supplier.notes || '',
    ...supplier.tags,
    ...supplier.brands,
    ...(supplier.partnerIds || []).flatMap(item => [item.label, item.value]),
    ...supplier.productPaths.flatMap(path => [path.name, ...path.products]),
  ].join(' ').toLowerCase();
}

export default function SupplierDirectoryPage() {
  const launchSession = readLaunchSession();
  const role = launchSession?.session?.role || '';
  const canView = ['admin', 'agent', 'uploader', 'pr', 'comms'].includes(role);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | SupplierCategory>('All');
  const [copiedId, setCopiedId] = useState('');
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter(supplier => {
      const matchesCategory = category === 'All' || supplier.category === category;
      const matchesSearch = !q || searchableText(supplier).includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  async function copyAccount(supplier: Supplier) {
    await navigator.clipboard.writeText(supplier.accountNumber);
    setCopiedId(`${supplier.id}-account`);
    window.setTimeout(() => setCopiedId(''), 1800);
  }

  async function copyPartnerId(supplier: Supplier, label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(`${supplier.id}-${label}`);
    window.setTimeout(() => setCopiedId(''), 1800);
  }

  if (!launchSession) {
    return <Navigate to="/launch-platform?redirect=/launch-platform/suppliers" replace />;
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#f8fbec] px-6 py-12 text-[#1a1c18] lg:px-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
          <p className="font-label-caps text-sm font-bold uppercase tracking-[0.24em] text-[#D6139F]">Secure resource</p>
          <h1 className="mt-3 text-3xl font-bold">Supplier Directory is restricted</h1>
          <p className="mt-3 text-[#424938]">This area is available to Onea admins and agents only.</p>
          <Link to="/launch-platform" className="mt-6 inline-flex rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000]">
            Back to Launch Platform
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbec] px-6 py-10 text-[#1a1c18] lg:px-12">
      <div className="mx-auto max-w-[1280px] space-y-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-label-caps text-sm font-bold uppercase tracking-[0.24em] text-[#8CC444]">Launch Platform</p>
            <h1 className="mt-3 text-[2.4rem] font-bold leading-tight">Supplier Directory</h1>
            <p className="mt-3 max-w-3xl text-[#424938]">
              Internal supplier partnerships mapped to Onea Solution Builder quote paths. Account numbers and supplier notes are for logged-in Onea staff only.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/pricing?agent=1" className="rounded-full bg-[#D6139F] px-5 py-3 text-sm font-bold text-white hover:opacity-90">
              Open Onea Solution Builder
            </Link>
            <Link to="/launch-platform" className="rounded-full border border-[#d9dbcd] bg-white px-5 py-3 text-sm font-bold text-[#102000] hover:border-[#8CC444]">
              Back to Launch Platform
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <label>
              <span className="text-sm font-semibold text-[#424938]">Search suppliers, brands, product paths, or account numbers</span>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#fbfcf6] px-5 py-3 outline-none focus:border-[#8CC444]"
                placeholder="Example: Ubiquiti, Microsoft 365, cabling, Apple..."
              />
            </label>
            <p className="text-sm font-semibold text-[#424938]">{filteredSuppliers.length} of {suppliers.length} suppliers</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {supplierCategories.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-xs font-bold ${category === item ? 'border-[#8CC444] bg-[#8CC444] text-[#102000]' : 'border-[#d9dbcd] bg-white text-[#424938]'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {filteredSuppliers.map(supplier => {
            const expanded = Boolean(expandedBrands[supplier.id]);
            const brands = expanded ? supplier.brands : supplier.brands.slice(0, 7);
            return (
              <article key={supplier.id} className="rounded-3xl border border-[#d9dbcd] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-[#102000]">{supplier.name}</h2>
                    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${categoryClasses[supplier.category]}`}>
                      {supplier.category}
                    </span>
                  </div>
                  <a href={supplier.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#d9dbcd] px-4 py-2 text-sm font-bold text-[#102000] hover:border-[#8CC444]">
                    Visit portal
                  </a>
                </div>

                <div className="mt-5 rounded-2xl bg-[#fbfcf6] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6656]">Account number</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="rounded-full border border-[#d9dbcd] bg-white px-4 py-2 text-sm font-bold text-[#102000]">{supplier.accountNumber}</code>
                    <button type="button" onClick={() => copyAccount(supplier)} className="rounded-full bg-[#8CC444] px-4 py-2 text-xs font-bold text-[#102000]">
                      {copiedId === `${supplier.id}-account` ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {supplier.partnerIds?.length ? (
                  <div className="mt-3 rounded-2xl border border-[#D6139F]/20 bg-[#D6139F]/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6656]">Partner IDs / POS IDs</p>
                    <div className="mt-3 space-y-3">
                      {supplier.partnerIds.map(item => (
                        <div key={`${supplier.id}-${item.label}`} className="flex flex-wrap items-center gap-3">
                          <span className="text-sm font-semibold text-[#424938]">{item.label}</span>
                          <code className="rounded-full border border-[#d9dbcd] bg-white px-4 py-2 text-sm font-bold text-[#102000]">{item.value}</code>
                          <button
                            type="button"
                            onClick={() => copyPartnerId(supplier, item.label, item.value)}
                            className="rounded-full bg-[#D6139F] px-4 py-2 text-xs font-bold text-white"
                          >
                            {copiedId === `${supplier.id}-${item.label}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6656]">Best for</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#424938]">{supplier.bestFor}</p>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6656]">Onea Solution Builder paths</p>
                  <div className="mt-3 grid gap-3">
                    {supplier.productPaths.map(path => {
                      const hasBuilder = BUILDER_IDS.has(path.builderId);
                      return (
                        <div key={`${supplier.id}-${path.builderId}-${path.name}`} className="rounded-2xl border border-[#e5eadc] bg-[#fbfcf6] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-[#102000]">{path.name}</p>
                              <p className="mt-1 text-xs text-[#5f6656]">{path.products.join(' / ')}</p>
                            </div>
                            {hasBuilder && (
                              <Link to={`/pricing?agent=1&solution=${encodeURIComponent(path.builderId)}`} className="rounded-full bg-[#D6139F] px-4 py-2 text-center text-xs font-bold text-white hover:opacity-90">
                                Build quote
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6656]">Brands</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {brands.map(brand => (
                      <span key={brand} className="rounded-full border border-[#d9dbcd] bg-white px-3 py-1 text-xs font-semibold text-[#424938]">{brand}</span>
                    ))}
                  </div>
                  {supplier.brands.length > 7 && (
                    <button
                      type="button"
                      onClick={() => setExpandedBrands(prev => ({ ...prev, [supplier.id]: !expanded }))}
                      className="mt-3 text-sm font-bold text-[#D6139F]"
                    >
                      {expanded ? 'Show fewer brands' : `Show ${supplier.brands.length - 7} more brands`}
                    </button>
                  )}
                </div>

                {supplier.notes && (
                  <div className="mt-5 rounded-2xl border border-[#F4D350]/50 bg-[#F4D350]/15 p-4 text-sm text-[#5f4b00]">
                    {supplier.notes}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
