import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

const cards = [
  {
    id: 'national-fibre-rollout',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXemd6mc_L54nayImwbMiHxqRbQ5PkJE850s7qOv92LtQQI4qtuxFhcjgV1m4zgBIwRyy6LhyIFszTHQ5F-gpFx40sb9-qWfdyw5t606wD7wDksd6HpBgkDu4x7vLXIuBe9DKtmgwTVMt6KsyWl0FJdy3yzwzCs03TnQy0hnyWU99p3KmZIz9oKmld5_h63lQANaxutmaY1A7QOASOm7ggLEa6FMhMPOi9KCpi50aoW9gKQM_tpKXL_0baWsEEOwLJ5wkd4spoljM',
    title: 'National Fibre Rollout for Retail Giant',
    desc: 'Optimizing cross-border logistics and real-time inventory management through a dedicated high-speed fibre network across 200+ locations.',
    linkColor: 'text-primary',
  },
  {
    id: 'strategic-pr-tech-hubs',
    cat: 'Communicate',
    badge: 'bg-onea-violet/10 border border-onea-violet/20 text-onea-violet',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuHFhhJ0Xyzw_yzg9xuVYtWHGs3mYV_YdOXbYf3MwyRIwYTlkiMOjLvkomoWZUnQtlrvA46GgBmThLTGKAEthN4F2grpy7edGG6iiKMmhul-SYkUt9GSZXEjN1wcFko7Afzo__MitlxP5Qft0UvYb-kHPHVSZswRudY1IM589c6x18PF23Dfftqsi_UeHLVUw2wW-p7kVURZ07KM_mOhH52SnKiv_R5rKqney5MJZXSVbsEA9_QOHiNgRwAi0ICpjX-IG2tjl2dNk',
    title: 'Strategic Public Relations for Tech Hubs',
    desc: "Elevating the brand narrative for Africa's leading technology incubators through targeted media outreach and content strategy.",
    linkColor: 'text-primary',
  },
  {
    id: 'openserve-integration',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUa2ItHniObxYMwH3nTNfzM1lnKQA-RSYM4_brqXEkwu-U_eAmYjvT7bze6iNj5occfIBXm-Ij8di6_XSQnkyoa9lvBEch9uqX5ZWu2oIdLd2N8h6_WVEGliqWrDpPQW53DBVjhDZHo2KwrONRottkNopEABVs46vf5k8iQfT7u_b-LJK02kxhDog_CekLgt5tfUTFk9iiekt1q_K4mjKCedisg4XSFU6IWhIUTBJLtNMpqPVbLE6MUa5ANgw-1iHoBCtj4Og5QbE',
    title: 'Openserve Infrastructure Integration',
    desc: 'Seamlessly integrating national backbone infrastructure with last-mile delivery systems for enhanced service uptime.',
    linkColor: 'text-primary',
  },
  {
    id: 'smart-wifi-deployment',
    cat: 'Converse',
    badge: 'bg-onea-yellow/10 border border-onea-yellow/20 text-on-secondary-container',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqLYIxQTey6nfCuiD6UcZ8577ONFW8q_zv6D6myxHBravi3GmzzljjdeInz2FhxvAM1XRZSO29_5_3Uf-aR64n99ZXpbNaPPsg3hH20vrQAdTjRaBwrdxm6vJmQZ0OtAfhmBdrUNBJyE8EKt-BhvKqsDqBo3N2oMapOesiY1yLqrYm507iGALaDk39erS_-1k2ANoSBJ312xGCaLGMcwEkf7dA_S5HtHMBXyC6RZFb0CFp2ObSfqsbLYvqqEpEeShDYm-HC2x8FV0',
    title: 'Regional Smart WiFi Deployment',
    desc: 'Implementing high-capacity, mesh-enabled smart WiFi solutions for multi-purpose commercial and leisure developments.',
    linkColor: 'text-primary',
  },
  {
    id: 'fintech-digital-performance',
    cat: 'Communicate',
    badge: 'bg-onea-violet/10 border border-onea-violet/20 text-onea-violet',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8SkaQQAqZhJ6yHarotvMDfwl0kwHr6qnTGk3Ks4FkjmMBXsWBMKT9lbEUK4EO2BrE4O3UcbZ5Iu73FJalUYXZjiufYZ5xaH22HCbWsqJk81gUieGtFS_MsrXaHBGgfZ4AyHSTJ3ZrFnbRy-jAn6kI7ylIfZd3KXExQP99dLHBWEm-7g-yEMLFNraQRevkJibBN7v7RLjIyUQ7WahVlu4MENnrj4QfrI_vWGnuRLnYJmwYsGd4sj9-FJc0ZFfqesNWi3elmj0REmU',
    title: 'Digital Performance for FinTech Startups',
    desc: 'Scaling customer acquisition and brand visibility for emerging financial technology firms in the SADC region.',
    linkColor: 'text-primary',
  },
  {
    id: 'broadband-expansion',
    cat: 'Connect',
    badge: 'bg-onea-green text-primary',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE6VbpzhcscDuF9QNASU1uxSMONHiTeXjLYaxhqoS2nzuikZFJsl-j7x7Pz_l_bXRIYlvLP16ubHnngn50ekPs2iATwBX3VQCz0wCe-CxijQ36HlfvFQjkTTRsN0rxfvcFXUgaNjDxIZTtf55bdwiV1GIIl3WYx2PXTHnovJS_i-k9J7OlJTpvaEPB8SsWKsrEbdkAimhNGbeOYR34wrCNwzsYzxFIa8xUKdJzvmINIWzgwolIbJxcc5AvdShzRfH8tt-Y4cKIZh4',
    title: 'Broadband Expansion Project Phase II',
    desc: 'Extending high-speed internet access to previously underserved rural communities through innovative microwave backhaul technology.',
    linkColor: 'text-primary',
  },
];

