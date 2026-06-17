import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  HARDWARE_CATEGORIES,
  HARDWARE_SUPPLIERS,
  HardwareCartLine,
  HardwareCategory,
  HardwareProduct,
  HardwareSupplier,
  calculateSellPrice,
  hardwareProducts,
} from '../data/hardwareProcurement';

interface UserSession {
  displayName: string;
  role: string;
}

interface NologyFeedProduct {
  id: string;
  supplier: 'Nology';
  sku: string;
  model: string;
  brand: string;
  category: string;
  description: string;
  longDescription?: string;
  stock: number;
  stockLabel: string;
  dealerCost: number;
  imageUrl?: string;
  barcode?: string;
  relatedItems?: string;
}

interface AsbisFeedProduct {
  id: string;
  supplier: 'ASBIS';
  sku: string;
  model: string;
  brand: string;
  category: string;
  description: string;
  stock: number;
  stockLabel: string;
  dealerCost: number;
  imageUrl?: string;
  isInStock?: boolean;
  isOutOfBox?: boolean;
  itemKind?: 'device' | 'accessory';
}

const SESSION_STORAGE_KEY = 'launch_platform_session';
const CART_STORAGE_KEY = 'onea_hardware_procurement_cart';

function readSession(): UserSession | null {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { session?: UserSession };
    return parsed.session || null;
  } catch {
    return null;
  }
}

function money(value: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value);
}

function productPublicName(product: HardwareProduct) {
  if (product.category === 'Apple Procurement') {
    return `${product.brand} ${product.model}`;
  }
  return `${product.brand} ${product.model}`;
}

