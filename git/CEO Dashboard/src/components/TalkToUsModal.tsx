interface Props { onClose: () => void; }

export default function TalkToUsModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[60] flex items-center justify-center p-md md:p-xl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">

        {/* Left sidebar */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-soft-surface p-xl border-r border-border-subtle">
          <div>
            <div className="font-display-lg text-headline-md font-extrabold text-primary mb-xl">Onea</div>
            <div className="space-y-md">
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-onea-green/10 flex items-center justify-center text-onea-green flex-shrink-0">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <p className="font-body-md text-on-surface-variant">High-speed infrastructure design and deployment.</p>
              </div>
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-onea-violet/10 flex items-center justify-center text-onea-violet flex-shrink-0">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <p className="font-body-md text-on-surface-variant">Strategic marketing tailored for emerging markets.</p>
              </div>
              <div className="flex items-start gap-md">
                <div className="w-10 h-10 rounded-full bg-onea-yellow/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <p className="font-body-md text-on-surface-variant">Impactful public relations that build lasting trust.</p>
              </div>
            </div>
          </div>
          <div className="mt-xxl">
            <p className="font-body-md text-on-surface-variant leading-relaxed italic border-l-4 border-onea-green pl-md">
              "Your partner in high-speed infrastructure, strategic marketing, and impactful public relations."
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 p-lg md:p-xl relative">
          <button
            className="absolute top-4 right-4 text-on-surface-variant hover:bg-soft-surface p-2 rounded-full transition-all"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <header className="mb-xl">
            <h2 className="font-display-lg text-headline-md text-primary mb-xs">Talk To Us</h2>
            <p className="font-body-md text-on-surface-variant">Let's build something that works together.</p>
          </header>
          <form className="space-y-lg" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant ml-md block">Full Name</label>
                <input
                  className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md focus:ring-2 focus:ring-onea-green focus:border-onea-green transition-all outline-none"
                  placeholder="John Doe"
                  type="text"
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant ml-md block">Work Email</label>
                <input
                  className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md focus:ring-2 focus:ring-onea-green focus:border-onea-green transition-all outline-none"
                  placeholder="john@company.com"
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-on-surface-variant ml-md block">Company Name</label>
              <input
                className="w-full bg-soft-surface border border-border-subtle rounded-full px-lg py-md focus:ring-2 focus:ring-onea-green focus:border-onea-green transition-all outline-none"
                placeholder="Onea Africa Corp"
                type="text"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-on-surface-variant ml-md block">Message/Requirements</label>
              <textarea
                className="w-full bg-soft-surface border border-border-subtle rounded-lg px-lg py-md focus:ring-2 focus:ring-onea-green focus:border-onea-green transition-all outline-none resize-none"
                placeholder="Tell us about your project or needs..."
                rows={4}
              />
            </div>
            <div className="pt-md">
              <button
                className="w-full bg-onea-green text-primary font-display-lg text-label-md uppercase tracking-wider font-bold h-14 rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-md"
                type="submit"
              >
                Submit Request
                <span className="material-symbols-outlined">send</span>
              </button>
              <p className="text-center font-label-md text-on-surface-variant mt-md">Typically responds within 24 hours.</p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
