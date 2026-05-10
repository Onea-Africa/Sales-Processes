import { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

interface Props { onTalkToUs: () => void; }

const CATEGORIES = ['All', 'Connectivity', 'Business', 'Digital Marketing'] as const;

const catColor: Record<string, string> = {
  Connectivity: '#416900',
  Business: '#168ECB',
  'Digital Marketing': '#D6139F',
};

export default function BlogPage({ onTalkToUs }: Props) {
  const [active, setActive] = useState<string>('All');

  const visible = active === 'All' ? blogPosts : blogPosts.filter(p => p.category === active);

  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="bg-soft-surface border-b border-border-subtle py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <span className="inline-block px-md py-xs bg-primary/10 text-primary rounded-full font-label-md text-label-md mb-lg">Insights</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-headline-lg text-text-primary leading-tight mb-md">The Onea Africa Blog</h1>
          <p className="text-on-surface-variant text-body-lg max-w-2xl">
            Connectivity, digital strategy and business insights for South African enterprises.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-xl border-b border-border-subtle bg-white sticky top-[80px] z-40">
        <div className="max-w-[1280px] mx-auto px-xl flex flex-wrap items-center gap-md">
          <span className="text-label-md text-on-surface-variant mr-md">Filter:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-lg py-sm rounded-full font-semibold transition-all text-body-md ${
                active === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-soft-surface text-on-surface-variant hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-xxl">
        <div className="max-w-[1280px] mx-auto px-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {visible.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-white rounded-lg border border-border-subtle overflow-hidden card-shadow hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="h-[180px] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${catColor[post.category]}22, ${catColor[post.category]}44)` }}>
                  <span className="material-symbols-outlined text-[64px] opacity-40" style={{ color: catColor[post.category] }}>
                    {post.category === 'Connectivity' ? 'wifi' : post.category === 'Business' ? 'business_center' : 'campaign'}
                  </span>
                </div>
                <div className="p-xl">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="px-md py-xs rounded-full text-white text-[11px] font-bold" style={{ backgroundColor: catColor[post.category] }}>
                      {post.category}
                    </span>
                    <span className="text-on-surface-variant text-body-sm">{post.readTime}</span>
                  </div>
                  <h3 className="font-headline-md text-[20px] text-text-primary mb-sm leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-on-surface-variant text-body-md line-clamp-3 mb-lg">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px]">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-on-surface">{post.author}</p>
                        <p className="text-[11px] text-on-surface-variant">{new Date(post.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xxl bg-primary text-on-primary text-center">
        <div className="max-w-[700px] mx-auto px-xl">
          <h2 className="font-headline-md text-text-primary mb-md text-white">Ready to transform your business?</h2>
          <p className="text-on-primary/80 text-body-lg mb-xl">Let Onea Africa connect, communicate and converse for you.</p>
          <button onClick={onTalkToUs} className="bg-white text-primary px-xl py-md rounded-full font-bold hover:bg-soft-surface transition-all">
            Start a Conversation
          </button>
        </div>
      </section>

    </div>
  );
}
