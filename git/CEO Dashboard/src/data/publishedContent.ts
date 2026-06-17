import { BlogPost, blogPosts } from './blogPosts';
import { ContentCenterItem } from './contentCenter';

const CONTENT_STORAGE_KEY = 'onea_content_center_items';

function mapCategory(category: string): BlogPost['category'] {
  const normalized = category.toLowerCase();
  if (normalized.includes('marketing') || normalized.includes('website')) return 'Digital Marketing';
  if (normalized.includes('managed') || normalized.includes('microsoft') || normalized.includes('business')) return 'Business';
  return 'Connectivity';
}

function estimateReadTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function readApprovedContentCenterBlogs(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem(CONTENT_STORAGE_KEY);
  if (!stored) return [];

  try {
    const items = JSON.parse(stored) as ContentCenterItem[];
    if (!Array.isArray(items)) return [];

    return items
      .filter(item => item.type === 'Blog' && (item.status === 'approved' || item.status === 'published'))
      .map(item => ({
        id: item.slug || item.id,
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        category: mapCategory(item.category),
        date: item.updatedAt || new Date().toISOString().slice(0, 10),
        readTime: estimateReadTime(item.body),
        author: item.owner || 'Onea Africa',
        authorRole: 'Onea Africa Content Team',
      }));
  } catch {
    return [];
  }
}

function postKey(post: Pick<BlogPost, 'id' | 'title'>) {
  return (post.id || post.title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleKey(post: Pick<BlogPost, 'title'>) {
  return post.title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function uniquePosts(posts: BlogPost[]) {
  const seen = new Set<string>();
  const seenTitles = new Set<string>();
  return posts.filter(post => {
    const key = postKey(post);
    const title = titleKey(post);
    if (seen.has(key) || seenTitles.has(title)) return false;
    seen.add(key);
    seenTitles.add(title);
    return true;
  });
}

function newestFirst(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const aTime = Date.parse(a.date);
    const bTime = Date.parse(b.date);
    const safeATime = Number.isNaN(aTime) ? 0 : aTime;
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
    return safeBTime - safeATime;
  });
}

export function mergeBlogPosts(extraPosts: BlogPost[] = []): BlogPost[] {
  const publicPosts = uniquePosts(extraPosts);
  const publicKeys = new Set(publicPosts.map(postKey));
  const publicTitles = new Set(publicPosts.map(titleKey));
  const approvedDrafts = readApprovedContentCenterBlogs().filter(post => (
    !publicKeys.has(postKey(post)) && !publicTitles.has(titleKey(post))
  ));
  return newestFirst(
    uniquePosts([
      ...publicPosts,
      ...approvedDrafts,
      ...blogPosts,
    ]),
  );
}

export function getPublishedBlogPosts(): BlogPost[] {
  return mergeBlogPosts();
}

export async function fetchPublicBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/content-public.php', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return [];
  const payload = await response.json().catch(() => null);
  return Array.isArray(payload?.posts) ? payload.posts : [];
}
