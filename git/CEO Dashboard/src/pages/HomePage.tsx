import { Link } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

export default function HomePage({ onTalkToUs }: Props) {
  return (
    <main className="bg-background text-on-background font-body-md">

      {/* Hero */}
      <section className="relative overflow-hidden pt-xxl pb-xxl px-md">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-xl items-center">
          <div className="md:col-span-7 space-y-lg">
            <div className="inline-flex items-center gap-sm bg-primary/10 text-primary px-md py-xs rounded-full">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="font-label-md text-label-md uppercase tracking-widest">South African Technology Partner</span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-text-primary leading-tight">
              Connect.<br />
              Communicate.<br />
              Converse.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Empowering South African businesses through high-speed infrastructure, strategic digital marketing, and impactful public relations. We are your end-to-end growth engine.
            </p>
            <div className="flex flex-wrap gap-md pt-md">
              <button
                className="bg-onea-green text-text-primary h-[56px] px-xl rounded-lg font-bold text-body-lg shadow-lg hover:shadow-xl transition-all"
                onClick={onTalkToUs}
              >
                Partner With Us
              </button>
              <Link
                to="/connectivity"
                className="bg-soft-surface text-on-surface h-[56px] px-xl rounded-lg font-bold text-body-lg border border-border-subtle hover:bg-white transition-all flex items-center"
              >
                Explore Solutions
              </Link>
            </div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="aspect-square rounded-lg overflow-hidden soft-shadow bg-soft-surface relative z-10">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmFE8Ygpe_cFTLlbMRuGrMJ0vqMHkp0rMPNWrNilZzMJmqQPAkAabJCK4i7xA9KbgPJCrzDhzJh6IzEolVWHCdOCaZTLDRyIk-wsSx3BWqb1AgcS0t5-5qJ7ocLIC2CxJqqyj59ZTbjJ4VWFU-VO5nK7gWrtRsm6qaOSeaU1jBjrk98YaSDTLVcHvZP8OMO00mKwDEyPe3ge5pW84DfcCupig5qlLcHOii_X_84jE1TH4xludVK4RpQgfoe_Lc57E8CIkKIbmoHnI"
                alt="Professional workspace"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-onea-yellow/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-onea-violet/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Trust Grid */}
      <section className="bg-soft-surface py-xl border-y border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg items-center text-center">
            {[
              { icon: 'verified', label: 'B-BBEE Level 1 Status' },
              { icon: 'partner_exchange', label: 'Openserve Partnership' },
              { icon: 'public', label: 'National Coverage' },
              { icon: 'groups', label: 'Community Focused' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[2rem]">{item.icon}</span>
                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Access Strip */}
      <section className="py-lg bg-surface-container-low border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-md flex flex-wrap justify-center gap-xl items-center">
          <span className="font-label-md text-on-surface-variant uppercase tracking-widest">Platform Access:</span>
          <button className="flex items-center gap-xs font-semibold text-primary hover:underline" onClick={onTalkToUs}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Onea Dashboard
          </button>
          <button className="flex items-center gap-xs font-semibold text-primary hover:underline" onClick={onTalkToUs}>
            <span className="material-symbols-outlined text-[20px]">support_agent</span> Field Agent Portal
          </button>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-xxl px-md bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-xxl max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-md">Our Three Pillars of Excellence</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">We provide the infrastructure to connect, the strategies to communicate, and the stories to converse with your audience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">

            {/* Connect */}
            <div className="group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-green/30 transition-all">
              <div className="w-16 h-16 bg-onea-green/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[32px]">settings_ethernet</span>
              </div>
              <div className="mb-md">
                <span className="inline-block px-md py-xs bg-onea-green/10 border border-onea-green text-primary rounded-full font-label-md text-label-md mb-sm">Connect</span>
                <h3 className="font-headline-md text-headline-md text-text-primary">Fibre &amp; IT Solutions</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
                High-speed fibre connectivity and robust IT infrastructure tailored for South African enterprises. Reliable, scalable, and secure.
              </p>
              <ul className="space-y-sm mb-xl">
                {['Business Fibre', 'Managed IT Services', 'Cloud Infrastructure'].map(item => (
                  <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/connectivity" className="inline-flex items-center gap-sm text-primary font-bold group-hover:gap-md transition-all">
                Learn More <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {/* Communicate */}
            <div className="group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-yellow/30 transition-all">
              <div className="w-16 h-16 bg-onea-yellow/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary text-[32px]">campaign</span>
              </div>
              <div className="mb-md">
                <span className="inline-block px-md py-xs bg-onea-yellow/10 border border-onea-yellow text-on-secondary-container rounded-full font-label-md text-label-md mb-sm">Communicate</span>
                <h3 className="font-headline-md text-headline-md text-text-primary">Digital Marketing</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
                Elevate your brand presence through data-driven digital strategies and creative execution that resonates with the local market.
              </p>
              <ul className="space-y-sm mb-xl">
                {['Performance Marketing', 'Social Media Strategy', 'Content Creation'].map(item => (
                  <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                    <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span> {item}
                  </li>
                ))}
              </ul>
              <Link to="/case-studies" className="inline-flex items-center gap-sm text-secondary font-bold group-hover:gap-md transition-all">
                Learn More <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {/* Converse */}
            <div className="group bg-soft-surface p-xl rounded-lg soft-shadow border border-transparent hover:border-onea-violet/30 transition-all">
              <div className="w-16 h-16 bg-onea-violet/10 rounded-full flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary text-[32px]">forum</span>
              </div>
              <div className="mb-md">
                <span className="inline-block px-md py-xs bg-onea-violet/10 border border-onea-violet text-on-tertiary-container rounded-full font-label-md text-label-md mb-sm">Converse</span>
                <h3 className="font-headline-md text-headline-md text-text-primary">Public Relations</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-xl">
                Building authentic relationships through impactful storytelling and strategic media engagement across South Africa.
              </p>
              <ul className="space-y-sm mb-xl">
                {['Media Relations', 'Crisis Management', 'Brand Positioning'].map(item => (
                  <li key={item} className="flex items-center gap-sm font-label-md text-label-md">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span> {item}
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center gap-sm text-tertiary font-bold group-hover:gap-md transition-all" onClick={onTalkToUs}>
                Learn More <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-xxl px-md bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto bg-primary text-on-primary rounded-xl p-xxl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-md">A Proud Openserve Partner</h2>
              <p className="font-body-lg text-body-lg opacity-90 mb-xl">
                Through our strategic partnership with Openserve, we bring world-class connectivity to the doorstep of South African businesses, ensuring you stay ahead in the digital economy.
              </p>
              <button
                className="bg-onea-yellow text-on-secondary-fixed px-xl h-[56px] rounded-lg font-bold hover:scale-95 transition-all"
                onClick={onTalkToUs}
              >
                Get Connected Now
              </button>
            </div>
            <div className="hidden md:block">
              <img
                className="rounded-lg shadow-2xl w-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh30jzt2HDnrxFwintIZ9aVFckUXs2DHij4H1cy6ZaWaHSfwcDTQn3tP2iS0airZ2mesjLSnEHvvOsIUfF-gNMdT4o9naLBiXRepN_0cGIlylC0QeOiAsXsNhLUvthcTi-R436e7xY5e9A8xykb81PIbHrS_JFmDeSb4n9JZ1wyMczmsOXU1RsSaTPOjvS7c27__geqm6wSB4jRgxNeyRDpNgUHQZi0dWzQPoCIHu-HuUaTi2Nb3aTjKovA9dFWWfOiLgPly2QnKc"
                alt="Fibre optic cables"
              />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-onea-yellow/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none"></div>
        </div>
      </section>

    </main>
  );
}
