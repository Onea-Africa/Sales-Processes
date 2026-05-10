import { Link, useParams } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

export default function CaseStudyPage({ onTalkToUs }: Props) {
  const { id } = useParams();

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[819px] flex items-center pt-xxl pb-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-xl items-center">
          <div className="z-10 order-2 md:order-1">
            <div className="inline-flex items-center gap-sm bg-onea-violet/10 text-onea-violet border border-onea-violet/20 px-md py-xs rounded-full mb-lg font-label-md">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              Digital Marketing
            </div>
            <h1 className="font-headline-lg text-display-lg-mobile md:text-display-lg text-text-primary mb-md leading-none">
              Scaling Digital Performance for FinTech Startups
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-xl">
              How we leveraged hyper-targeted performance marketing and brand storytelling to accelerate growth for emerging financial platforms across Africa.
            </p>
            <div className="flex items-center gap-lg">
              <div className="bg-primary-container/10 p-lg rounded-lg border border-primary-container/20">
                <div className="text-primary font-headline-lg text-headline-lg leading-none">240%</div>
                <div className="text-on-surface-variant font-label-md uppercase tracking-wide">Lead Growth</div>
              </div>
              <div className="bg-onea-yellow/10 p-lg rounded-lg border border-onea-yellow/20">
                <div className="text-secondary font-headline-lg text-headline-lg leading-none">18k+</div>
                <div className="text-on-surface-variant font-label-md uppercase tracking-wide">New Users</div>
              </div>
            </div>
          </div>
          <div className="relative order-1 md:order-2 h-[400px] md:h-[600px] w-full rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZyxTPmUZKAuP9hmdr3lCeiSfR6YQduhJqYeIY1IqvcChYd53R8dgPlvr-ImJo1odfiXVm2AeKeNPDMCmhB0Clh_k5U8tvZ953lZSATdPd7kf8N_acryHLl0fJ-5f2YleN5DvYbcssVnyQxDbM4j34yPtVp0cLT0r_Ei2KrbkO6jV7nIBSbeAPCbahcE4JbF69bNFYaaG3dVBcc0P2u24RsVEBkdBu37KBh6VfD9rXDPXki3962rT3BtjogsfR0KaNPMpYShgRmHY"
              alt="Digital marketing office"
            />
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="bg-soft-surface py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-12 gap-xl">
            <div className="md:col-span-4">
              <h2 className="font-headline-md text-headline-md text-text-primary mb-sm">The Challenge</h2>
              <div className="w-16 h-1 bg-primary rounded-full mb-md"></div>
            </div>
            <div className="md:col-span-8">
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Our client, a disruptive FinTech startup focused on inclusive digital lending, faced a saturated market with high acquisition costs and low brand awareness. They needed a strategic partner to not only drive downloads but to build a community of loyal users who understood the value of their financial tools. The goal was to establish Onea Africa as the primary growth engine for their user base within a six-month window.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xl">
            <h2 className="font-headline-md text-headline-md text-text-primary">Strategies Employed</h2>
            <p className="font-body-md text-on-surface-variant">A multi-layered tactical approach to digital dominance.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-lg">

            {/* SEO */}
            <div className="bg-white p-xl rounded-lg border border-border-subtle hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-onea-green/10 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[32px]">search_insights</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-md">SEO Strategy</h3>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Implemented a deep semantic SEO framework targeting long-tail financial education keywords. We focused on local search dominance and technical optimization to ensure high-velocity indexing.
              </p>
              <ul className="space-y-sm">
                {['Technical Site Audit', 'High-Intent Keyword Targeting'].map(item => (
                  <li key={item} className="flex items-center gap-sm text-on-surface-variant font-label-md">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Content */}
            <div className="bg-white p-xl rounded-lg border border-border-subtle hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-onea-violet/10 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-onea-violet text-[32px]">edit_note</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-md">Content Marketing</h3>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Developed an 'Educate First' content hub that demystified digital lending. Through whitepapers, blogs, and interactive calculators, we positioned the brand as a thought leader in the space.
              </p>
              <ul className="space-y-sm">
                {['Educational Video Series', 'Interactive Loan Tools'].map(item => (
                  <li key={item} className="flex items-center gap-sm text-on-surface-variant font-label-md">
                    <span className="material-symbols-outlined text-onea-violet text-[18px]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid & Organic */}
            <div className="bg-white p-xl rounded-lg border border-border-subtle hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-300 group">
              <div className="w-16 h-16 rounded-full bg-onea-yellow/10 flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-[32px]">campaign</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-md">Paid &amp; Organic</h3>
              <p className="font-body-md text-on-surface-variant mb-lg">
                Hyper-targeted Meta and Google ads paired with a vibrant community management strategy. We utilized A/B testing on creative assets to reduce CPA by 45% within 3 months.
              </p>
              <ul className="space-y-sm">
                {['Dynamic Creative Optimization', 'Influencer Partnerships'].map(item => (
                  <li key={item} className="flex items-center gap-sm text-on-surface-variant font-label-md">
                    <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-inverse-surface text-on-primary py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-2 gap-xl items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-md">Quantifiable Success</h2>
              <p className="text-body-lg opacity-80 mb-xl">
                Our performance-first approach didn't just drive clicks; it drove high-value customers who remained active in the ecosystem.
              </p>
              <div className="space-y-lg">
                <div className="flex items-end gap-md">
                  <span className="font-headline-lg text-[64px] leading-none text-onea-green">14.2%</span>
                  <span className="font-body-md mb-xs opacity-70 pb-2">Conversion Rate Increase</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-onea-green h-full w-[85%] rounded-full"></div>
                </div>
                <div className="flex items-end gap-md">
                  <span className="font-headline-lg text-[64px] leading-none text-onea-yellow">45%</span>
                  <span className="font-body-md mb-xs opacity-70 pb-2">Reduction in CPA</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-onea-yellow h-full w-[60%] rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              {[
                { icon: 'groups', color: 'text-onea-green', n: '2.4M', l: 'Total Reach' },
                { icon: 'point_of_sale', color: 'text-onea-violet', n: '$0.85', l: 'Cost Per Lead' },
                { icon: 'trending_up', color: 'text-onea-yellow', n: '320%', l: 'ROI' },
                { icon: 'verified', color: 'text-primary-fixed-dim', n: '98%', l: 'Accuracy' },
              ].map(m => (
                <div key={m.l} className="bg-white/5 border border-white/10 p-lg rounded-lg text-center flex flex-col justify-center min-h-[200px]">
                  <span className={`material-symbols-outlined text-[48px] mb-md ${m.color}`}>{m.icon}</span>
                  <div className="text-headline-md font-bold">{m.n}</div>
                  <div className="text-label-md opacity-60">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Project Nav */}
      <section className="py-xxl px-gutter">
        <div className="max-w-[1280px] mx-auto border-t border-border-subtle pt-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-lg">
            <Link to="/case-studies" className="group cursor-pointer">
              <p className="text-label-md text-on-surface-variant mb-xs uppercase tracking-widest font-bold">Previous Project</p>
              <h4 className="text-headline-md font-bold group-hover:text-primary transition-colors flex items-center gap-sm">
                <span className="material-symbols-outlined">arrow_back</span>
                Retail Analytics Transformation
              </h4>
            </Link>
            <Link to="/case-studies" className="text-right group cursor-pointer">
              <p className="text-label-md text-on-surface-variant mb-xs uppercase tracking-widest font-bold">Next Project</p>
              <h4 className="text-headline-md font-bold group-hover:text-primary transition-colors flex items-center gap-sm justify-end">
                Enterprise Voice Solutions
                <span className="material-symbols-outlined">arrow_forward</span>
              </h4>
            </Link>
          </div>
          <div className="mt-xxl flex justify-center">
            <Link
              to="/case-studies"
              className="bg-primary text-on-primary px-xl py-lg rounded-full font-bold flex items-center gap-md hover:shadow-xl transition-all active:scale-95"
            >
              View All Case Studies
              <span className="material-symbols-outlined">grid_view</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
