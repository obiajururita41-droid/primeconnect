import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const HIDE_CHROME_ROUTES = [
  '/dashboard', '/transactions', '/withdrawal', '/referral',
  '/settings', '/transfer', '/notifications', '/scan',
  '/onboarding', '/send', '/ai-hub', '/payment',
  '/login', '/register', '/forgot-password', '/reset-password',
  '/services', '/admin',
];

// Detect Capacitor/mobile app environment
const isCapacitor = () => {
  return (
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && 
     (navigator.userAgent.includes('Android') || 
      navigator.userAgent.includes('wv') ||
      window.innerWidth <= 480))
  );
};

export function SiteNavbar() {
  const location = useLocation();
  if (isCapacitor()) return null;
  if (HIDE_CHROME_ROUTES.some(route => location.pathname.startsWith(route))) return null;
  return <Navbar />;
}

export function SiteFooter() {
  const location = useLocation();
  if (isCapacitor()) return null;
  if (HIDE_CHROME_ROUTES.some(route => location.pathname.startsWith(route))) return null;
  return <Footer />;
}
