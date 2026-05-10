import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center px-xl">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-xl">
          <span className="material-symbols-outlined text-primary text-[48px]">search_off</span>
        </div>
        <h1 className="font-display-lg text-display-lg-mobile text-text-primary mb-md">404</h1>
        <p className="font-headline-md text-headline-md text-text-primary mb-md">Page not found</p>
        <p className="text-on-surface-variant text-body-lg mb-xxl">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-md justify-center">
          <Link to="/" className="bg-primary text-on-primary px-xl py-md rounded-full font-bold hover:opacity-90 transition-all text-center">
            Back to Home
          </Link>
          <Link to="/case-studies" className="border-2 border-primary text-primary px-xl py-md rounded-full font-bold hover:bg-primary/5 transition-all text-center">
            View Case Studies
          </Link>
        </div>
      </div>
    </div>
  );
}
