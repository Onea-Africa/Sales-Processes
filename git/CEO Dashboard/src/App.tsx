import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TalkToUsModal from './components/TalkToUsModal';
import WhatsAppButton from './components/WhatsAppButton';
import CookieBanner from './components/CookieBanner';
import BackToTop from './components/BackToTop';
import LoadingScreen from './components/LoadingScreen';
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

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const open = () => setModalOpen(true);
  const close = () => setModalOpen(false);
  const location = useLocation();
  const isConnectivity = location.pathname === '/connectivity';

  return (
    <>
      <LoadingScreen />
      {!isConnectivity && <Navbar onTalkToUs={open} />}
      <Routes>
        <Route path="/" element={<HomePage onTalkToUs={open} />} />
        <Route path="/connectivity" element={<ConnectivityPage onTalkToUs={open} />} />
        <Route path="/case-studies" element={<CaseStudiesPage onTalkToUs={open} />} />
        <Route path="/case-studies/:id" element={<CaseStudyPage onTalkToUs={open} />} />
        <Route path="/pricing" element={<PricingPage onTalkToUs={open} />} />
        <Route path="/team" element={<TeamPage onTalkToUs={open} />} />
        <Route path="/careers" element={<CareersPage onTalkToUs={open} />} />
        <Route path="/blog" element={<BlogPage onTalkToUs={open} />} />
        <Route path="/blog/:id" element={<BlogPostPage onTalkToUs={open} />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!isConnectivity && <Footer />}
      {modalOpen && <TalkToUsModal onClose={close} />}
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
