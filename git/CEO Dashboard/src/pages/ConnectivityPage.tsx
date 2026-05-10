import { Link } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

export default function ConnectivityPage({ onTalkToUs }: Props) {
  return (
    <div className="font-body-lg text-body-lg" style={{ backgroundColor: '#f8fbec', color: '#1a1c18' }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#424938]/30" style={{ backgroundColor: 'rgba(19,19,19,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="flex justify-between items-center w-full px-[64px] py-4 max-w-[1440px] mx-auto">
          <Link to="/" className="font-display-lg text-[32px] font-bold" style={{ color: '#a6e15d' }}>Onea Africa</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="font-medium hover:text-[#a6e15d] transition-colors duration-300 text-[#c2c9b3]">Solutions</Link>
            <Link to="/case-studies" className="font-medium hover:text-[#a6e15d] transition-colors duration-300 text-[#c2c9b3]">Case Studies</Link>
            <span className="font-bold border-b-2 pb-1" style={{ color: '#a6e15d', borderColor: '#a6e15d' }}>Operations</span>
            <a href="#" className="font-medium hover:text-[#a6e15d] transition-colors duration-300 text-[#c2c9b3]">Network</a>
            <a href="#" className="font-medium hover:text-[#a6e15d] transition-colors duration-300 text-[#c2c9b3]">Insights</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="font-medium hover:text-[#a6e15d] transition-colors text-[#c2c9b3]">Client Login</button>
            <button
              className="px-6 py-2 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all text-[#1f3700]"
              style={{ backgroundColor: '#a6e15d', boxShadow: '0 4px 14px rgba(166,225,93,0.2)' }}
              onClick={onTalkToUs}
            >
              Launch Platform
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-[64px] py-12">

        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] mb-24">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-label-caps text-label-caps mb-4 uppercase" style={{ color: '#a6e15d' }}>Infrastructure &amp; Connectivity</span>
            <h1 className="font-display-lg text-[48px] font-bold mb-6 leading-[1.15] tracking-tight" style={{ color: '#e5e2e1' }}>
              Operational High-Fidelity<br />across the Continent.
            </h1>
            <p className="text-[16px] mb-8 max-w-2xl text-[#c2c9b3]">
              Vertically integrated African technology solutions, from Openserve Fibre integration to managed enterprise-grade WiFi and Smart CCTV ecosystems.
            </p>
            <div className="flex gap-4">
              <button
                className="px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all text-[#1f3700]"
                style={{ backgroundColor: '#a6e15d' }}
                onClick={onTalkToUs}
              >
                Request Coverage Map
                <span className="material-symbols-outlined">map</span>
              </button>
              <a
                href="#specs"
                className="border px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all text-[#e5e2e1] border-[#424938]"
              >
                Technical Specs
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-[500px] rounded-xl overflow-hidden bento-card">
            <img
              className="w-full h-full object-cover opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyn0F2Uhkdtq8F5mI6rDYQmxf7UiFXa9lkXq893DKsKmQ2MtRPaFc5v99ght4R8SMyuiC6tFPgu_PjUkv5dI1yTnI9vjnEEaroEaLjmc1u2UnBwn-T1Ufj9CawnOukfueSUdqt2JWmHZVdMO9K6IneeJCb66pU2LmbYtPwS0UDa2yYZ6OsBM7ceaIbkopqzqPh645aqEG0kbmMRL7ubCCMSs4f7ynqxPbnk7F35C95S45NBLM-Vx27yfTDQNjsbP37jFUR1UnvHTc"
              alt="Data center"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #131313, transparent)' }}></div>
            <div className="absolute bottom-6 left-6 right-6 p-6 glass-nav rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot"></div>
                <span className="font-label-caps text-label-caps" style={{ color: '#a6e15d' }}>LIVE NETWORK STATUS</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[32px] font-bold text-[#e5e2e1]">99.9%</div>
                  <div className="text-[14px] text-[#c2c9b3]">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-[32px] font-bold text-[#e5e2e1]">1.2ms</div>
                  <div className="text-[14px] text-[#c2c9b3]">Core Latency</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-[24px] mb-24">
          {[
            { n: '1,284+', l: 'Active Connections' },
            { n: '412', l: 'Installations Managed' },
            { n: '99.3%', l: 'Resolution Rate' },
            { n: '240+', l: 'Business Clients' },
          ].map(s => (
            <div key={s.l} className="p-8 bento-card rounded-xl">
              <div className="text-[48px] font-bold leading-tight" style={{ color: '#8cc444' }}>{s.n}</div>
              <div className="font-label-caps text-label-caps mt-2 text-[#424938]">{s.l}</div>
            </div>
          ))}
        </section>

        {/* Network Architecture */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display-lg text-[32px] font-bold mb-2">Network Architecture</h2>
              <p className="text-[#424938]">Managed IT services and connectivity modules built for scale.</p>
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
                  <span className="material-symbols-outlined scale-125" style={{ color: '#416900' }}>settings_input_component</span>
                  <h3 className="font-display-lg text-[20px] font-semibold">Openserve Fibre Integration</h3>
                </div>
                <p className="text-[#424938] max-w-md mb-6">
                  Direct vertical integration with South Africa's largest infrastructure provider. We handle lead management, installations, and technical support from a single dashboard.
                </p>
                <ul className="space-y-3">
                  {['Enterprise-grade backhaul', 'Automated client onboarding', 'Tier 1 peering & latency optimization'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-[14px] text-[#1a1c18]">
                      <span className="material-symbols-outlined text-[14px]" style={{ color: '#416900' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[300px]">router</span>
              </div>
              <button className="w-fit border-b pb-1 font-bold hover:opacity-70 transition-all" style={{ color: '#416900', borderColor: '#416900' }} onClick={onTalkToUs}>
                View Coverage Portal
              </button>
            </div>

            {/* Managed WiFi */}
            <div className="p-10 bento-card rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(140,196,68,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#416900' }}>wifi</span>
                </div>
                <h3 className="font-display-lg text-[20px] font-semibold mb-4">Managed WiFi Systems</h3>
                <p className="text-[14px] text-[#424938]">
                  Cloud-managed WiFi extension for campuses, retail hubs, and large enterprise offices with centralized KPI tracking.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-[#424938]/30">
                <div className="flex justify-between text-[14px] mb-2">
                  <span className="text-[#424938]">Connected Devices</span>
                  <span className="text-[#1a1c18]">4,500+</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#d9dbcd' }}>
                  <div className="h-full w-[85%] rounded-full" style={{ backgroundColor: '#416900' }}></div>
                </div>
              </div>
            </div>

            {/* Smart CCTV */}
            <div className="p-10 bento-card rounded-xl flex flex-col justify-between h-[400px]">
              <div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(205,0,152,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#cd0098' }}>videocam</span>
                </div>
                <h3 className="font-display-lg text-[20px] font-semibold mb-4">Smart CCTV &amp; Security</h3>
                <p className="text-[14px] text-[#424938]">
                  AI-powered surveillance integrated with fiber connectivity for real-time monitoring and off-site backup.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded px-3 py-2 text-[10px] font-label-caps text-[#424938]" style={{ backgroundColor: '#d9dbcd' }}>4K STREAMING</div>
                <div className="rounded px-3 py-2 text-[10px] font-label-caps text-[#424938]" style={{ backgroundColor: '#d9dbcd' }}>AI DETECTION</div>
              </div>
            </div>

            {/* Field Agent Portal */}
            <div className="md:col-span-2 p-10 bento-card rounded-xl flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="font-label-caps text-label-caps mb-2 block" style={{ color: '#ffaed9' }}>FIELD OPERATIONS</span>
                <h3 className="font-display-lg text-[32px] font-semibold mb-4">Field Agent Portal</h3>
                <p className="text-[#424938] mb-6">
                  Empower your technicians with real-time site survey tools, installation tracking, and instant support escalation.
                </p>
                <button
                  className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-80 transition-all text-[#1a1c18]"
                  style={{ backgroundColor: '#d9dbcd' }}
                  onClick={onTalkToUs}
                >
                  Access Portal
                  <span className="material-symbols-outlined">launch</span>
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
            <h2 className="font-display-lg text-[32px] font-bold mb-4">Technical Specifications</h2>
            <p className="text-[#424938] max-w-2xl mx-auto">Standardised infrastructure parameters for our enterprise-grade connectivity suite.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#424938]/30" style={{ backgroundColor: '#edefe0' }}>
            <table className="w-full text-left">
              <thead className="border-b border-[#424938]/30" style={{ backgroundColor: '#d9dbcd' }}>
                <tr>
                  {['PARAMETER', 'FIBRE CORE', 'MANAGED WIFI', 'ENTERPRISE LTE'].map(h => (
                    <th key={h} className="px-8 py-4 font-label-caps text-label-caps text-[#424938]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#424938]/20">
                {[
                  { param: 'Maximum Bandwidth', fibre: 'Up to 10 Gbps', wifi: 'AX6000 Standard', lte: 'Up to 600 Mbps' },
                  { param: 'Target Latency', fibre: '< 5ms', wifi: '< 15ms', lte: '< 30ms' },
                  { param: 'Security Protocol', fibre: 'End-to-End Encrypted', wifi: 'WPA3 Enterprise', lte: 'Private APN' },
                  { param: 'Support Level', fibre: 'Tier 3 (24/7)', wifi: 'Managed Helpdesk', lte: 'On-call Support' },
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
            <h3 className="font-display-lg text-[32px] font-semibold mb-4">Regional Connectivity Reach</h3>
            <p className="text-[#424938] mb-6">Explore our live fiber footprint and upcoming network expansions across metropolitan centers.</p>
            <div className="space-y-4 mb-6">
              {[
                { city: 'Johannesburg Hub', status: '100% Active', active: true },
                { city: 'Cape Town Backbone', status: '100% Active', active: true },
                { city: 'Nairobi Node', status: 'Expanding', active: false },
              ].map(loc => (
                <div key={loc.city} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(248,251,236,0.5)' }}>
                  <span className="text-[14px]">{loc.city}</span>
                  <span className="font-bold text-[14px]" style={{ color: loc.active ? '#416900' : '#705d00' }}>{loc.status}</span>
                </div>
              ))}
            </div>
            <button
              className="px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all text-[#1f3700]"
              style={{ backgroundColor: '#a6e15d' }}
              onClick={onTalkToUs}
            >
              Open Interactive Map
            </button>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-24 py-20 px-12 rounded-3xl text-center relative overflow-hidden" style={{ backgroundColor: '#416900', color: '#ffffff' }}>
          <div className="relative z-10">
            <h2 className="font-display-lg text-[48px] font-bold mb-6">Ready to scale your infrastructure?</h2>
            <p className="max-w-2xl mx-auto mb-10 text-[18px] font-medium opacity-90">
              Join over 240+ business clients relying on Onea Africa for vertically integrated, high-fidelity operations and connectivity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                className="px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform"
                style={{ backgroundColor: '#102000', color: '#f8fbec' }}
                onClick={onTalkToUs}
              >
                Get a Proposal
              </button>
              <button
                className="bg-transparent border-2 px-10 py-4 rounded-full font-bold hover:bg-white/5 transition-colors"
                style={{ borderColor: '#102000', color: '#102000' }}
                onClick={onTalkToUs}
              >
                Contact Sales Engineering
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
          <p className="text-[14px] max-w-xs text-[#c2c9b3]">Accelerating African connectivity through vertically integrated technology and infrastructure operations.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[#e5e2e1] font-bold">RESOURCES</span>
            <Link to="/case-studies" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Case Studies</Link>
            <a href="#" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Network Status</a>
            <a href="#specs" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Tech Specs</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[#e5e2e1] font-bold">COMPANY</span>
            <a href="#" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">About Us</a>
            <a href="#" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Careers</a>
            <button className="text-left text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]" onClick={onTalkToUs}>Contact</button>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-[#e5e2e1] font-bold">LEGAL</span>
            <a href="#" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Privacy</a>
            <a href="#" className="text-[#c2c9b3] hover:text-[#a6e15d] transition-colors text-[14px]">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
