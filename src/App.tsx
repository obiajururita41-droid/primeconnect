import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SiteNavbar, SiteFooter } from './components/layout/SiteChrome';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Services from './pages/Services';
import AdminDashboard from './pages/AdminDashboard';
import ImportCalculatorPage from './pages/services/ImportCalculatorPage';
import VirtualSMSPage from './pages/services/VirtualSMSPage';
import AirtimePage from './pages/services/AirtimePage';
import DataPage from './pages/services/DataPage';
import BulkSMSPage from './pages/services/BulkSMSPage';
import AirtimeToCashPage from './pages/services/AirtimeToCashPage';
import BettingPage from './pages/services/BettingPage';
import SavingsPage from './pages/services/SavingsPage';
import TVSubscriptionPage from './pages/services/TVSubscriptionPage';
import ElectricityPage from './pages/services/ElectricityPage';
import AIHub from './pages/AIHub';
import TransactionHistory from './pages/TransactionHistory';
import ReferralPage from './pages/ReferralPage';
import WithdrawalPage from './pages/WithdrawalPage';
import Settings from './pages/Settings';
import NotificationsPage from './pages/NotificationsPage';
import ScanPayPage from './pages/ScanPayPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import SendMoneyPage from './pages/SendMoneyPage';
import Onboarding from './pages/Onboarding';

function Layout() {
  const location = useLocation();
  const appPaths = ['/dashboard', '/transactions', '/settings', '/notifications', '/scan', '/referral', '/withdrawal', '/send', '/ai-hub', '/services', '/admin', '/payment', '/login', '/register', '/forgot-password', '/reset-password'];
  const isAppPage = appPaths.some(p => location.pathname.startsWith(p));
  const hideChrome = location.pathname === '/onboarding' || isAppPage;

  return (
    <>
      {!hideChrome && {/* SiteNavbar hidden on mobile */}}
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={!localStorage.getItem('onboarding_done') ? <Onboarding /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/virtual-sms" element={<ProtectedRoute><VirtualSMSPage /></ProtectedRoute>} />
        <Route path="/services/airtime" element={<ProtectedRoute><AirtimePage /></ProtectedRoute>} />
        <Route path="/services/data" element={<ProtectedRoute><DataPage /></ProtectedRoute>} />
        <Route path="/services/bulk-sms" element={<ProtectedRoute><BulkSMSPage /></ProtectedRoute>} />
        <Route path="/services/airtime-to-cash" element={<ProtectedRoute><AirtimeToCashPage /></ProtectedRoute>} />
        <Route path="/services/betting" element={<ProtectedRoute><BettingPage /></ProtectedRoute>} />
        <Route path="/services/import-calculator" element={<ProtectedRoute><ImportCalculatorPage /></ProtectedRoute>} />
        <Route path="/services/savings" element={<ProtectedRoute><SavingsPage /></ProtectedRoute>} />
        <Route path="/services/tv-subscription" element={<ProtectedRoute><TVSubscriptionPage /></ProtectedRoute>} />
        <Route path="/services/electricity" element={<ProtectedRoute><ElectricityPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ai-hub" element={<ProtectedRoute><AIHub /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
        <Route path="/withdrawal" element={<ProtectedRoute><WithdrawalPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanPayPage /></ProtectedRoute>} />
        <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerifyPage /></ProtectedRoute>} />
        <Route path="/send" element={<ProtectedRoute><SendMoneyPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
      {!hideChrome && {/* SiteFooter hidden on mobile */}}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout />
      </HashRouter>
    </AuthProvider>
  );
}
export default App;
