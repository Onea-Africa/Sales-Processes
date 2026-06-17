import { useNavigate } from 'react-router-dom';
import TelkomPortal from '../components/telkom/TelkomPortal';

export default function TelkomApplicationPage() {
  const navigate = useNavigate();

  return <TelkomPortal onClose={() => navigate('/pricing')} />;
}
