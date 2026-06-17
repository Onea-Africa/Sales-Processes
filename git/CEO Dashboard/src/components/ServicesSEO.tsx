import { Link } from 'react-router-dom';

type PillarId = 'Connect_IT_Solutions' | 'Communicate_Digital_Marketing' | 'Converse_Public_Relations';
type MarketingEvent = 'service_pillar_view' | 'lead_intent_initiated';

type Pillar = {
  id: PillarId;
  title: string;
  desc: string;
  icon: string;
  href: string;
  cta: string;
};

const PILLARS: Pillar[] = [
  {
    id: 'Connect_IT_Solutions',
    title: 'Connect - Fibre, WiFi & IT',
    desc: 'Openserve-aligned fibre, LTE backup, WiFi coverage and managed IT support for stable day-to-day operations.',
    icon: 'router',
    href: '/solutions/openserve-business-fibre',
    cta: 'View Fibre Packages',
  },
  {
    id: 'Communicate_Digital_Marketing',
    title: 'Communicate - Digital Marketing',
    desc: 'SEO pages, social content and campaign systems that help South African businesses turn attention into enquiries.',
    icon: 'campaign',
    href: '/solutions/corporate-digital-marketing',
    cta: 'Start Campaign Brief',
  },
  {
    id: 'Converse_Public_Relations',
    title: 'Converse - Public Relations',
    desc: 'Reputation, public communication and customer trust layers built around clear business outcomes.',
    icon: 'forum',
    href: '/case-studies',
    cta: 'See Proof',
  },
];

function safeTrack(event: MarketingEvent, payload?: Record<string, unknown>) {
  try {
    window.OneaMarketing?.track?.(event, payload);
  } catch {
    // Analytics must never interrupt the customer journey.
  }
}

function focusBroadbandApplication() {
  const target = document.getElementById('telkom-dashboard-header');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      (target as HTMLElement).focus({ preventScroll: true });
    } catch {
      // Older browsers may not support focus options.
    }
    return;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function ServicesSEO(): JSX.Element {
  const onCardView = (pillar: Pillar) => {
    safeTrack('service_pillar_view', {
      pillar: pillar.id,
      route: pillar.href,
      page_url: window.location.href,
    });
  };

  const onConvertClick = (pillar: Pillar) => {
    safeTrack('lead_intent_initiated', {
      pillar: pillar.id,
      route: pillar.href,
      attribution: window.OneaMarketing?.getAttribution?.() ?? null,
    });
    focusBroadbandApplication();
  };

  return (
    <section aria-labelledby="services-heading" className="bg-[#F8FAF1] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D6139F]">Onea Africa Solutions</p>
          <h2 id="services-heading" className="mt-3 font-display text-3xl font-bold text-[#17210B] sm:text-4xl">
            Choose the right Onea service path and move from interest to action.
          </h2>
          <p className="mt-4 text-base leading-7 text-[#3C4630]">
            Start with the outcome you need: better connectivity, stronger digital visibility, or clearer public communication. Each path leads to a package view, quote builder or application flow.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              className="service-card flex min-h-[290px] flex-col rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm"
              onMouseEnter={() => onCardView(pillar)}
              onFocus={() => onCardView(pillar)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4D350] text-[#17210B]">
                <span className="material-symbols-outlined" aria-hidden="true">{pillar.icon}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-[#17210B]">{pillar.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#4B5540]">{pillar.desc}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={pillar.href}
                  onClick={() => onCardView(pillar)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8CC444] px-4 py-2 text-sm font-bold text-[#17210B] transition hover:bg-[#EEF7DF]"
                >
                  <span>{pillar.cta}</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                </Link>
                <button
                  type="button"
                  onClick={() => onConvertClick(pillar)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#8CC444] px-4 py-2 text-sm font-bold text-[#17210B] transition hover:bg-[#7BB337]"
                >
                  <span>Build Estimate</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">north_east</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
