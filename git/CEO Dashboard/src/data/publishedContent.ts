import { BlogPost, blogPosts } from './blogPosts';

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
  return newestFirst(
    uniquePosts([
      ...publicPosts,
      ...blogPosts,
    ]),
  );
}

export function getPublishedBlogPosts(): BlogPost[] {
  return mergeBlogPosts();
}

export async function fetchPublicBlogPosts(): Promise<BlogPost[]> {
  const fetchPosts = async (attempt: number) => {
    const response = await fetch(`/api/content-public.php?v=${Date.now()}-${attempt}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) throw new Error(`Blog API returned ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload?.posts) ? payload.posts : [];
  };

  try {
    return await fetchPosts(1);
  } catch {
    await new Promise(resolve => window.setTimeout(resolve, 600));
    try {
      return await fetchPosts(2);
    } catch {
      return [];
    }
  }
}
