import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const HIDE_CHROME_ROUTES = ['/dashboard', '/transactions', '/withdraw', '/referral', '/settings', '/transfer', '/notifications', '/scan'];

export function SiteNavbar() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  if (HIDE_CHROME_ROUTES.some(route => location.pathname.startsWith(route))) return null;
  return <Navbar />;
}

export function SiteFooter() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  if (HIDE_CHROME_ROUTES.some(route => location.pathname.startsWith(route))) return null;
  return <Footer />;
}
