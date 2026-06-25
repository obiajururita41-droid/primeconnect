import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import {
  Phone, Wifi, Tv, Zap, MessageSquare, Send, Users,
  TrendingUp, Package, CreditCard, QrCode, ArrowUpRight
} from 'lucide-react';

const services = [
  { icon: Phone,        label: 'Airtime',         desc: 'Buy airtime for all networks',         color: 'bg-blue-50 text-blue-600',    path: '/services/airtime' },
  { icon: Wifi,         label: 'Data',             desc: 'Affordable data plans',                color: 'bg-green-50 text-green-600',  path: '/services/data' },
  { icon: Tv,           label: 'Cable TV',         desc: 'DSTV, GOtv, Startimes',               color: 'bg-purple-50 text-purple-600',path: '/services/tv-subscription' },
  { icon: Zap,          label: 'Electricity',      desc: 'Pay electricity bills',                color: 'bg-yellow-50 text-yellow-600',path: '/services/electricity' },
  { icon: MessageSquare,label: 'Virtual SMS',      desc: 'Get virtual numbers for OTP',          color: 'bg-orange-50 text-orange-600',path: '/services/virtual-sms' },
  { icon: Send,         label: 'Bulk SMS',         desc: 'Send SMS to multiple numbers',         color: 'bg-indigo-50 text-indigo-600',path: '/services/bulk-sms' },
  { icon: TrendingUp,   label: 'Airtime to Cash',  desc: 'Convert airtime to cash',              color: 'bg-pink-50 text-pink-600',    path: '/services/airtime-to-cash' },
  { icon: CreditCard,   label: 'Bet Funding',      desc: 'Fund betting wallets instantly',       color: 'bg-red-50 text-red-600',      path: '/services/betting' },
  { icon: Package,      label: 'Import Calc',      desc: 'Calculate import duties',              color: 'bg-slate-50 text-slate-600',  path: '/services/import-calculator' },
  { icon: Users,        label: 'Refer & Earn',     desc: 'Earn by referring friends',            color: 'bg-emerald-50 text-emerald-600', path: '/referral' },
  { icon: ArrowUpRight, label: 'Withdraw',         desc: 'Withdraw to bank account',             color: 'bg-cyan-50 text-cyan-600',    path: '/withdrawal' },
  { icon: QrCode,       label: 'Scan & Pay',       desc: 'Scan QR code to pay',                 color: 'bg-violet-50 text-violet-600',path: '/scan' },
];

const Services = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto">
        <div className="px-4 pt-12 pb-6"
          style={{ background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)" }}>
          <h1 className="text-white font-black text-xl">All Services</h1>
          <p className="text-blue-200 text-sm mt-1">What would you like to do?</p>
        </div>
        <div className="px-4 pt-4">
          <div className="grid grid-cols-3 gap-3">
            {services.map((s) => (
              <button key={s.label} onClick={() => navigate(s.path)}
                className="flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 transition-transform">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-800 text-center leading-tight">{s.label}</span>
                <span className="text-[10px] text-gray-400 text-center mt-0.5 leading-tight">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Services;
