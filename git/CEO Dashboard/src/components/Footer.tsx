export default function Footer() {
  return (
    <footer className="bg-soft-surface w-full rounded-t-xl border-t border-border-subtle">
      <div className="max-w-[1280px] mx-auto px-xl py-xxl flex flex-col md:flex-row justify-between items-center gap-lg">
        <div className="flex flex-col gap-md">
          <span className="font-display-lg text-headline-md font-extrabold text-primary">Onea</span>
          <p className="font-body-md text-body-md text-on-surface-variant">© 2026 Onea Africa. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-xl">
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-onea-violet transition-colors">Fibre &amp; WiFi</a>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-onea-violet transition-colors">IT Infrastructure</a>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-onea-violet transition-colors">Privacy Policy</a>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-onea-violet transition-colors">Terms of Service</a>
        </div>
        <div className="flex gap-md">
          <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">social_leaderboard</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">alternate_email</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
