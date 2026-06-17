import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import type { TalkToUsPrefill } from './components/TalkToUsModal';

// Core Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CookieBanner from './components/CookieBanner';
import BackToTop from './components/BackToTop';
import PageTransition from './components/motion/PageTransition';
import SEOManager from './components/SEOManager';
import TelkomApplicationPage from './pages/TelkomApplicationPage';

// Keep the landing page in the initial bundle; defer every secondary route.
import HomePage from './pages/HomePage';
const TalkToUsModal = lazy(() => import('./components/TalkToUsModal'));
const ConnectivityPage = lazy(() => import('./pages/ConnectivityPage'));
const CaseStudiesPage = lazy(() => import('./pages/CaseStudiesPage'));
const CaseStudyPage = lazy(() => import('./pages/CaseStudyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const LaunchPlatformPage = lazy(() => import('./pages/LaunchPlatformPage'));
const SupplierDirectoryPage = lazy(() => import('./pages/SupplierDirectoryPage'));
const ContentCenterPage = lazy(() => import('./pages/ContentCenterPage'));
const HardwareProcurementPage = lazy(() => import('./pages/HardwareProcurementPage'));
const ClientPortalPage = lazy(() => import('./pages/ClientPortalPage'));
const TelkomAssistedPage = lazy(() => import('./pages/TelkomAssistedPage'));
const TelkomSignaturePage = lazy(() => import('./pages/TelkomSignaturePage'));
const AppleDeviceProcurementPage = lazy(() => import('./pages/AppleDeviceProcurementPage'));
const SolutionsHub = lazy(() => import('./pages/solutions/SolutionsIndex'));
const CorporateMarketing = lazy(() => import('./pages/solutions/CorporateMarketing'));
const HomeNetworking = lazy(() => import('./pages/solutions/HomeNetworking'));
const LteEnterprise = lazy(() => import('./pages/solutions/LteEnterprise'));
const ManagedIT = lazy(() => import('./pages/solutions/ManagedIT'));
const OpenserveFibre = lazy(() => import('./pages/solutions/OpenserveFibre'));

function AppRoutes({ open }: { open: (prefill?: TalkToUsPrefill) => void }) {
  const location = useLocation();
  const isConnectivity = location.pathname === '/connectivity';

  return (
    <>
      {!isConnectivity && <Navbar onTalkToUs={open} />}
      <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><HomePage onTalkToUs={open} /></PageTransition>} />
            <Route path="/connectivity" element={<PageTransition><ConnectivityPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/solutions" element={<PageTransition><SolutionsHub /></PageTransition>} />
            <Route path="/solutions/corporate-digital-marketing" element={<PageTransition><CorporateMarketing onTalkToUs={open} /></PageTransition>} />
            <Route path="/solutions/home-wifi-networking" element={<PageTransition><HomeNetworking onTalkToUs={open} /></PageTransition>} />
            <Route path="/solutions/lte-enterprise-packages" element={<PageTransition><LteEnterprise onTalkToUs={open} /></PageTransition>} />
            <Route path="/solutions/managed-it-support" element={<PageTransition><ManagedIT onTalkToUs={open} /></PageTransition>} />
            <Route path="/solutions/openserve-business-fibre" element={<PageTransition><OpenserveFibre onTalkToUs={open} /></PageTransition>} />
            <Route path="/case-studies" element={<PageTransition><CaseStudiesPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/case-studies/:id" element={<PageTransition><CaseStudyPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/pricing" element={<PageTransition><PricingPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/apple-device-procurement" element={<PageTransition><AppleDeviceProcurementPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/telkom-application" element={<TelkomApplicationPage />} />
            <Route path="/telkom-sign/:token" element={<TelkomSignaturePage />} />
            <Route path="/team" element={<PageTransition><TeamPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/careers" element={<PageTransition><CareersPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/client-portal" element={<PageTransition><ClientPortalPage /></PageTransition>} />
            <Route path="/client-login" element={<Navigate to="/client-portal" replace />} />
            <Route path="/launch-platform" element={<PageTransition><LaunchPlatformPage /></PageTransition>} />
            <Route path="/launch-platform/suppliers" element={<PageTransition><SupplierDirectoryPage /></PageTransition>} />
            <Route path="/launch-platform/content" element={<PageTransition><ContentCenterPage /></PageTransition>} />
            <Route path="/launch-platform/hardware" element={<PageTransition><HardwareProcurementPage /></PageTransition>} />
            <Route path="/launch-platform/telkom-assisted" element={<TelkomAssistedPage />} />
            <Route path="/blog" element={<PageTransition><BlogPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/blog/:id" element={<PageTransition><BlogPostPage onTalkToUs={open} /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><TermsPage /></PageTransition>} />
            <Route path="/about" element={<Navigate to="/team" replace />} />
            <Route path="/contact" element={<Navigate to="/" replace />} />
            <Route path="/improve-how-you-present-your-brandblog" element={<Navigate to="/blog" replace />} />
            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      {!isConnectivity && <Footer />}
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function AnalyticsRouteTracker() {
  const location = useLocation();
  const initialPageView = useRef(true);

  useEffect(() => {
    if (initialPageView.current) {
      initialPageView.current = false;
      return;
    }

    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [talkPrefill, setTalkPrefill] = useState<TalkToUsPrefill | null>(null);
  const open = (prefill?: TalkToUsPrefill) => {
    setTalkPrefill(prefill || null);
    setModalOpen(true);
  };
  const close = () => {
    setModalOpen(false);
    setTalkPrefill(null);
  };

  return (
    <>
      <SEOManager />
      <AnalyticsRouteTracker />
      <ScrollToTop />
      <AppRoutes open={open} />
      <AnimatePresence>
        {modalOpen && (
          <Suspense fallback={null}>
            <TalkToUsModal onClose={close} prefill={talkPrefill} />
          </Suspense>
        )}
      </AnimatePresence>
      <WhatsAppButton />
      <BackToTop />
      <CookieBanner />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
