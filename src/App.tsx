import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import VirtualSMSPage from './pages/services/VirtualSMSPage';
import AirtimePage from './pages/services/AirtimePage';
import DataPage from './pages/services/DataPage';
import GiftCardPage from './pages/services/GiftCardPage';
import BulkSMSPage from './pages/services/BulkSMSPage';
import AirtimeToCashPage from './pages/services/AirtimeToCashPage';
import BettingPage from './pages/services/BettingPage';
import AIHub from './pages/AIHub';
import TransactionHistory from './pages/TransactionHistory';
import ReferralPage from './pages/ReferralPage';
import WithdrawalPage from './pages/WithdrawalPage';
import Settings from './pages/Settings';
import NotificationsPage from './pages/NotificationsPage';
import ScanPayPage from './pages/ScanPayPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SiteNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="/services/gift-card" element={<ProtectedRoute><GiftCardPage /></ProtectedRoute>} />
          <Route path="/services/bulk-sms" element={<ProtectedRoute><BulkSMSPage /></ProtectedRoute>} />
          <Route path="/services/airtime-to-cash" element={<ProtectedRoute><AirtimeToCashPage /></ProtectedRoute>} />
          <Route path="/services/betting" element={<ProtectedRoute><BettingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/ai-hub" element={<ProtectedRoute><AIHub /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          <Route path="/withdrawal" element={<ProtectedRoute><WithdrawalPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanPayPage /></ProtectedRoute>} />
          <Route path="/payment/verify" element={<ProtectedRoute><PaymentVerifyPage /></ProtectedRoute>} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
        <SiteFooter />
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
