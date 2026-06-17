import { Link } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

export default function ConnectivityPage({ onTalkToUs }: Props) {
  return (
    <div className="font-body-lg text-body-lg" style={{ backgroundColor: '#f8fbec', color: '#1a1c18' }}>

      {/* Nav */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: 'rgba(247,249,243,0.96)', backdropFilter: 'blur(16px)', borderBottom: '2px solid #8CC444' }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center w-full px-4 sm:px-6 lg:px-[64px] py-3 max-w-[1440px] mx-auto">
          <Link to="/" className="self-center sm:self-auto">
            <img src="/logo.png" alt="Onea Africa" className="h-7 sm:h-8 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Solutions', to: '/solutions', active: false },
              { label: 'Case Studies', to: '/case-studies', active: false },
            ].map(item => (
              <Link key={item.label} to={item.to} className="relative font-medium text-[#424938] hover:text-[#8CC444] transition-colors duration-200 group py-1">
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8CC444] group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            ))}
            <span className="relative font-bold text-[#8CC444] py-1">
              Operations
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8CC444] rounded-full" />
            </span>
            <a href="#network" className="relative font-medium text-[#424938] hover:text-[#8CC444] transition-colors duration-200 group py-1">
              Network
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8CC444] group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
            <Link to="/blog" className="relative font-medium text-[#424938] hover:text-[#8CC444] transition-colors duration-200 group py-1">
              Insights
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#8CC444] group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
        </nav>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Link
            to="/solutions"
            className="flex min-h-11 items-center justify-center px-2 sm:px-5 py-2 rounded-full font-bold hover:scale-95 active:scale-95 transition-all text-xs sm:text-sm text-center leading-tight"
            style={{ backgroundColor: '#D6139F', color: '#ffffff', boxShadow: '0 2px 8px rgba(214,19,159,0.22)' }}
          >
            Solutions
          </Link>
          <Link
            to="/client-portal"
            className="flex min-h-11 items-center justify-center px-2 sm:px-5 py-2 rounded-full font-bold hover:scale-95 active:scale-95 transition-all text-xs sm:text-sm text-center leading-tight"
            style={{ backgroundColor: '#F4D350', color: '#102000', boxShadow: '0 2px 8px rgba(244,211,80,0.25)' }}
          >
            Client Login
          </Link>
            <Link
              to="/launch-platform"
              className="flex min-h-11 items-center justify-center px-2 sm:px-5 py-2 rounded-full font-bold hover:scale-95 active:scale-95 transition-all text-xs sm:text-sm text-center leading-tight"
              style={{ backgroundColor: '#8CC444', color: '#102000', boxShadow: '0 2px 8px rgba(140,196,68,0.3)' }}
            >
              Launch Platform
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[64px] py-8 sm:py-12">

        {/* Hero */}
        <section id="network" className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] mb-12 sm:mb-24 scroll-mt-32 sm:scroll-mt-24">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-label-caps text-label-caps mb-4 uppercase" style={{ color: '#8CC444' }}>Business Fibre, WiFi &amp; Security</span>
            <h1 className="font-display-lg text-[38px] sm:text-[48px] font-bold mb-6 leading-[1.15] tracking-tight" style={{ color: '#1a1c18' }}>
              Reliable connectivity<br />for South African sites.
            </h1>
            <p className="text-[16px] mb-8 max-w-2xl text-[#424938]">
              Compare Openserve-aligned fibre, plan stronger WiFi coverage, add smart CCTV where needed and get a clear route from enquiry to installation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                className="px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all text-[#1f3700]"
                style={{ backgroundColor: '#a6e15d' }}
                to="/pricing"
              >
                Build an Estimate
                <span className="material-symbols-outlined">calculate</span>
              </Link>
              <Link
                to="/telkom-application"
                className="border px-8 py-4 rounded-full font-bold text-center hover:bg-white transition-all text-[#1a1c18] border-[#737a67]"
              >
                Start Fibre Application
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-[420px] sm:h-[500px] rounded-xl overflow-hidden bento-card">
            <img
              className="w-full h-full object-cover opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyn0F2Uhkdtq8F5mI6rDYQmxf7UiFXa9lkXq893DKsKmQ2MtRPaFc5v99ght4R8SMyuiC6tFPgu_PjUkv5dI1yTnI9vjnEEaroEaLjmc1u2UnBwn-T1Ufj9CawnOukfueSUdqt2JWmHZVdMO9K6IneeJCb66pU2LmbYtPwS0UDa2yYZ6OsBM7ceaIbkopqzqPh645aqEG0kbmMRL7ubCCMSs4f7ynqxPbnk7F35C95S45NBLM-Vx27yfTDQNjsbP37jFUR1UnvHTc"
              alt="Data center"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #131313, transparent)' }}></div>
            <div
              className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 sm:p-6 rounded-xl border border-white/10"
              style={{ backgroundColor: 'rgba(19,19,19,0.82)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot"></div>
                <span className="font-label-caps text-label-caps" style={{ color: '#a6e15d' }}>LIVE NETWORK STATUS</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[26px] sm:text-[32px] font-bold text-[#e5e2e1]">99.9%</div>
                  <div className="text-[14px] text-[#c2c9b3]">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-[26px] sm:text-[32px] font-bold text-[#e5e2e1]">1.2ms</div>
                  <div className="text-[14px] text-[#c2c9b3]">Core Latency</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-16 sm:mb-24">
          {[
            { n: '1,284+', l: 'Active Connections' },
            { n: '412', l: 'Installations Managed' },
            { n: '99.3%', l: 'Resolution Rate' },
            { n: '240+', l: 'Business Clients' },
          ].map(s => (
            <div key={s.l} className="min-w-0 min-h-[172px] sm:min-h-[210px] p-4 sm:p-6 lg:p-8 bento-card rounded-xl flex flex-col justify-center">
              <div className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold leading-none whitespace-nowrap" style={{ color: '#8cc444' }}>{s.n}</div>
              <div className="font-label-caps text-label-caps mt-3 text-[#424938]">{s.l}</div>
            </div>
          ))}
        </section>

        {/* Network Architecture */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-8 sm:mb-12">
            <div>
              <h2 className="font-display-lg text-[28px] sm:text-[32px] font-bold mb-2 leading-tight">What We Help You Configure</h2>
              <p className="text-[#424938]">Clear connectivity, WiFi and security options before you commit to a final quote.</p>
            </div>
            <div className="hidden md:block">
              <span className="font-label-caps text-label-caps text-[#424938]">SCALABLE INFRASTRUCTURE</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">

            {/* Openserve */}
            <div className="md:col-span-2 p-10 bento-card rounded-xl relative overflow-hidden flex flex-col justify-between h-[450px]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined scale-125" style={{ color: '#8CC444' }}>settings_input_component</span>
                  <h3 className="font-display-lg text-[20px] font-semibold">Openserve Fibre Integration</h3>
                </div>
                <p className="text-[#424938] max-w-md mb-6">
                  Openserve-aligned package guidance with a practical application path. We help customers compare line speeds, confirm terms, prepare details and request installation support.
                </p>
                <ul className="space-y-3">
                  {['Easy Connect and Webstream package options', 'Subject-to-credit-vetting notes made clear', 'Application and signed PDF support'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-[14px] text-[#1a1c18]">
                      <span className="material-symbols-outlined text-[14px]" style={{ color: '#8CC444' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[300px]">router</span>
              </div>
              <Link to="/pricing" className="w-fit border-b pb-1 font-bold hover:opacity-70 transition-all" style={{ color: '#8CC444', borderColor: '#8CC444' }}>
                Check Package Options
              </Link>
            </div>

            {/* Managed WiFi */}
            <div className="p-10 bento-card rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(140,196,68,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#8CC444' }}>wifi</span>
                </div>
                <h3 className="font-display-lg text-[20px] font-semibold mb-4">Managed WiFi Systems</h3>
                <p className="text-[14px] text-[#424938]">
                  Indoor and outdoor WiFi planning for homes, offices, guesthouses, retail sites and schools, with access point and cabling estimates built around the site layout.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-[#424938]/30">
                <div className="flex justify-between text-[14px] mb-2">
                  <span className="text-[#424938]">Connected Devices</span>
                  <span className="text-[#1a1c18]">4,500+</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#d9dbcd' }}>
                  <div className="h-full w-[85%] rounded-full" style={{ backgroundColor: '#8CC444' }}></div>
                </div>
              </div>
            </div>

            {/* Smart CCTV */}
            <Link to="/pricing?solution=cctv-access" className="p-10 bento-card rounded-xl flex flex-col justify-between h-[400px] transition-transform hover:-translate-y-1">
              <div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(205,0,152,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#cd0098' }}>videocam</span>
                </div>
                <h3 className="font-display-lg text-[20px] font-semibold mb-4">Smart CCTV &amp; Security</h3>
                <p className="text-[14px] text-[#424938]">
                  Camera, NVR, access control and smart security estimates with the right questions for indoor, outdoor, storage and optional monitoring needs.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded px-3 py-2 text-[10px] font-label-caps text-[#424938]" style={{ backgroundColor: '#d9dbcd' }}>4K STREAMING</div>
                <div className="rounded px-3 py-2 text-[10px] font-label-caps text-[#424938]" style={{ backgroundColor: '#d9dbcd' }}>AI DETECTION</div>
              </div>
            </Link>

            {/* Site Assessment */}
            <div className="md:col-span-2 p-10 bento-card rounded-xl flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="font-label-caps text-label-caps mb-2 block" style={{ color: '#ffaed9' }}>FIELD OPERATIONS</span>
                <h3 className="font-display-lg text-[32px] font-semibold mb-4">Site Assessment Support</h3>
                <p className="text-[#424938] mb-6">
                  For larger sites, Onea Africa can review floor count, cabling distance, ceiling or roof access, power availability and installation complexity before final pricing.
                </p>
                <button
                  className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-80 transition-all text-[#1a1c18]"
                  style={{ backgroundColor: '#d9dbcd' }}
                  onClick={onTalkToUs}
                >
                  Request Site Review
                  <span className="material-symbols-outlined">north_east</span>
                </button>
              </div>
              <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden border border-[#424938]/30">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATIcQKiWkeirk3PhZHT3_f_zFEAcGOVbh8S736ESKpCBHEUm8ZJZ0Wql03gWXV9s_I0-9saRz0oG45BJ_ywKuUZicRZmRxaLxj64igVSemJDzQO6hR2qvkhti_2Sgku6aYLVGIEQ9Ju7NsxkSrNynn_5SZ3xNAQrWm7WWt9qMmHlSXrPgO5vasYYQ_k_I5LGeKroolNo6dudMAg1lAOx2TzFInB3ieTz8RFxGaNmSy8GlDRBogCp6MlOuH4iEk_uEr7sL01VYqTxw"
                  alt="Field agent portal"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Technical Specs */}
        <section className="mb-24" id="specs">
          <div className="text-center mb-16">
            <h2 className="font-display-lg text-[32px] font-bold mb-4">Planning Guide</h2>
            <p className="text-[#424938] max-w-2xl mx-auto">Use these guide rails to understand what affects the final quote before a site assessment.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#424938]/30" style={{ backgroundColor: '#edefe0' }}>
            <table className="w-full text-left">
              <thead className="border-b border-[#424938]/30" style={{ backgroundColor: '#d9dbcd' }}>
                <tr>
                  {['ITEM', 'FIBRE', 'WIFI / CABLING', 'CCTV / SECURITY'].map(h => (
                    <th key={h} className="px-8 py-4 font-label-caps text-label-caps text-[#424938]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424938]/20">
                {[
                  { param: 'What affects pricing', fibre: 'Line speed and contract terms', wifi: 'Access points and cable length', lte: 'Camera count and storage needs' },
                  { param: 'Typical questions', fibre: 'Address and package choice', wifi: 'Rooms, floors and coverage areas', lte: 'Indoor, outdoor and night vision' },
                  { param: 'Installation notes', fibre: 'Subject to provider approval', wifi: 'Indoor R15/m, outdoor R32/m', lte: 'Mounting, power and network access' },
                  { param: 'Support options', fibre: 'Application and line support', wifi: 'Once-off or managed support', lte: 'Optional monitoring or backup' },
                ].map(row => (
                  <tr key={row.param} className="hover:bg-[#e7eadb] transition-colors">
                    <td className="px-8 py-6 font-bold text-[#1a1c18]">{row.param}</td>
                    <td className="px-8 py-6 text-[#424938]">{row.fibre}</td>
                    <td className="px-8 py-6 text-[#424938]">{row.wifi}</td>
                    <td className="px-8 py-6 text-[#424938]">{row.lte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Coverage Map */}
        <section className="mb-24 relative rounded-2xl overflow-hidden h-[600px] border border-[#424938]/30 bento-card">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover opacity-40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx6QYmpJK24I7q1kYMKye4xRaCF9R4iZoMQnUiZcz609whOqCa5fdZcj-juc0tBpVz6xJ69kAa6-cfYOhJ6Eb2NanE6AK9wY30DqbFyb6LviYnLM917IGAkRVS3mX6X0EsX94s7AhG8cy1NWh_861V4-7wPZON21RLeSLB8ehNvZFq8VAsvKBqGnuaq6TjLyNE0yyuK6ZI0sKb1NzNWHMMFbvby4YZ-asNo_neV0hNXZ4KeSv-kbUUrqBq6Wu2WCg1bdnRERlk2lA"
              alt="Africa connectivity map"
            />
          </div>
          <div className="absolute top-12 left-12 z-10 max-w-md p-8 glass-nav rounded-xl border border-white/10">
            <h3 className="font-display-lg text-[32px] font-semibold mb-4">National Service Reach</h3>
            <p className="text-[#424938] mb-6">Onea Africa serves clients nationally. Availability depends on address, network coverage and package rules.</p>
            <div className="space-y-4 mb-6">
              {[
                { city: 'Gauteng', status: 'Active support', active: true },
                { city: 'National fibre checks', status: 'Available', active: true },
                { city: 'Multi-site projects', status: 'Assessment based', active: false },
              ].map(loc => (
                <div key={loc.city} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(248,251,236,0.5)' }}>
                  <span className="text-[14px]">{loc.city}</span>
                  <span className="font-bold text-[14px]" style={{ color: loc.active ? '#8CC444' : '#705d00' }}>{loc.status}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onTalkToUs}
              className="px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all text-[#1f3700]"
              style={{ backgroundColor: '#a6e15d' }}
            >
              Request Availability Check
            </button>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-24 py-20 px-12 rounded-3xl text-center relative overflow-hidden" style={{ backgroundColor: '#8CC444', color: '#102000' }}>
          <div className="relative z-10">
            <h2 className="font-display-lg text-[48px] font-bold mb-6">Ready to price your connectivity project?</h2>
            <p className="max-w-2xl mx-auto mb-10 text-[18px] font-medium opacity-90">
              Use the Onea Solution Builder for a planning estimate, then request a final quote once the package, site layout and installation needs are clear.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform"
                style={{ backgroundColor: '#102000', color: '#f8fbec' }}
                onClick={onTalkToUs}
              >
                Request a Quote
              </button>
              <button
                className="bg-transparent border-2 px-10 py-4 rounded-full font-bold hover:bg-white/5 transition-colors"
                style={{ borderColor: '#102000', color: '#102000' }}
                onClick={onTalkToUs}
              >
                Talk To Us
              </button>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ backgroundColor: '#2f4e00' }}></div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full px-[64px] py-16 flex flex-col md:flex-row justify-between items-start gap-12 border-t" style={{ backgroundColor: '#0e0e0e', borderColor: '#424938' }}>
        <div className="flex flex-col gap-6">
          <div className="font-display-lg text-[32px] font-bold" style={{ color: '#a6e15d' }}>Onea Africa</div>
          <p className="text-[14px] max-w-xs text-[#c2c9b3]">Fibre, WiFi, CCTV and IT support for South African homes, teams and business sites.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
          <span className="font-label-caps text-[#e5e2e1] font-bold">RESOURCES</span>
          <Link to="/solutions" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Solutions</Link>
          <Link to="/case-studies" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Case Studies</Link>
            <a href="#network" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Network Status</a>
            <a href="#specs" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Tech Specs</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[#e5e2e1] font-bold">COMPANY</span>
            <Link to="/" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">About Us</Link>
            <Link to="/careers" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Careers</Link>
            <button className="text-left text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]" onClick={onTalkToUs}>Contact</button>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[#e5e2e1] font-bold">LEGAL</span>
            <Link to="/privacy" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Privacy</Link>
            <Link to="/terms" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
