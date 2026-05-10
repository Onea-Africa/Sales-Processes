import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TalkToUsModal from './components/TalkToUsModal';
import WhatsAppButton from './components/WhatsAppButton';
import CookieBanner from './components/CookieBanner';
import BackToTop from './components/BackToTop';
import LoadingScreen from './components/LoadingScreen';
import PageTransition from './components/motion/PageTransition';
import HomePage from './pages/HomePage';
import ConnectivityPage from './pages/ConnectivityPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import CaseStudyPage from './pages/CaseStudyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import PricingPage from './pages/PricingPage';
import TeamPage from './pages/TeamPage';
import CareersPage from './pages/CareersPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

function AppRoutes({ open }: { open: () => void }) {
  const location = useLocation();
  const isConnectivity = location.pathname === '/connectivity';

  return (
    <>
      {!isConnectivity && <Navbar onTalkToUs={open} />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"             element={<PageTransition><HomePage       onTalkToUs={open} /></PageTransition>} />
          <Route path="/connectivity" element={<PageTransition><ConnectivityPage onTalkToUs={open} /></PageTransition>} />
          <Route path="/case-studies" element={<PageTransition><CaseStudiesPage onTalkToUs={open} /></PageTransition>} />
          <Route path="/case-studies/:id" element={<PageTransition><CaseStudyPage onTalkToUs={open} /></PageTransition>} />
          <Route path="/pricing"      element={<PageTransition><PricingPage    onTalkToUs={open} /></PageTransition>} />
          <Route path="/team"         element={<PageTransition><TeamPage       onTalkToUs={open} /></PageTransition>} />
          <Route path="/careers"      element={<PageTransition><CareersPage    onTalkToUs={open} /></PageTransition>} />
          <Route path="/blog"         element={<PageTransition><BlogPage       onTalkToUs={open} /></PageTransition>} />
          <Route path="/blog/:id"     element={<PageTransition><BlogPostPage   onTalkToUs={open} /></PageTransition>} />
          <Route path="/privacy"      element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
          <Route path="/terms"        element={<PageTransition><TermsPage /></PageTransition>} />
          <Route path="*"             element={<PageTransition><NotFoundPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      {!isConnectivity && <Footer />}
    </>
  );
}

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const open  = () => setModalOpen(true);
  const close = () => setModalOpen(false);

  return (
    <>
      <LoadingScreen />
      <AppRoutes open={open} />
      <AnimatePresence>{modalOpen && <TalkToUsModal onClose={close} />}</AnimatePresence>
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
