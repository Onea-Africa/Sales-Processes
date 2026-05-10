import { Link } from 'react-router-dom';

interface Props { onTalkToUs: () => void; }

export default function Navbar({ onTalkToUs }: Props) {
  return (
    <header className="bg-white/[0.94] backdrop-blur-md sticky top-0 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <nav className="flex justify-between items-center w-full px-xl py-md max-w-[1280px] mx-auto">
        <div className="flex items-center gap-md">
          <Link to="/">
            <img src="/Clean_Backround.png" alt="Onea Africa" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-xl">
          <Link to="/" className="font-display-lg text-label-md uppercase tracking-wider font-semibold text-primary border-b-2 border-primary pb-1">
            Connect
          </Link>
          <Link to="/case-studies" className="font-display-lg text-label-md uppercase tracking-wider font-semibold text-on-surface-variant hover:text-primary transition-colors">
            Communicate
          </Link>
          <a href="#" className="font-display-lg text-label-md uppercase tracking-wider font-semibold text-on-surface-variant hover:text-primary transition-colors">
            Converse
          </a>
          <Link to="/connectivity" className="font-display-lg text-label-md uppercase tracking-wider font-semibold text-on-surface-variant hover:text-primary transition-colors">
            Solutions
          </Link>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-sm hover:bg-primary/5 rounded-full transition-all duration-300">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </button>
          <button
            className="bg-onea-green text-on-primary px-lg py-sm rounded-full font-bold hover:scale-95 transition-transform duration-200"
            onClick={onTalkToUs}
          >
            Talk To Us
          </button>
        </div>
      </nav>
    </header>
  );
}
