import { Link } from 'react-router-dom';

const SOLUTIONS = [
  {
    title: 'Openserve Business Fibre',
    desc: 'Business fibre, Openserve package guidance and Telkom application support for home and business connectivity.',
    icon: 'settings_ethernet',
    href: '/solutions/openserve-business-fibre',
    cta: 'View Fibre',
  },
  {
    title: 'LTE Enterprise Packages',
    desc: 'Telkom LTE bundles, unlimited LTE and backup internet planning.',
    icon: 'signal_cellular_alt',
    href: '/solutions/lte-enterprise-packages',
    cta: 'Apply For LTE',
  },
  {
    title: 'Home WiFi Networking',
    desc: 'WiFi installation, mesh coverage and WiFi extension guidance for homes, offices and client-facing spaces.',
    icon: 'wifi',
    href: '/solutions/home-wifi-networking',
    cta: 'Improve WiFi',
  },
  {
    title: 'Managed IT Support',
    desc: 'Managed IT support, helpdesk, infrastructure, hosting and device support for growing teams.',
    icon: 'computer',
    href: '/solutions/managed-it-support',
    cta: 'Get Support',
  },
  {
    title: 'Corporate Digital Marketing',
    desc: 'Digital marketing agency support, SEO pages, campaign assets and conversion tracking for measurable lead generation.',
    icon: 'campaign',
    href: '/solutions/corporate-digital-marketing',
    cta: 'Grow Leads',
  },
];

export default function SolutionsIndex() {
  return (
    <main className="bg-[#FBFCF6] text-[#17210B]">
      <section className="border-b border-[#D9DBCD] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Solutions</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            Onea Africa solutions for homes, businesses and growing teams.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[#4B5540]">
            From reliable business fibre and LTE to managed WiFi, IT support and digital growth, we help clients connect better, work faster and get support when it matters.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['B-BBEE Level 1', 'Telkom/Openserve aligned', 'Home WiFi', 'Business connectivity'].map((item) => (
              <span key={item} className="rounded-full border border-[#D9DBCD] bg-[#F8FAF1] px-3 py-2 text-xs font-bold text-[#31411F]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#D9DBCD] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-1">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Service Focus</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight">
              Clear technology services with Onea Africa as your support layer.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-[#4B5540] lg:col-span-2">
            <p>
              Onea Africa helps clients choose and manage connectivity solutions that fit the way they live and work. Our business fibre and LTE routes support homes, SMEs and offices that need stable internet, better onboarding and a clear application path.
            </p>
            <p>
              Our WiFi installation service focuses on coverage design, router placement, mesh WiFi, access points and managed network support for dead zones, weak signal and slow office networks. We pair that with managed IT support for devices, helpdesk, cloud, hosting and day-to-day infrastructure needs.
            </p>
            <p>
              For growth, Onea Africa also operates as a digital marketing agency for South African businesses that need SEO pages, lead funnels, campaign tracking and practical content support connected to real enquiries.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#D9DBCD] bg-[#FBFCF6]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border-2 border-[#D6139F]/25 bg-white shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="bg-[#F8FAF1] p-6 sm:p-8 lg:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#F4D350]">
                  <span className="material-symbols-outlined text-[30px]" aria-hidden="true">wifi_tethering</span>
                </div>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[#D6139F]">Onea Home & Business WiFi Solutions</p>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                  Dead zones gone. Weak signal fixed. WiFi designed for the way you actually live and work.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#4B5540]">
                  WiFi should not stop at the lounge, reception desk or boardroom door. It should reach the rooms, offices, gardens, pool areas, clubhouses, cameras and workspaces where people actually need it.
                </p>
                <p className="mt-4 text-base leading-8 text-[#4B5540]">
                  We do WiFi properly. WiFi is not a fire you place in one corner and hope it spreads. It needs planning, coverage design, the right equipment, clean installation and managed support. Many clients are frustrated when we arrive. When we leave, calls are stable, offices move faster, and the signal reaches places that used to drop.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/27694644663?text=Hi%20Onea%20Africa%2C%20I%20need%20help%20with%20WiFi%20dead%20zones%20or%20weak%20signal."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8CC444] px-5 py-3 text-sm font-bold text-[#102000] hover:opacity-90"
                    onClick={() => {
                      try {
                        window.OneaMarketing?.track?.('lead_intent_initiated', {
                          pillar: 'Onea Home & Business WiFi Solutions',
                          cta: 'WhatsApp WiFi Assessment',
                        });
                      } catch {
                        // Keep the contact action working.
                      }
                    }}
                  >
                    WhatsApp WiFi Assessment
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">chat</span>
                  </a>
                  <Link
                    to="/client-portal"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D6139F] px-5 py-3 text-sm font-bold text-[#102000] hover:bg-[#FBE8F6]"
                  >
                    Log WiFi Support Request
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:p-10">
                {[
                  ['Dead zones removed', 'Coverage for bedrooms, boardrooms, patios, gardens, clubhouses and hard-to-reach corners.'],
                  ['Managed network design', 'Router placement, mesh points, access points, cabling and handover planned as one working system.'],
                  ['Business-ready reliability', 'Improve slow office WiFi, unstable video calls, shared workspaces, guest access and device-heavy environments.'],
                  ['Peace of mind support', 'Onea Africa diagnoses, improves and supports the network so clients are not left guessing.'],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-lg border border-[#D9DBCD] bg-[#FBFCF6] p-5">
                    <span className="material-symbols-outlined text-[#8CC444]" aria-hidden="true">check_circle</span>
                    <h3 className="mt-3 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#4B5540]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SOLUTIONS.map((solution) => (
            <Link
              key={solution.href}
              to={solution.href}
              className="service-card flex min-h-[260px] flex-col rounded-lg border border-[#D9DBCD] bg-white p-6 shadow-sm"
              onClick={() => {
                try {
                  window.OneaMarketing?.track?.('service_pillar_view', {
                    pillar: solution.title,
                    route: solution.href,
                  });
                } catch {
                  // Navigation should not depend on analytics.
                }
              }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4D350]">
                <span className="material-symbols-outlined" aria-hidden="true">{solution.icon}</span>
              </span>
              <h2 className="mt-5 text-xl font-bold">{solution.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#4B5540]">{solution.desc}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#D6139F]">
                {solution.cta}
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
