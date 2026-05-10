import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TalkToUsModal from './components/TalkToUsModal';
import HomePage from './pages/HomePage';
import ConnectivityPage from './pages/ConnectivityPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import CaseStudyPage from './pages/CaseStudyPage';

function AppContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const open = () => setModalOpen(true);
  const close = () => setModalOpen(false);
  const location = useLocation();
  const isConnectivity = location.pathname === '/connectivity';

  return (
    <>
      {!isConnectivity && <Navbar onTalkToUs={open} />}
      <Routes>
        <Route path="/" element={<HomePage onTalkToUs={open} />} />
        <Route path="/connectivity" element={<ConnectivityPage onTalkToUs={open} />} />
        <Route path="/case-studies" element={<CaseStudiesPage onTalkToUs={open} />} />
        <Route path="/case-studies/:id" element={<CaseStudyPage onTalkToUs={open} />} />
      </Routes>
      {!isConnectivity && <Footer />}
      {modalOpen && <TalkToUsModal onClose={close} />}
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