export default function HardwareProcurementPage() {
  const [session, setSession] = useState<UserSession | null>(() => readSession());
  const [query, setQuery] = useState('');
  const [supplier, setSupplier] = useState<'All' | HardwareSupplier>('All');
  const [category, setCategory] = useState<'All' | HardwareCategory>('All');
  const [cart, setCart] = useState<HardwareCartLine[]>([]);
  const [clientName, setClientName] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [notice, setNotice] = useState('');
  const [nologyBrand, setNologyBrand] = useState('');
  const [nologyProduct, setNologyProduct] = useState('');
  const [nologyProducts, setNologyProducts] = useState<HardwareProduct[]>([]);
  const [nologyLoading, setNologyLoading] = useState(false);
  const [nologyError, setNologyError] = useState('');
  const [asbisBrand, setAsbisBrand] = useState('Apple');
  const [asbisProduct, setAsbisProduct] = useState('');
  const [asbisProducts, setAsbisProducts] = useState<HardwareProduct[]>([]);
  const [asbisLoading, setAsbisLoading] = useState(false);
  const [asbisError, setAsbisError] = useState('');
  const [asbisStockFilter, setAsbisStockFilter] = useState<'all' | 'in-stock'>('all');
  const [asbisKindFilter, setAsbisKindFilter] = useState<'all' | 'device' | 'accessory'>('all');

  useEffect(() => {
    setSession(readSession());
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as HardwareCartLine[];
      if (Array.isArray(parsed)) setCart(parsed);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const allowedRoles = ['admin', 'uploader', 'agent', 'pr', 'comms'];
  const role = session?.role || '';
  const canAccess = Boolean(session && allowedRoles.includes(role));
  const canOrder = ['admin', 'uploader'].includes(role);
  const canSeeCost = ['admin', 'uploader', 'agent', 'pr', 'comms'].includes(role);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return hardwareProducts.filter(product => {
      const supplierOk = supplier === 'All' || product.supplier === supplier;
      const categoryOk = category === 'All' || product.category === category;
      const searchOk =
        !q ||
        product.sku.toLowerCase().includes(q) ||
        product.model.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      return supplierOk && categoryOk && searchOk;
    });
  }, [category, query, supplier]);

  const cartLines = useMemo(() => cart.map(line => {
    const product = line.product || hardwareProducts.find(item => item.id === line.productId);
    if (!product) return null;
    const floorMarginPercent = product.floorMarginPercent ?? (product.supplier === 'ASBIS' ? 15 : 20);
    const marginPercent = Math.max(floorMarginPercent, line.marginPercent);
    const unitSell = calculateSellPrice(product.dealerCost, marginPercent);
    const unitFloor = calculateSellPrice(product.dealerCost, floorMarginPercent);
    const unitSetup = line.includeSetup ? product.setupFee : 0;
    return {
      ...line,
      product,
      marginPercent,
      floorMarginPercent,
      unitSell,
      unitFloor,
      lineHardware: unitSell * line.quantity,
      lineSetup: unitSetup * line.quantity,
      total: (unitSell + unitSetup) * line.quantity,
      floorTotal: (unitFloor + unitSetup) * line.quantity,
      negotiationBand: Math.max(0, (unitSell - unitFloor) * line.quantity),
      costTotal: product.dealerCost * line.quantity,
    };
  }).filter(Boolean), [cart]);

  const totals = useMemo(() => {
    const hardware = cartLines.reduce((sum, line) => sum + (line?.lineHardware || 0), 0);
    const setup = cartLines.reduce((sum, line) => sum + (line?.lineSetup || 0), 0);
    const cost = cartLines.reduce((sum, line) => sum + (line?.costTotal || 0), 0);
    return {
      hardware,
      setup,
      total: hardware + setup,
      cost,
      margin: hardware + setup - cost,
    };
  }, [cartLines]);

  if (!session) {
    return <Navigate to="/launch-platform?redirect=/launch-platform/hardware" replace />;
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-[#f8fbec] px-6 py-12 text-[#1a1c18]">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Launch Platform</p>
          <h1 className="text-3xl font-bold">Hardware Procurement access required</h1>
          <p className="mt-3 text-[#424938]">This area is restricted to agents and admins.</p>
          <Link to="/launch-platform" className="mt-6 inline-flex rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000]">
            Back to Launch Platform
          </Link>
        </div>
      </div>
    );
  }

  function addProduct(product: HardwareProduct) {
    setCart(current => {
      const existing = current.find(line => line.productId === product.id);
      if (existing) {
        return current.map(line => line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [
        ...current,
        {
          productId: product.id,
          quantity: 1,
          marginPercent: product.suggestedMarginPercent,
          includeSetup: product.setupFee > 0,
        },
      ];
    });
    setNotice(`${productPublicName(product)} added to quote cart.`);
  }

  async function searchNologyFeed() {
    const brand = nologyBrand.trim();
    const product = nologyProduct.trim();
    if (!brand && !product) {
      setNologyError('Enter a brand or product model before searching.');
      return;
    }

    setNologyLoading(true);
    setNologyError('');
    setNotice('');

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      const token = stored ? (JSON.parse(stored)?.token || '') : '';
      const response = await fetch('/api/nology-products.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ brand, product }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'Nology API endpoint returned an unexpected response.');
      }

      const products = Array.isArray(payload.products) ? payload.products : [];
      const mapped = products.map((item: NologyFeedProduct): HardwareProduct => ({
        id: item.id,
        supplier: 'Nology',
        sku: item.sku || item.model,
        model: item.model || item.sku,
        brand: item.brand || 'Nology',
        category: mapNologyCategory(item.category, item.description),
        description: item.description || item.longDescription || 'Nology product feed item.',
        stockLabel: item.stockLabel || `Available stock: ${item.stock || 0}`,
        dealerCost: Number(item.dealerCost) || 0,
        suggestedMarginPercent: 50,
        floorMarginPercent: 22,
        setupFee: suggestedSetupFee(item.category, item.description),
        imageUrl: item.imageUrl,
        sourceNote: 'Live Nology Product Data Feed. Confirm stock before final quote or purchase order.',
      }));
      setNologyProducts(mapped);
      setNotice(mapped.length ? `${mapped.length} Nology product${mapped.length === 1 ? '' : 's'} loaded.` : 'No Nology products matched that search.');
    } catch (error) {
      setNologyProducts([]);
      setNologyError(error instanceof Error ? error.message : 'Could not search Nology feed.');
    } finally {
      setNologyLoading(false);
    }
  }

  async function searchAsbisFeed() {
    const brand = asbisBrand.trim();
    const product = asbisProduct.trim();
    if (!brand && !product) {
      setAsbisError('Enter Apple, MacBook, iPad, iPhone, accessory or SKU before searching.');
      return;
    }

    setAsbisLoading(true);
    setAsbisError('');
    setNotice('');

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      const token = stored ? (JSON.parse(stored)?.token || '') : '';
      const response = await fetch('/api/asbis-products.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ brand, product }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'ASBIS API endpoint returned an unexpected response.');
      }

      const products = Array.isArray(payload.products) ? payload.products : [];
      const mapped = products.map((item: AsbisFeedProduct): HardwareProduct => ({
        id: item.id,
        supplier: 'ASBIS',
        sku: item.sku || item.model,
        model: item.model || item.sku,
        brand: item.brand || 'Apple',
        category: mapAsbisCategory(item.category, item.description, item.model),
        description: item.description || 'ASBIS Apple procurement feed item.',
        stockLabel: item.stockLabel || `Available stock: ${item.stock || 0}`,
        dealerCost: Number(item.dealerCost) || 0,
        stock: Number(item.stock) || 0,
        isInStock: Boolean(item.isInStock || Number(item.stock) > 0),
        isOutOfBox: Boolean(item.isOutOfBox),
        itemKind: item.itemKind || 'device',
        suggestedMarginPercent: 35,
        floorMarginPercent: 15,
        setupFee: suggestedAsbisSetupFee(item.category, item.description, item.model),
        imageUrl: item.imageUrl,
        complianceNote: 'DPP wording only. Do not use Apple Authorised Reseller, AAR branding, official reseller claims or Apple reseller logos.',
        sourceNote: 'Live ASBIS IT4Profit ProductList / PriceAvail feed. Confirm stock, model and pricing before final quote.',
      }));
      setAsbisProducts(mapped);
      setNotice(mapped.length ? `${mapped.length} ASBIS product${mapped.length === 1 ? '' : 's'} loaded.` : 'No ASBIS products matched that search.');
    } catch (error) {
      setAsbisProducts([]);
      setAsbisError(error instanceof Error ? error.message : 'Could not search ASBIS feed.');
    } finally {
      setAsbisLoading(false);
    }
  }

  const displayedAsbisProducts = useMemo(() => {
    return asbisProducts.filter(product => {
      const stockOk = asbisStockFilter === 'all' || product.isInStock;
      const kindOk = asbisKindFilter === 'all' || product.itemKind === asbisKindFilter;
      return stockOk && kindOk;
    });
  }, [asbisKindFilter, asbisProducts, asbisStockFilter]);

  function addLiveSupplierProduct(product: HardwareProduct) {
    setCart(current => {
      const existing = current.find(line => line.productId === product.id);
      if (existing) {
        return current.map(line => line.productId === product.id ? { ...line, quantity: line.quantity + 1, product } : line);
      }
      return [
        ...current,
        {
          productId: product.id,
          product,
          quantity: 1,
          marginPercent: product.suggestedMarginPercent,
          includeSetup: product.setupFee > 0,
        },
      ];
    });
    setNotice(`${productPublicName(product)} added to quote cart.`);
  }

  function updateLine(productId: string, patch: Partial<HardwareCartLine>) {
    setCart(current => current.map(line => line.productId === productId ? { ...line, ...patch } : line));
  }

  function removeLine(productId: string) {
    setCart(current => current.filter(line => line.productId !== productId));
  }

  function clearCart() {
    setCart([]);
    setNotice('Quote cart cleared.');
  }

  async function copyQuote() {
    const lines = cartLines.map(line => {
      if (!line) return '';
      return [
        `${line.quantity} x ${productPublicName(line.product)} (${line.product.sku})`,
        `Supplier source: ${line.product.supplier}`,
        `Sell: ${money(line.unitSell)} each`,
        line.includeSetup ? `Setup: ${money(line.product.setupFee)} each` : 'Setup: not included',
        `Line total: ${money(line.total)}`,
      ].join('\n');
    }).join('\n\n');

    const quote = [
      `Onea Africa Hardware Procurement Quote Draft`,
      clientName ? `Client: ${clientName}` : 'Client: Not captured',
      `Prepared by: ${session?.displayName || 'Launch Platform'}`,
      '',
      lines || 'No items selected.',
      '',
      `Hardware subtotal: ${money(totals.hardware)}`,
      `Setup subtotal: ${money(totals.setup)}`,
      `Estimated total: ${money(totals.total)}`,
      '',
      'Notes:',
      quoteNote || 'Final pricing depends on live supplier stock, delivery, VAT, warranty terms and configuration requirements.',
      '',
      'Internal reminder: confirm stock before sending final quote. Do not expose supplier costs or account credentials to clients.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(quote);
      setNotice('Quote draft copied.');
    } catch {
      setNotice('Could not copy quote draft. Please select the cart text manually.');
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fbec] px-6 py-10 text-[#1a1c18] lg:px-12">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8CC444]">Launch Platform</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight">Hardware Procurement</h1>
            <p className="mt-3 max-w-3xl text-[#424938]">
              Controlled supplier catalogue, quote cart and procurement workflow for ASBIS, Nology and manual hardware sourcing.
            </p>
          </div>
          <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 text-sm shadow-sm">
            <p className="font-semibold text-[#102000]">{session.displayName}</p>
            <p className="text-[#424938]">Role: {session.role}</p>
            <Link to="/launch-platform" className="mt-3 inline-flex rounded-full border border-[#d9dbcd] px-4 py-2 font-bold text-[#102000] hover:border-[#8CC444]">
              Back to Launch Platform
            </Link>
          </div>
        </div>

        {notice && <div className="rounded-3xl border border-[#e5f3d5] bg-white p-4 text-sm font-semibold text-[#416900]">{notice}</div>}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-[#D6139F]/20 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#102000]">ASBIS Apple DPP Guardrail</h2>
            <p className="mt-2 text-sm text-[#424938]">
              Use Apple device procurement wording only. Do not publish Apple Authorised Reseller, AAR, official reseller claims or Apple reseller logos.
            </p>
          </div>
          <div className="rounded-3xl border border-[#8CC444]/30 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#102000]">Supplier Product Feeds</h2>
            <p className="mt-2 text-sm text-[#424938]">
              Search ASBIS and Nology stock through server-side connectors. Credentials are never exposed to the browser.
            </p>
          </div>
          <div className="rounded-3xl border border-[#F4D350]/60 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[#102000]">Ordering Control</h2>
            <p className="mt-2 text-sm text-[#424938]">
              Agents prepare quotes. Admin/uploader confirms stock, reserves supplier stock and creates purchase orders.
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_460px]">
          <main className="space-y-5">
            <section className="rounded-3xl border border-[#D6139F]/30 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D6139F]">Live Supplier Feed</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#102000]">ASBIS stock search</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#424938]">
                    Use this for Apple device procurement, MacBook, iPad, iPhone and Apple accessories. Pricing and stock are internal checks before a final client quote.
                  </p>
                </div>
                <span className="rounded-full bg-[#fff7fb] px-4 py-2 text-xs font-bold text-[#9f0f75]">Apple DPP guardrails apply</span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={asbisBrand}
                  onChange={(event) => setAsbisBrand(event.target.value)}
                  placeholder="Brand, e.g. Apple"
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#D6139F]"
                />
                <input
                  value={asbisProduct}
                  onChange={(event) => setAsbisProduct(event.target.value)}
                  placeholder="Product/SKU, e.g. MacBook Neo"
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#D6139F]"
                />
                <button
                  type="button"
                  onClick={searchAsbisFeed}
                  disabled={asbisLoading}
                  className="rounded-full bg-[#102000] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {asbisLoading ? 'Searching...' : 'Search ASBIS'}
                </button>
              </div>
              {asbisProducts.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-3xl border border-[#f1d1e9] bg-[#fff7fb] p-3">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c115c]">Filter ASBIS results</span>
                  <button
                    type="button"
                    onClick={() => setAsbisStockFilter(asbisStockFilter === 'all' ? 'in-stock' : 'all')}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${asbisStockFilter === 'in-stock' ? 'bg-[#D6139F] text-white' : 'border border-[#f1d1e9] bg-white text-[#102000]'}`}
                  >
                    {asbisStockFilter === 'in-stock' ? 'In stock only' : 'Show all stock'}
                  </button>
                  {(['all', 'device', 'accessory'] as const).map(kind => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setAsbisKindFilter(kind)}
                      className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${asbisKindFilter === kind ? 'bg-[#102000] text-white' : 'border border-[#d9dbcd] bg-white text-[#102000]'}`}
                    >
                      {kind === 'all' ? 'All items' : `${kind}s`}
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-[#6f7468]">{displayedAsbisProducts.length} shown from {asbisProducts.length}</span>
                </div>
              )}
              {asbisError && <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{asbisError}</p>}
              {asbisProducts.length > 0 && (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {displayedAsbisProducts.map(product => {
                    const sellPrice = calculateSellPrice(product.dealerCost, product.suggestedMarginPercent);
                    return (
                      <article key={product.id} className="rounded-3xl border border-[#d9dbcd] bg-[#fbfcf6] p-5">
                        <div className="flex gap-4">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt="" className="h-20 w-20 rounded-2xl border border-[#edf0e4] bg-white object-contain p-2" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D6139F]">{product.brand}</p>
                            <h3 className="mt-1 text-lg font-bold text-[#102000]">{productPublicName(product)}</h3>
                            <p className="mt-1 text-xs font-semibold text-[#6f7468]">{product.sku}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${product.isInStock ? 'bg-[#8CC444]/20 text-[#416900]' : 'bg-[#f3f4ef] text-[#6f7468]'}`}>
                                {product.isInStock ? 'In stock' : 'Zero stock'}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#102000]">
                                {product.itemKind === 'accessory' ? 'Accessory' : 'Device'}
                              </span>
                              {product.isOutOfBox && (
                                <span className="rounded-full bg-[#F4D350]/30 px-3 py-1 text-[11px] font-bold text-[#6A5500]">
                                  Out of Box
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#424938]">{product.description}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-white p-3 text-sm">
                            <p className="text-[#6f7468]">Stock</p>
                            <p className="font-semibold text-[#102000]">{product.stockLabel}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3 text-sm">
                            <p className="text-[#6f7468]">Dealer cost</p>
                            <p className="font-semibold text-[#6A5500]">{money(product.dealerCost)}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3 text-sm">
                            <p className="text-[#6f7468]">Suggested sell</p>
                            <p className="font-semibold text-[#102000]">{money(sellPrice)}</p>
                          </div>
                        </div>
                        {product.complianceNote && (
                          <p className="mt-4 rounded-2xl border border-[#f1d1e9] bg-[#D6139F]/5 p-4 text-sm text-[#7c115c]">{product.complianceNote}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => addLiveSupplierProduct(product)}
                          className="mt-4 rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000] hover:opacity-90"
                        >
                          Add ASBIS item to quote
                        </button>
                      </article>
                    );
                  })}
                  {displayedAsbisProducts.length === 0 && (
                    <p className="rounded-3xl border border-[#d9dbcd] bg-[#fbfcf6] p-5 text-sm font-semibold text-[#424938]">
                      No ASBIS results match the current filters. Switch to all stock or all items to review the wider catalogue.
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-[#8CC444]/40 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8CC444]">Live Supplier Feed</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#102000]">Nology stock search</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#424938]">
                    Use this for Yealink, Zyxel, MikroTik, 3CX and unified communications hardware. Prices shown here are internal supplier pricing only.
                  </p>
                </div>
                <span className="rounded-full bg-[#fff7fb] px-4 py-2 text-xs font-bold text-[#9f0f75]">Internal use only</span>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={nologyBrand}
                  onChange={(event) => setNologyBrand(event.target.value)}
                  placeholder="Brand, e.g. Yealink"
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                />
                <input
                  value={nologyProduct}
                  onChange={(event) => setNologyProduct(event.target.value)}
                  placeholder="Model/SKU, e.g. SIP-T33G"
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                />
                <button
                  type="button"
                  onClick={searchNologyFeed}
                  disabled={nologyLoading}
                  className="rounded-full bg-[#102000] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {nologyLoading ? 'Searching...' : 'Search Nology'}
                </button>
              </div>
              {nologyError && <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{nologyError}</p>}
              {nologyProducts.length > 0 && (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {nologyProducts.map(product => {
                    const sellPrice = calculateSellPrice(product.dealerCost, product.suggestedMarginPercent);
                    return (
                      <article key={product.id} className="rounded-3xl border border-[#d9dbcd] bg-[#fbfcf6] p-5">
                        <div className="flex gap-4">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt="" className="h-20 w-20 rounded-2xl border border-[#edf0e4] bg-white object-contain p-2" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8CC444]">{product.brand}</p>
                            <h3 className="mt-1 text-lg font-bold text-[#102000]">{productPublicName(product)}</h3>
                            <p className="mt-1 text-xs font-semibold text-[#6f7468]">{product.sku}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#424938]">{product.description}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-white p-3 text-sm">
                            <p className="text-[#6f7468]">Stock</p>
                            <p className="font-semibold text-[#102000]">{product.stockLabel}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3 text-sm">
                            <p className="text-[#6f7468]">Dealer cost</p>
                            <p className="font-semibold text-[#6A5500]">{money(product.dealerCost)}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3 text-sm">
                            <p className="text-[#6f7468]">Suggested sell</p>
                            <p className="font-semibold text-[#102000]">{money(sellPrice)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addLiveSupplierProduct(product)}
                          className="mt-4 rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000] hover:opacity-90"
                        >
                          Add live item to quote
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
                <input
                  value={query}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                  placeholder="Search SKU, model, brand or description"
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                />
                <select
                  value={supplier}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setSupplier(event.target.value as 'All' | HardwareSupplier)}
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                >
                  {HARDWARE_SUPPLIERS.map(value => <option key={value} value={value}>{value === 'All' ? 'All suppliers' : value}</option>)}
                </select>
                <select
                  value={category}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value as 'All' | HardwareCategory)}
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                >
                  {HARDWARE_CATEGORIES.map(value => <option key={value} value={value}>{value === 'All' ? 'All categories' : value}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {filtered.map(product => {
                const sellPrice = calculateSellPrice(product.dealerCost, product.suggestedMarginPercent);
                return (
                  <article key={product.id} className="rounded-3xl border border-[#d9dbcd] bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8CC444]">{product.supplier} - {product.category}</p>
                        <h2 className="mt-2 text-xl font-bold text-[#102000]">{productPublicName(product)}</h2>
                        <p className="mt-1 text-sm font-semibold text-[#424938]">{product.sku}</p>
                      </div>
                      <span className="rounded-full bg-[#f7faf2] px-3 py-1 text-xs font-bold text-[#416900]">{product.brand}</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#424938]">{product.description}</p>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#fbfcf6] p-4">
                        <p className="text-[#6f7468]">Stock</p>
                        <p className="mt-1 font-semibold text-[#102000]">{product.stockLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-[#fbfcf6] p-4">
                        <p className="text-[#6f7468]">Suggested sell</p>
                        <p className="mt-1 font-semibold text-[#102000]">{money(sellPrice)}</p>
                      </div>
                      {canSeeCost && (
                        <div className="rounded-2xl bg-[#fffdf2] p-4">
                          <p className="text-[#6f7468]">Dealer cost</p>
                          <p className="mt-1 font-semibold text-[#6A5500]">{money(product.dealerCost)}</p>
                        </div>
                      )}
                      <div className="rounded-2xl bg-[#fbfcf6] p-4">
                        <p className="text-[#6f7468]">Setup option</p>
                        <p className="mt-1 font-semibold text-[#102000]">{money(product.setupFee)}</p>
                      </div>
                    </div>
                    {product.complianceNote && (
                      <p className="mt-4 rounded-2xl border border-[#f1d1e9] bg-[#D6139F]/5 p-4 text-sm text-[#7c115c]">{product.complianceNote}</p>
                    )}
                    <p className="mt-4 text-xs text-[#6f7468]">{product.sourceNote}</p>
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      className="mt-5 rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000] hover:opacity-90"
                    >
                      Add to quote
                    </button>
                  </article>
                );
              })}
            </div>
          </main>

          <aside className="space-y-5">
            <div className="sticky top-24 rounded-3xl border border-[#d9dbcd] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Quote Cart</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#102000]">{cartLines.length} items</h2>
                </div>
                <button type="button" onClick={clearCart} className="rounded-full border border-[#d9dbcd] px-3 py-2 text-xs font-bold text-[#102000] hover:border-[#8CC444]">
                  Clear
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <input
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Client / company name"
                  className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                />
                <textarea
                  value={quoteNote}
                  onChange={(event) => setQuoteNote(event.target.value)}
                  placeholder="Quote notes, delivery or setup requirements"
                  rows={3}
                  className="rounded-3xl border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                />
              </div>

              <div className="mt-5 max-h-[480px] space-y-4 overflow-y-auto pr-1">
                {cartLines.map(line => line && (
                  <div key={line.productId} className="rounded-3xl border border-[#d9dbcd] bg-[#fbfcf6] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#102000]">{productPublicName(line.product)}</p>
                        <p className="mt-1 text-xs text-[#6f7468]">{line.product.supplier} - {line.product.sku}</p>
                      </div>
                      <button type="button" onClick={() => removeLine(line.productId)} className="text-xs font-bold text-[#D6139F]">Remove</button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <label>
                        <span className="text-xs text-[#6f7468]">Qty</span>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(event) => updateLine(line.productId, { quantity: Math.max(1, Number(event.target.value) || 1) })}
                          className="mt-1 w-full rounded-full border border-[#d9dbcd] bg-white px-3 py-2"
                        />
                      </label>
                      <label>
                        <span className="text-xs text-[#6f7468]">Margin %</span>
                        <input
                          type="number"
                          min={line.floorMarginPercent}
                          value={line.marginPercent}
                          onChange={(event) => updateLine(line.productId, {
                            marginPercent: Math.max(line.floorMarginPercent, Number(event.target.value) || line.floorMarginPercent),
                          })}
                          className="mt-1 w-full rounded-full border border-[#d9dbcd] bg-white px-3 py-2"
                        />
                      </label>
                      <label className="flex items-end gap-2 pb-2">
                        <input
                          type="checkbox"
                          checked={line.includeSetup}
                          onChange={(event) => updateLine(line.productId, { includeSetup: event.target.checked })}
                        />
                        <span className="text-xs font-semibold text-[#424938]">Setup</span>
                      </label>
                    </div>
                    <div className="mt-4 rounded-2xl bg-white p-3 text-sm">
                      <p className="flex justify-between"><span>Unit sell</span><strong>{money(line.unitSell)}</strong></p>
                      {canSeeCost && (
                        <>
                          <p className="flex justify-between text-xs text-[#6f7468]"><span>Supplier cost</span><strong>{money(line.product.dealerCost)}</strong></p>
                          <p className="flex justify-between text-xs text-[#6f7468]"><span>Floor ({line.floorMarginPercent}%)</span><strong>{money(line.unitFloor)}</strong></p>
                          <p className="flex justify-between text-xs text-[#6f7468]"><span>Negotiation room</span><strong>{money(line.negotiationBand)}</strong></p>
                        </>
                      )}
                      {line.includeSetup && <p className="flex justify-between"><span>Setup each</span><strong>{money(line.product.setupFee)}</strong></p>}
                      <p className="mt-2 flex justify-between border-t border-[#edf0e4] pt-2"><span>Line total</span><strong>{money(line.total)}</strong></p>
                    </div>
                  </div>
                ))}
                {cartLines.length === 0 && (
                  <p className="rounded-3xl border border-[#d9dbcd] bg-[#fbfcf6] p-5 text-sm text-[#424938]">Add hardware to start a procurement quote.</p>
                )}
              </div>

              <div className="mt-5 space-y-2 rounded-3xl bg-[#102000] p-5 text-white">
                <p className="flex justify-between text-sm"><span>Hardware</span><strong>{money(totals.hardware)}</strong></p>
                <p className="flex justify-between text-sm"><span>Setup</span><strong>{money(totals.setup)}</strong></p>
                <p className="flex justify-between border-t border-white/15 pt-3 text-lg"><span>Total</span><strong>{money(totals.total)}</strong></p>
                {canSeeCost && <p className="text-xs text-white/70">Internal estimated margin: {money(totals.margin)}</p>}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={copyQuote} className="rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000] hover:opacity-90">
                  Copy quote draft
                </button>
                <button
                  type="button"
                  onClick={() => setNotice(canOrder ? 'Live supplier reservation will be connected after credentials are stored server-side.' : 'Admin approval required before supplier reservation.')}
                  className="rounded-full bg-[#D6139F] px-5 py-3 text-sm font-bold text-white hover:opacity-90"
                >
                  {canOrder ? 'Reserve / PO' : 'Request approval'}
                </button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#6f7468]">
                Final customer quote must confirm stock, delivery, VAT, warranty terms and setup scope. Supplier credentials stay server-side only.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function mapNologyCategory(category: string, description: string): HardwareCategory {
  const text = `${category} ${description}`.toLowerCase();
  if (text.includes('phone') || text.includes('yealink') || text.includes('voip') || text.includes('3cx')) return 'VoIP';
  if (text.includes('camera') || text.includes('cctv') || text.includes('nvr')) return 'CCTV';
  if (text.includes('ups') || text.includes('battery') || text.includes('power')) return 'UPS & Power';
  if (text.includes('keyboard') || text.includes('mouse') || text.includes('headset') || text.includes('cable')) return 'Accessories';
  return 'Networking';
}

function mapAsbisCategory(category: string, description: string, model: string): HardwareCategory {
  const text = `${category} ${description} ${model}`.toLowerCase();
  if (text.includes('macbook') || text.includes('notebook') || text.includes('laptop')) return 'Apple Procurement';
  if (text.includes('ipad') || text.includes('iphone') || text.includes('apple') || text.includes('mac mini') || text.includes('imac') || text.includes('mac studio')) return 'Apple Procurement';
  if (text.includes('desktop') || text.includes('monitor') || text.includes('display')) return 'Desktop';
  if (text.includes('keyboard') || text.includes('mouse') || text.includes('pencil') || text.includes('adapter') || text.includes('cable') || text.includes('airpods') || text.includes('case')) return 'Accessories';
  if (text.includes('ups') || text.includes('battery') || text.includes('power')) return 'UPS & Power';
  return 'Apple Procurement';
}

function suggestedSetupFee(category: string, description: string) {
  const mapped = mapNologyCategory(category, description);
  if (mapped === 'VoIP') return 250;
  if (mapped === 'CCTV') return 850;
  if (mapped === 'UPS & Power') return 250;
  return 650;
}

function suggestedAsbisSetupFee(category: string, description: string, model: string) {
  const mapped = mapAsbisCategory(category, description, model);
  if (mapped === 'Accessories') return 150;
  if (mapped === 'Desktop') return 950;
  return 650;
}