const FILTERS = ['All Projects', 'Connectivity', 'Digital Marketing', 'Communications'];
const catMap: Record<string, string> = {
  Connectivity: 'Connect',
  'Digital Marketing': 'Communicate',
  Communications: 'Converse',
};

export default function CaseStudiesPage({ onTalkToUs }: Props) {
  const [active, setActive] = useState('All Projects');

  const visible = active === 'All Projects'
    ? cards
    : cards.filter(c => c.cat === catMap[active]);

  return (
    <div className="bg-background text-on-surface font-body-md">

      {/* Hero */}
      <section className="relative h-[614px] flex items-center overflow-hidden bg-surface-container">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD214ZGwjLpFzRYo7nFm96C7pytCkGC19uThQ08YIZRFXhjySAiUEhgwZz0YeAKZWcfZBCgOK08ZpEFRFvehwadRwE-tbqD17HUM7NfYHhQCi6mt5tDKXXcDHnzMuTO-3I08u9eNIed3wL-HjfNrrF7et2jKtgNtG24iDL2I5vnU3BaCw-FGnrq85wZGZIjinKESOhxFb0zmX9rwCIXzlxbkFg3jMtYIKkbNUqwP3mRrt7J_DVmFpHo4ZRR2OywZjcQtzE0R9yVusQ"
            alt="Skyscraper architecture"
          />
        </div>
        <div className="max-w-[1280px] mx-auto px-xl relative z-10 w-full">
          <div className="max-w-3xl">
            <span className="inline-block px-md py-xs bg-onea-green/10 text-primary rounded-full font-label-md text-label-md mb-lg">Case Studies</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-text-primary leading-tight">
              Delivering Excellence Across Africa
            </h1>
            <p className="mt-lg text-on-surface-variant text-body-lg max-w-xl">
              Exploring how Onea empowers businesses through integrated connectivity and digital transformation strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-xl border-b border-border-subtle bg-white sticky top-[80px] z-40">
        <div className="max-w-[1280px] mx-auto px-xl">
          <div className="flex flex-wrap items-center gap-md">
            <span className="text-label-md text-on-surface-variant mr-md">Filter by:</span>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`px-lg py-sm rounded-full font-semibold transition-all ${
                  active === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-soft-surface text-on-surface-variant hover:bg-onea-green/10 hover:text-primary'
                }`}
                onClick={() => setActive(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="py-xxl bg-background">
        <div className="max-w-[1280px] mx-auto px-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
            {visible.map(cs => (
              <Link
                key={cs.id}
                to={`/case-studies/${cs.id}`}
                className="group bg-white rounded-lg overflow-hidden card-shadow transition-transform duration-500 hover:-translate-y-2 border border-border-subtle"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    src={cs.img}
                    alt={cs.title}
                  />
                  <div className="absolute top-md left-md">
                    <span className={`text-xs font-bold px-md py-xs rounded-full uppercase tracking-wider ${cs.badge}`}>
                      {cs.cat}
                    </span>
                  </div>
                </div>
                <div className="p-xl">
                  <h3 className="font-headline-md text-text-primary mb-md leading-snug">{cs.title}</h3>
                  <p className="text-on-surface-variant line-clamp-2 mb-xl">{cs.desc}</p>
                  <span className={`inline-flex items-center gap-sm font-bold group/link ${cs.linkColor}`}>
                    View Case Study
                    <span className="material-symbols-outlined transition-transform group-hover/link:translate-x-1">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-xxl flex justify-center">
            <button className="px-xl py-md border-2 border-primary text-primary font-bold rounded-full hover:bg-primary/5 transition-all active:scale-95">
              Load More Case Studies
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xxl bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto px-xl text-center">
          <h2 className="font-display-lg text-headline-lg mb-lg">Have a vision for your next project?</h2>
          <p className="text-on-primary/80 text-body-lg max-w-2xl mx-auto mb-xl">
            Let's collaborate to build the digital infrastructure and communication strategies your business deserves.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-md">
            <button
              className="bg-white text-primary px-xl py-md rounded-full font-bold hover:bg-surface-bright transition-all active:scale-95"
              onClick={onTalkToUs}
            >
              Start a Conversation
            </button>
            <Link to="/connectivity" className="border-2 border-white/30 text-white px-xl py-md rounded-full font-bold hover:bg-white/10 transition-all active:scale-95 text-center">
              Our Solutions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
