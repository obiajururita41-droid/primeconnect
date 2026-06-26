import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Check if running as Capacitor app - store in sessionStorage to persist
const checkIsApp = () => {
  try {
    // Check multiple indicators
    if (window.location.protocol === 'capacitor:') return true;
    if ((window as any).Capacitor) return true;
    if (navigator.userAgent.includes('wv')) return true;
    if (window.location.hostname === 'localhost' && navigator.userAgent.includes('Android')) return true;
    // Store result once detected
    const stored = sessionStorage.getItem('is_app');
    if (stored === 'true') return true;
    return false;
  } catch {
    return false;
  }
};

// Set on load
if (checkIsApp()) {
  sessionStorage.setItem('is_app', 'true');
}

const IS_APP = checkIsApp();

const WEBSITE_ONLY_ROUTES = ['/', '/about', '/faq', '/contact'];

export function SiteNavbar() {
  const location = useLocation();
  if (IS_APP) return null;
  if (!WEBSITE_ONLY_ROUTES.includes(location.pathname)) return null;
  return <Navbar />;
}

export function SiteFooter() {
  const location = useLocation();
  if (IS_APP) return null;
  if (!WEBSITE_ONLY_ROUTES.includes(location.pathname)) return null;
  return <Footer />;
}
