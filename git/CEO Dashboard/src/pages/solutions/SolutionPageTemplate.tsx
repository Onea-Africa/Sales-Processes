import { Link } from 'react-router-dom';

export type SolutionPageProps = {
  onTalkToUs?: () => void;
};

type CTA = {
  label: string;
  href?: string;
  action?: 'talk';
};

type SolutionPageTemplateProps = SolutionPageProps & {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  primary: CTA;
  secondary: CTA;
  outcomes: string[];
  proof: string[];
  process: string[];
  overview?: {
    heading: string;
    body: string[];
  };
  bestFor?: string[];
  benefits?: string[];
  industries?: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
};

function trackIntent(label: string, title: string) {
  try {
    window.OneaMarketing?.track?.('lead_intent_initiated', {
      pillar: title,
      cta: label,
      attribution: window.OneaMarketing?.getAttribution?.() ?? null,
    });
  } catch {
    // Keep CTAs working even when analytics is blocked.
  }
}

function CTAButton({ cta, title, onTalkToUs, primary = false }: { cta: CTA; title: string; onTalkToUs?: () => void; primary?: boolean }) {
  const className = primary
    ? 'inline-flex items-center justify-center gap-2 rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#17210B] transition hover:bg-[#7BB337]'
    : 'inline-flex items-center justify-center gap-2 rounded-full border border-[#D6139F] px-5 py-3 text-sm font-bold text-[#17210B] transition hover:bg-[#FBE8F6]';

  if (cta.action === 'talk') {
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          trackIntent(cta.label, title);
          onTalkToUs?.();
        }}
      >
        <span>{cta.label}</span>
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
      </button>
    );
  }

  return (
    <Link
      to={cta.href ?? '/pricing'}
      className={className}
      onClick={() => trackIntent(cta.label, title)}
    >
      <span>{cta.label}</span>
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
    </Link>
  );
}

export default function SolutionPageTemplate({
  onTalkToUs,
  eyebrow,
  title,
  subtitle,
  description,
  icon,
  image,
  primary,
  secondary,
  outcomes,
  proof,
  process,
  overview,
  bestFor,
  benefits,
  industries,
  faqs,
}: SolutionPageTemplateProps) {
  const isOneaArtwork = image.endsWith('/onea-logo-yellow-2026.png');

  return (
    <main className="bg-[#FBFCF6] text-[#17210B]">
      <section className="border-b border-[#D9DBCD] bg-white">
        <div className="mx-auto grid min-h-[620px] max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F4D350]">
                <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">{eyebrow}</p>
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-[#17210B] sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-5 text-xl font-semibold text-[#31411F]">{subtitle}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#4B5540]">{description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton cta={primary} title={title} onTalkToUs={onTalkToUs} primary />
              <CTAButton cta={secondary} title={title} onTalkToUs={onTalkToUs} />
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {proof.map((item) => (
                <span key={item} className="rounded-full border border-[#D9DBCD] bg-[#F8FAF1] px-3 py-2 text-xs font-bold text-[#31411F]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center">
            <div
              className={`w-full overflow-hidden rounded-lg border border-[#D9DBCD] shadow-sm ${
                isOneaArtwork ? 'bg-[rgba(244,211,80,0.7)]' : 'bg-[#F8FAF1]'
              }`}
            >
              <img
                src={image}
                alt={isOneaArtwork ? 'Onea Africa logo' : ''}
                className={
                  isOneaArtwork
                    ? 'h-[420px] w-full object-contain p-8 sm:p-12'
                    : 'h-[420px] w-full object-cover'
                }
                loading="eager"
              />
              <div className="grid grid-cols-3 border-t border-[#D9DBCD] bg-white">
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-[#D6139F]">Connect</p>
                  <p className="mt-1 text-sm font-semibold">Infrastructure</p>
                </div>
                <div className="border-x border-[#D9DBCD] p-4">
                  <p className="text-xs font-bold uppercase text-[#8CC444]">Communicate</p>
                  <p className="mt-1 text-sm font-semibold">Campaigns</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase text-[#A98900]">Converse</p>
                  <p className="mt-1 text-sm font-semibold">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">What You Get</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-[#17210B]">Built for enquiries, applications and measurable follow-through.</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {outcomes.map((item) => (
              <div key={item} className="rounded-lg border border-[#D9DBCD] bg-white p-5 shadow-sm">
                <span className="material-symbols-outlined text-[#8CC444]" aria-hidden="true">check_circle</span>
                <p className="mt-3 text-sm leading-6 text-[#3C4630]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#D9DBCD] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">How Installation Works</p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {process.map((item, index) => (
              <div key={item} className="rounded-lg border border-[#D9DBCD] bg-[#FBFCF6] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4D350] text-sm font-bold">{index + 1}</div>
                <p className="mt-4 text-sm leading-6 text-[#3C4630]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(overview || bestFor?.length || benefits?.length || industries?.length) && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.9fr]">
            {overview && (
              <article className="rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Service Guide</p>
                <h2 className="mt-3 font-display text-3xl font-bold text-[#17210B]">{overview.heading}</h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-[#3C4630]">
                  {overview.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            )}

            <aside className="space-y-4">
              {bestFor?.length ? (
                <div className="rounded-lg border border-[#D9DBCD] bg-[#F8FAF1] p-5">
                  <h3 className="font-display text-xl font-bold text-[#17210B]">Who This Is For</h3>
                  <ul className="mt-4 space-y-3">
                    {bestFor.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-[#3C4630]">
                        <span className="material-symbols-outlined text-[18px] text-[#8CC444]" aria-hidden="true">groups</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {industries?.length ? (
                <div className="rounded-lg border border-[#D9DBCD] bg-white p-5">
                  <h3 className="font-display text-xl font-bold text-[#17210B]">Industries Served</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {industries.map((item) => (
                      <span key={item} className="rounded-full border border-[#D9DBCD] bg-[#FBFCF6] px-3 py-2 text-xs font-bold text-[#31411F]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

          {benefits?.length ? (
            <div className="mt-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Benefits</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-[#17210B]">Why clients choose this service</h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {benefits.map((item) => (
                  <div key={item} className="rounded-lg border border-[#D9DBCD] bg-white p-5 shadow-sm">
                    <span className="material-symbols-outlined text-[#8CC444]" aria-hidden="true">verified</span>
                    <p className="mt-3 text-sm leading-6 text-[#3C4630]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {faqs?.length ? (
        <section className="border-t border-[#D9DBCD] bg-white">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-[#17210B]">Common Questions</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((item) => (
                <details key={item.question} className="rounded-lg border border-[#D9DBCD] bg-[#FBFCF6] p-5">
                  <summary className="cursor-pointer font-bold text-[#17210B]">{item.question}</summary>
                  <p className="mt-3 text-sm leading-6 text-[#3C4630]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
