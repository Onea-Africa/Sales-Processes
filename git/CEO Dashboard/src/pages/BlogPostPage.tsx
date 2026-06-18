import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPublicBlogPosts, mergeBlogPosts } from '../data/publishedContent';
import { BlogPost } from '../data/blogPosts';

interface Props { onTalkToUs: () => void; }

const catColor: Record<string, string> = {
  Connectivity: '#8CC444',
  Business: '#705d00',
  'Digital Marketing': '#D6139F',
};

export default function BlogPostPage({ onTalkToUs }: Props) {
  const { id } = useParams<{ id: string }>();
  const [publicPosts, setPublicPosts] = useState<BlogPost[]>([]);
  const [loadingPublicPosts, setLoadingPublicPosts] = useState(true);
  const blogPosts = mergeBlogPosts(publicPosts);
  const post = blogPosts.find(p => p.id === id);

  useEffect(() => {
    let mounted = true;
    fetchPublicBlogPosts().then(posts => {
      if (mounted) setPublicPosts(posts);
    }).catch(() => {
      if (mounted) setPublicPosts([]);
    }).finally(() => {
      if (mounted) setLoadingPublicPosts(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!post && loadingPublicPosts) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-xl">
        <p className="text-on-surface-variant text-body-lg">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-xl">
        <Helmet>
          <title>Article Not Found | Onea Africa</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href="https://onea.africa/blog" />
        </Helmet>
        <div>
          <p className="text-on-surface-variant text-body-lg mb-lg">Post not found.</p>
          <Link to="/blog" className="text-primary font-bold hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const related = blogPosts.filter(p => p.id !== post.id).slice(0, 2);
  const canonicalUrl = `https://onea.africa/blog/${post.id}/`;

  const renderBody = (text: string) =>
    text.split('\n\n').map((para, i) => {
      if (para.startsWith('**') && para.endsWith('**')) {
        return <h3 key={i} className="font-headline-md text-[22px] text-text-primary mt-xl mb-md">{para.replace(/\*\*/g, '')}</h3>;
      }
      if (para.match(/^\*\*[^*]+\*\*/)) {
        return <p key={i} className="text-body-lg text-on-surface leading-relaxed mb-lg" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />;
      }
      if (para.startsWith('- ')) {
        return (
          <ul key={i} className="list-disc pl-xl space-y-sm mb-lg">
            {para.split('\n').filter(l => l.startsWith('- ')).map((l, j) => (
              <li key={j} className="text-body-lg text-on-surface" dangerouslySetInnerHTML={{ __html: l.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </ul>
        );
      }
      return <p key={i} className="text-body-lg text-on-surface leading-relaxed mb-lg" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />;
    });

  return (
    <div className="bg-background text-on-surface font-body-md">
      <Helmet>
        <title>{post.title} | Onea Africa</title>
        <meta name="description" content={post.excerpt} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content="https://onea.africa/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content="https://onea.africa/og-image.png" />
      </Helmet>

      {/* Hero */}
      <section className="py-xxl border-b border-border-subtle" style={{ background: `linear-gradient(135deg, ${catColor[post.category]}10, ${catColor[post.category]}20)` }}>
        <div className="max-w-[800px] mx-auto px-xl">
          <Link to="/blog" className="inline-flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors mb-xl font-semibold">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Blog
          </Link>
          <div className="flex flex-wrap items-center gap-sm mb-lg">
            <span className="px-md py-xs rounded-full text-white text-[12px] font-bold" style={{ backgroundColor: catColor[post.category] }}>{post.category}</span>
            <span className="text-on-surface-variant text-body-sm">{post.readTime}</span>
            <span className="text-on-surface-variant text-body-sm">·</span>
            <span className="text-on-surface-variant text-body-sm">{new Date(post.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-xl">{post.title}</h1>
          <p className="text-on-surface-variant text-body-lg mb-xl">{post.excerpt}</p>
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[16px]">
              {post.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-on-surface">{post.author}</p>
              <p className="text-on-surface-variant text-body-sm">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-xxl">
        <div className="max-w-[800px] mx-auto px-xl">
          {renderBody(post.body)}

          {/* Share */}
          <div className="mt-xxl pt-xl border-t border-border-subtle">
            <p className="font-semibold text-on-surface mb-md">Share this article:</p>
            <div className="flex gap-sm">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(canonicalUrl)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant hover:bg-on-surface hover:text-white transition-all border border-border-subtle" aria-label="Share on X">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.857L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant hover:bg-[#0A66C2] hover:text-white transition-all border border-border-subtle" aria-label="Share on LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${canonicalUrl}`)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-soft-surface flex items-center justify-center text-on-surface-variant hover:bg-[#25D366] hover:text-white transition-all border border-border-subtle" aria-label="Share on WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-xxl bg-soft-surface border-t border-border-subtle">
          <div className="max-w-[800px] mx-auto px-xl">
            <h2 className="font-headline-md text-text-primary mb-xl">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
              {related.map(rp => (
                <Link key={rp.id} to={`/blog/${rp.id}`} className="bg-white rounded-lg border border-border-subtle p-xl hover:border-primary/30 transition-all group">
                  <span className="px-md py-xs rounded-full text-white text-[11px] font-bold mb-md inline-block" style={{ backgroundColor: catColor[rp.category] }}>{rp.category}</span>
                  <h3 className="font-headline-md text-[18px] text-text-primary mb-sm group-hover:text-primary transition-colors leading-snug">{rp.title}</h3>
                  <p className="text-on-surface-variant text-body-sm">{rp.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-xxl bg-primary text-on-primary text-center">
        <div className="max-w-[600px] mx-auto px-xl">
          <h2 className="font-headline-md text-white mb-md">Ready to grow your business?</h2>
          <p className="text-on-primary/80 text-body-lg mb-xl">Talk to our team about connectivity, digital marketing and PR for your business.</p>
          <button onClick={onTalkToUs} className="bg-white text-primary px-xl py-md rounded-full font-bold hover:bg-soft-surface transition-all">
            Start a Conversation
          </button>
        </div>
      </section>

    </div>
  );
}
