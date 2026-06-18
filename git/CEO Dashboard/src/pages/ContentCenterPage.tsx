import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  CONTENT_CATEGORY_OPTIONS,
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_OPTIONS,
  ContentCenterItem,
  ContentStatus,
  ContentType,
  contentCenterSeed,
} from '../data/contentCenter';

interface UserSession {
  displayName: string;
  role: string;
}

const SESSION_STORAGE_KEY = 'launch_platform_session';
const CONTENT_STORAGE_KEY = 'onea_content_center_items';

const statusClasses: Record<ContentStatus, string> = {
  draft: 'bg-[#fbfcf6] text-[#5f6656] border-[#d9dbcd]',
  review: 'bg-[#F4D350]/25 text-[#6A5500] border-[#f6eab4]',
  approved: 'bg-[#8CC444]/15 text-[#416900] border-[#e5f3d5]',
  published: 'bg-[#D6139F]/10 text-[#8b0f68] border-[#f1d1e9]',
  archived: 'bg-[#f1f1ee] text-[#6f7468] border-[#d9dbcd]',
};

const emptyItem = (owner = 'PR / Comms'): ContentCenterItem => ({
  id: '',
  type: 'Blog',
  title: '',
  slug: '',
  category: 'Connectivity',
  targetAudience: '',
  status: 'draft',
  owner,
  dueDate: '',
  excerpt: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
  keywords: '',
  cta: 'Build an Estimate',
  internalNotes: '',
  updatedAt: new Date().toISOString().slice(0, 10),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

function readToken() {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!stored) return '';
  try {
    return JSON.parse(stored)?.token || '';
  } catch {
    return '';
  }
}

function normalizeStoredItems(items: ContentCenterItem[]) {
  return items;
}

function mergeWithSeedItems(items: ContentCenterItem[]) {
  const seen = new Set(items.map(item => item.id));
  const missingSeeds = contentCenterSeed.filter(item => !seen.has(item.id));
  return [...items, ...missingSeeds];
}

function formatExport(item: ContentCenterItem) {
  if (item.type === 'Job Advert') {
    return [
      `Job Advert: ${item.title}`,
      `Status: ${CONTENT_STATUS_LABELS[item.status]}`,
      `Division: ${item.category}`,
      `Location: ${item.targetAudience}`,
      `Employment type: ${item.excerpt}`,
      `CTA: ${item.cta || 'Apply Now'}`,
      '',
      item.body,
      '',
      `SEO title: ${item.seoTitle}`,
      `SEO description: ${item.seoDescription}`,
      `Keywords: ${item.keywords}`,
      '',
      'Public note: Apply Now appears only after this advert is approved and published.',
    ].join('\n');
  }

  if (item.type === 'Blog') {
    return `{
  id: '${item.slug || item.id}',
  title: ${JSON.stringify(item.title)},
  excerpt: ${JSON.stringify(item.excerpt)},
  body: ${JSON.stringify(item.body)},
  category: ${JSON.stringify(item.category)},
  date: '${new Date().toISOString().slice(0, 10)}',
  readTime: '5 min read',
  author: 'Onea Africa',
  authorRole: 'Technology and Digital Growth Team',
}`;
  }

  return [
    `${item.type}: ${item.title}`,
    `Status: ${CONTENT_STATUS_LABELS[item.status]}`,
    `Audience: ${item.targetAudience}`,
    `Category: ${item.category}`,
    `CTA: ${item.cta}`,
    '',
    item.body,
    '',
    `SEO title: ${item.seoTitle}`,
    `SEO description: ${item.seoDescription}`,
    `Keywords: ${item.keywords}`,
  ].join('\n');
}

export default function ContentCenterPage() {
  const [session, setSession] = useState<UserSession | null>(() => readSession());
  const [items, setItems] = useState<ContentCenterItem[]>([]);
  const [activeType, setActiveType] = useState<ContentType | 'All'>('All');
  const [activeStatus, setActiveStatus] = useState<ContentStatus | 'All'>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<ContentCenterItem>(emptyItem());
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'info' | 'success' | 'error'>('info');
  const [busyAction, setBusyAction] = useState('');
  const [lastCompletedAction, setLastCompletedAction] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  const showNotice = (message: string, tone: 'info' | 'success' | 'error' = 'info') => {
    setNotice(message);
    setNoticeTone(tone);
  };

  useEffect(() => {
    setSession(readSession());
    const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
    let fallbackItems = contentCenterSeed;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ContentCenterItem[];
        if (Array.isArray(parsed)) {
          const normalized = mergeWithSeedItems(normalizeStoredItems(parsed));
          fallbackItems = normalized;
          setItems(normalized);
          setSelectedId(normalized[0]?.id || '');
          setDraft(normalized[0] || emptyItem());
        }
      } catch {
        localStorage.removeItem(CONTENT_STORAGE_KEY);
      }
    }
    if (!stored) {
      setItems(contentCenterSeed);
      setSelectedId(contentCenterSeed[0]?.id || '');
      setDraft(contentCenterSeed[0] || emptyItem());
    }

    const token = readToken();
    if (!token) return;
    setLoadingItems(true);
    fetch('/api/content-items.php', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then(response => (response.ok ? response.json() : null))
      .then(payload => {
        if (!Array.isArray(payload?.items) || payload.items.length === 0) return;
        const normalized = mergeWithSeedItems(normalizeStoredItems(payload.items));
        setItems(normalized);
        setSelectedId(normalized[0]?.id || fallbackItems[0]?.id || '');
        setDraft(normalized[0] || fallbackItems[0] || emptyItem());
      })
      .catch(() => {
        showNotice('Using local Content Center drafts. Server content store could not be reached.', 'error');
      })
      .finally(() => setLoadingItems(false));
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const allowedRoles = ['admin', 'uploader', 'agent', 'pr', 'comms'];
  const role = session?.role || '';
  const canAccess = Boolean(session && allowedRoles.includes(role));
  const canEdit = ['admin', 'uploader', 'pr', 'comms'].includes(role);
  const canApprove = ['admin', 'uploader'].includes(role);
  const canPublish = ['admin', 'uploader', 'pr', 'comms'].includes(role);

  const stats = useMemo(() => ({
    draft: items.filter(item => item.status === 'draft').length,
    review: items.filter(item => item.status === 'review').length,
    approved: items.filter(item => item.status === 'approved').length,
    published: items.filter(item => item.status === 'published').length,
    total: items.length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter(item => {
      const typeOk = activeType === 'All' || item.type === activeType;
      const statusOk = activeStatus === 'All' || item.status === activeStatus;
      const searchOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.targetAudience.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q);
      return typeOk && statusOk && searchOk;
    });
  }, [activeStatus, activeType, items, query]);

  if (!session) {
    return <Navigate to="/launch-platform?redirect=/launch-platform/content" replace />;
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-[#f8fbec] px-6 py-12 text-[#1a1c18]">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#d9dbcd] bg-white p-8 shadow-sm">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Launch Platform</p>
          <h1 className="text-3xl font-bold">Content Center access required</h1>
          <p className="mt-3 text-[#424938]">Your current role can sign in, but it is not enabled for content planning.</p>
          <Link to="/launch-platform" className="mt-6 inline-flex rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000]">
            Back to Launch Platform
          </Link>
        </div>
      </div>
    );
  }

  function selectItem(item: ContentCenterItem) {
    setSelectedId(item.id);
    setDraft(item);
    setNotice('');
    setLastCompletedAction('');
  }

  function startNew(type: ContentType = 'Blog') {
    const next = emptyItem(session?.displayName || 'PR / Comms');
    next.type = type;
    if (type === 'Job Advert') {
      next.category = 'Connect';
      next.excerpt = 'Full-time';
      next.cta = 'Apply Now';
      next.internalNotes = 'Add the role requirements/specs. Public Apply Now opens only after admin/uploader approval and publishing.';
    }
    setSelectedId('');
    setDraft(next);
    setLastCompletedAction('clear');
    showNotice('New draft ready. The previous content was not deleted.', 'success');
  }

  function updateDraft(field: keyof ContentCenterItem, value: string) {
    setDraft(current => {
      const next = { ...current, [field]: value };
      if (field === 'title' && !current.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function saveContentItem(item: ContentCenterItem) {
    const token = readToken();
    if (!token) return item;
    const response = await fetch('/api/content-items.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ item }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error || 'Could not save content to the shared server store.');
    }
    return payload.item as ContentCenterItem;
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) {
      showNotice('This role can review content but cannot edit drafts.', 'error');
      return;
    }
    const title = draft.title.trim();
    if (!title) {
      showNotice('Add a title before saving.', 'error');
      return;
    }
    setBusyAction('save');
    showNotice('Saving content to the shared Content Center...', 'info');
    const id = draft.id || slugify(title) || `content-${Date.now()}`;
    const saved: ContentCenterItem = {
      ...draft,
      id,
      slug: draft.slug || slugify(title),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    try {
      const serverSaved = await saveContentItem(saved);
      setItems(current => {
        const exists = current.some(item => item.id === serverSaved.id);
        if (exists) return current.map(item => (item.id === serverSaved.id ? serverSaved : item));
        return [serverSaved, ...current];
      });
      setSelectedId(serverSaved.id);
      setDraft(serverSaved);
      setLastCompletedAction('save');
      showNotice('Saved successfully. This content is now shared with the team.', 'success');
    } catch (error) {
      setItems(current => {
        const exists = current.some(item => item.id === id);
        if (exists) return current.map(item => (item.id === id ? saved : item));
        return [saved, ...current];
      });
      setSelectedId(id);
      setDraft(saved);
      showNotice(error instanceof Error ? `${error.message} Saved locally only; it is not shared yet.` : 'Saved locally only; it is not shared yet.', 'error');
    } finally {
      setBusyAction('');
    }
  }

  async function changeStatus(status: ContentStatus) {
    if (!selectedId) {
      showNotice('Save the content before changing its workflow status.', 'error');
      return;
    }
    if (status === 'approved' && !canApprove) {
      showNotice('Only admin or uploader roles can approve content.', 'error');
      return;
    }
    if (status === 'published') {
      showNotice('Use Publish to website so approved content is written to the public feed.', 'info');
      return;
    }
    setBusyAction(status);
    showNotice(`Changing status to ${CONTENT_STATUS_LABELS[status]}...`, 'info');
    const updated = { ...draft, status, updatedAt: new Date().toISOString().slice(0, 10) };
    try {
      const serverSaved = await saveContentItem(updated);
      setDraft(serverSaved);
      setItems(current => current.map(item => (item.id === selectedId ? serverSaved : item)));
      setLastCompletedAction(status);
      showNotice(
        status === 'approved'
          ? 'Approved successfully. Publish to website is now available.'
          : `Status confirmed: ${CONTENT_STATUS_LABELS[serverSaved.status]}.`,
        'success',
      );
    } catch (error) {
      showNotice(error instanceof Error ? `${error.message} Status was not changed on the server.` : 'Status was not changed on the server.', 'error');
    } finally {
      setBusyAction('');
    }
  }

  async function publishToWebsite() {
    if (!selectedId) {
      showNotice('Save the content before publishing.', 'error');
      return;
    }
    if (!canPublish) {
      showNotice('Your role cannot publish content.', 'error');
      return;
    }
    if (draft.type !== 'Blog' && draft.type !== 'Testimonial' && draft.type !== 'Job Advert') {
      showNotice('Only blog, testimonial and job advert content can be published to the website.', 'error');
      return;
    }
    if (draft.status !== 'approved' && draft.status !== 'published') {
      showNotice(`Current status is ${CONTENT_STATUS_LABELS[draft.status]}. Approve it before publishing.`, 'error');
      return;
    }
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.body.trim()) {
      showNotice('Publishing requires a title, excerpt and main content. Complete and save those fields first.', 'error');
      return;
    }
    const token = readToken();
    if (!token) {
      showNotice('Your session token is missing. Sign in again before publishing.', 'error');
      return;
    }

    setBusyAction('publish');
    showNotice('Publishing to the public website feed...', 'info');
    try {
      const endpoint =
        draft.type === 'Testimonial'
          ? '/api/testimonials-publish.php'
          : draft.type === 'Job Advert'
            ? '/api/careers-publish.php'
            : '/api/content-publish.php';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ item: draft }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Could not publish this content.');
      }
      const updated = { ...draft, status: 'published' as ContentStatus, updatedAt: new Date().toISOString().slice(0, 10) };
      setDraft(updated);
      setItems(current => current.map(item => (item.id === selectedId ? updated : item)));
      setLastCompletedAction('publish');
      showNotice(
        draft.type === 'Testimonial'
          ? 'Published to the home page testimonial feed.'
          : draft.type === 'Job Advert'
            ? 'Published to the public careers feed. Visitors can now apply on /careers.'
            : `Published successfully. Public link: https://onea.africa/blog/${draft.slug || draft.id}`,
        'success',
      );
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Could not publish this content.', 'error');
    } finally {
      setBusyAction('');
    }
  }

  async function copyExport() {
    const text = formatExport(draft);
    try {
      await navigator.clipboard.writeText(text);
      setLastCompletedAction('copy');
      showNotice(draft.type === 'Blog' ? 'Public blog export copied.' : 'Content brief copied.', 'success');
    } catch {
      showNotice('Could not copy. Select the export text manually.', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fbec] px-6 py-10 text-[#1a1c18] lg:px-12">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#8CC444]">Launch Platform</p>
            <h1 className="mt-2 text-4xl font-bold leading-tight">Content Center</h1>
            <p className="mt-3 max-w-3xl text-[#424938]">
              Plan Converse content, blogs, case studies, Google Business posts, LinkedIn captions, campaign briefs and job adverts before anything goes public.
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

        {notice && (
          <div
            role="status"
            className={`rounded-3xl border p-4 text-sm font-semibold ${
              noticeTone === 'success'
                ? 'border-[#8CC444] bg-[#f3fae9] text-[#315600]'
                : noticeTone === 'error'
                  ? 'border-[#E57373] bg-[#fff1f0] text-[#9b1c1c]'
                  : 'border-[#F4D350] bg-[#fffbea] text-[#6A5500]'
            }`}
          >
            {noticeTone === 'success' ? 'Confirmed: ' : noticeTone === 'error' ? 'Action needed: ' : ''}
            {notice}
          </div>
        )}
        {loadingItems && <div className="rounded-3xl border border-[#d9dbcd] bg-white p-4 text-sm font-semibold text-[#424938]">Loading shared Content Center items...</div>}

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#424938]">Total items</p>
            <p className="mt-1 text-3xl font-bold text-[#102000]">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#424938]">Drafts</p>
            <p className="mt-1 text-3xl font-bold text-[#102000]">{stats.draft}</p>
          </div>
          <div className="rounded-3xl border border-[#f6eab4] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#424938]">In review</p>
            <p className="mt-1 text-3xl font-bold text-[#6A5500]">{stats.review}</p>
          </div>
          <div className="rounded-3xl border border-[#e5f3d5] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#424938]">Approved</p>
            <p className="mt-1 text-3xl font-bold text-[#416900]">{stats.approved}</p>
          </div>
          <div className="rounded-3xl border border-[#f1d1e9] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#424938]">Published</p>
            <p className="mt-1 text-3xl font-bold text-[#8b0f68]">{stats.published}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPE_OPTIONS.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => startNew(type)}
                    disabled={!canEdit}
                    className="rounded-full bg-[#8CC444] px-4 py-2 text-xs font-bold text-[#102000] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    New {type}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                <input
                  value={query}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                  placeholder="Search content"
                  className="w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={activeType}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setActiveType(event.target.value as ContentType | 'All')}
                    className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                  >
                    <option value="All">All types</option>
                    {CONTENT_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <select
                    value={activeStatus}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setActiveStatus(event.target.value as ContentStatus | 'All')}
                    className="rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 text-sm outline-none focus:border-[#8CC444]"
                  >
                    <option value="All">All status</option>
                    {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {filtered.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`block w-full rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:border-[#8CC444] ${selectedId === item.id ? 'border-[#8CC444]' : 'border-[#d9dbcd]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8CC444]">{item.type}</p>
                      <h2 className="mt-2 font-semibold text-[#102000]">{item.title}</h2>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[item.status]}`}>
                      {CONTENT_STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-[#424938]">{item.excerpt}</p>
                  <p className="mt-3 text-xs text-[#6f7468]">Updated {item.updatedAt} - {item.category}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-3xl border border-[#d9dbcd] bg-white p-5 text-sm text-[#424938]">No content matches this filter.</div>
              )}
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-3xl border border-[#D6139F]/20 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#102000]">Public safety guardrails</h2>
              <div className="mt-4 grid gap-3 text-sm text-[#424938] md:grid-cols-3">
                <p className="rounded-2xl bg-[#fbfcf6] p-4">Keep national positioning first. Pretoria and Gauteng are local trust signals, not the full market.</p>
                <p className="rounded-2xl bg-[#fbfcf6] p-4">Do not publish supplier account numbers, internal costs, margins, stock feeds or agent-only pricing logic.</p>
                <p className="rounded-2xl bg-[#fbfcf6] p-4">Workflow: PR/Comms drafts, admin/uploader approves, then PR/Comms or admin can publish approved blogs, testimonials or job adverts to the public feed.</p>
              </div>
            </div>

            <form onSubmit={saveDraft} className="rounded-3xl border border-[#d9dbcd] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8CC444]">Editor</p>
                  <h2 className="mt-1 text-2xl font-bold">{draft.title || 'Untitled draft'}</h2>
                  <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[draft.status]}`}>
                    Current status: {CONTENT_STATUS_LABELS[draft.status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => changeStatus('draft')}
                    disabled={!canEdit || Boolean(busyAction)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-50 ${draft.status === 'draft' ? 'border-[#5f6656] bg-[#5f6656] text-white' : 'border-[#d9dbcd] text-[#102000]'}`}
                  >
                    {busyAction === 'draft' ? 'Changing...' : draft.status === 'draft' ? 'Draft confirmed' : 'Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStatus('review')}
                    disabled={!canEdit || Boolean(busyAction)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-50 ${draft.status === 'review' ? 'border-[#c29d00] bg-[#F4D350] text-[#102000]' : 'border-[#F4D350] bg-[#fffbea] text-[#6A5500]'}`}
                  >
                    {busyAction === 'review' ? 'Sending...' : draft.status === 'review' ? 'In review' : 'Send to review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeStatus('approved')}
                    disabled={!canApprove || Boolean(busyAction)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-50 ${draft.status === 'approved' ? 'border-[#5d9222] bg-[#8CC444] text-[#102000]' : 'border-[#8CC444] bg-[#f3fae9] text-[#416900]'}`}
                  >
                    {busyAction === 'approved' ? 'Approving...' : draft.status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={publishToWebsite}
                    disabled={Boolean(busyAction)}
                    className={`rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-50 ${draft.status === 'published' ? 'border-[#D6139F] bg-[#D6139F] text-white' : 'border-[#102000] bg-[#102000] text-white'}`}
                  >
                    {busyAction === 'publish' ? 'Publishing...' : draft.status === 'published' ? 'Published' : 'Publish to website'}
                  </button>
                  <button
                    type="button"
                    onClick={copyExport}
                    disabled={!draft.title || Boolean(busyAction)}
                    className={`rounded-full bg-[#D6139F] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 ${lastCompletedAction === 'copy' ? 'ring-2 ring-[#D6139F] ring-offset-2' : ''}`}
                  >
                    {lastCompletedAction === 'copy' ? 'Export copied' : 'Copy export'}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">Type</span>
                  <select value={draft.type} onChange={(event) => updateDraft('type', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70">
                    {CONTENT_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">Status</span>
                  <select
                    value={draft.status}
                    onChange={(event) => {
                      if (event.target.value === 'published') {
                        showNotice('Use Publish to website so approved content is written to the public feed.', 'info');
                        return;
                      }
                      updateDraft('status', event.target.value);
                    }}
                    disabled={!canApprove}
                    className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70"
                  >
                    {Object.entries(CONTENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value} disabled={value === 'published'}>{label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">{draft.type === 'Testimonial' ? 'Client / company name' : draft.type === 'Job Advert' ? 'Position title' : 'Title'}</span>
                  <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">Slug</span>
                  <input value={draft.slug} onChange={(event) => updateDraft('slug', slugify(event.target.value))} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">{draft.type === 'Job Advert' ? 'Division' : 'Category'}</span>
                  <select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70">
                    {CONTENT_CATEGORY_OPTIONS.map(category => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">Owner</span>
                  <input value={draft.owner} onChange={(event) => updateDraft('owner', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">Due date</span>
                  <input type="date" value={draft.dueDate} onChange={(event) => updateDraft('dueDate', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">CTA</span>
                  <input value={draft.cta} onChange={(event) => updateDraft('cta', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
              </div>

              <div className="mt-4 grid gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">{draft.type === 'Testimonial' ? 'Location / context' : draft.type === 'Job Advert' ? 'Location' : 'Target audience'}</span>
                  <input value={draft.targetAudience} onChange={(event) => updateDraft('targetAudience', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-3xl border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">{draft.type === 'Testimonial' ? 'Person role / title' : draft.type === 'Job Advert' ? 'Employment type' : 'Excerpt / short caption'}</span>
                  <textarea value={draft.excerpt} onChange={(event) => updateDraft('excerpt', event.target.value)} disabled={!canEdit} rows={3} className="mt-2 w-full rounded-3xl border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">{draft.type === 'Testimonial' ? 'Client quote' : draft.type === 'Job Advert' ? 'Role description, requirements and specs' : 'Main content'}</span>
                  <textarea value={draft.body} onChange={(event) => updateDraft('body', event.target.value)} disabled={!canEdit} rows={10} className="mt-2 w-full rounded-3xl border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">SEO title</span>
                  <input value={draft.seoTitle} onChange={(event) => updateDraft('seoTitle', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#424938]">Keywords</span>
                  <input value={draft.keywords} onChange={(event) => updateDraft('keywords', event.target.value)} disabled={!canEdit} className="mt-2 w-full rounded-full border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-[#424938]">SEO description</span>
                  <textarea value={draft.seoDescription} onChange={(event) => updateDraft('seoDescription', event.target.value)} disabled={!canEdit} rows={3} className="mt-2 w-full rounded-3xl border border-[#d9dbcd] bg-[#f7faf2] px-4 py-3 outline-none focus:border-[#8CC444] disabled:opacity-70" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-[#424938]">{draft.type === 'Testimonial' ? 'Internal notes / permission confirmation' : 'Internal notes'}</span>
                  <textarea value={draft.internalNotes} onChange={(event) => updateDraft('internalNotes', event.target.value)} disabled={!canEdit} rows={3} className="mt-2 w-full rounded-3xl border border-[#d9dbcd] bg-[#fffdf2] px-4 py-3 outline-none focus:border-[#F4D350] disabled:opacity-70" />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" disabled={!canEdit || Boolean(busyAction)} className={`rounded-full bg-[#8CC444] px-6 py-3 text-sm font-bold text-[#102000] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${lastCompletedAction === 'save' ? 'ring-2 ring-[#5d9222] ring-offset-2' : ''}`}>
                  {busyAction === 'save' ? 'Saving...' : lastCompletedAction === 'save' ? 'Saved successfully' : 'Save content'}
                </button>
                <button type="button" onClick={() => startNew()} disabled={!canEdit || Boolean(busyAction)} className={`rounded-full border px-6 py-3 text-sm font-bold text-[#102000] hover:border-[#8CC444] disabled:opacity-50 ${lastCompletedAction === 'clear' ? 'border-[#8CC444] bg-[#f3fae9]' : 'border-[#d9dbcd]'}`}>
                  {lastCompletedAction === 'clear' ? 'New draft ready' : 'Clear for new draft'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
