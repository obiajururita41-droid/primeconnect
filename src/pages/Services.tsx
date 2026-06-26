import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import {
  Phone, Wifi, Tv, Zap, MessageSquare, Send, Users,
  TrendingUp, Package, CreditCard, QrCode, ArrowUpRight, Search
} from 'lucide-react';

const services = [
  { icon: Phone,         label: 'Airtime',        desc: 'Buy airtime for all networks',    path: '/services/airtime',          category: 'Bills' },
  { icon: Wifi,          label: 'Data',            desc: 'Affordable data plans',           path: '/services/data',             category: 'Bills' },
  { icon: Tv,            label: 'Cable TV',        desc: 'DSTV, GOtv, Startimes',          path: '/services/tv-subscription',  category: 'Bills' },
  { icon: Zap,           label: 'Electricity',     desc: 'Pay electricity bills',           path: '/services/electricity',      category: 'Bills' },
  { icon: MessageSquare, label: 'Virtual SMS',     desc: 'Get virtual numbers for OTP',    path: '/services/virtual-sms',      category: 'Tools' },
  { icon: Send,          label: 'Bulk SMS',        desc: 'Send SMS to multiple numbers',   path: '/services/bulk-sms',         category: 'Tools' },
  { icon: TrendingUp,    label: 'Airtime to Cash', desc: 'Convert airtime to cash',        path: '/services/airtime-to-cash',  category: 'Finance' },
  { icon: CreditCard,    label: 'Bet Funding',     desc: 'Fund betting wallets instantly', path: '/services/betting',          category: 'Finance' },
  { icon: Package,       label: 'Import Calc',     desc: 'Calculate import duties',        path: '/services/import-calculator',category: 'Tools' },
  { icon: Users,         label: 'Refer & Earn',    desc: 'Earn by referring friends',      path: '/referral',                  category: 'Finance' },
  { icon: ArrowUpRight,  label: 'Withdraw',        desc: 'Withdraw to bank account',       path: '/withdrawal',                category: 'Finance' },
  { icon: QrCode,        label: 'Scan & Pay',      desc: 'Scan QR code to pay',            path: '/scan',                     category: 'Tools' },
];

const categories = ['All', 'Bills', 'Finance', 'Tools'];

const Services = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = services.filter((s) => {
    const matchSearch = s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div
          className="px-4 pt-12 pb-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #0f2070 0%, #1a3aad 40%, #2254e8 100%)' }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -left-6 bottom-0 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative">
            <h1 className="text-white font-black text-xl">All Services</h1>
            <p className="text-blue-200 text-sm mt-0.5">What would you like to do?</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 -mt-5 mb-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex items-center gap-3 px-4 py-3.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="flex-1 text-sm text-gray-700 font-medium placeholder-gray-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ' +
                  (activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-100')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-gray-700 text-sm font-bold mb-1">No services found</p>
              <p className="text-gray-400 text-xs">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((s) => (
                <button
                  key={s.label}
                  onClick={() => navigate(s.path)}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  className="flex flex-col items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-95 active:bg-blue-50 transition-all duration-150"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 text-blue-600">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 text-center leading-tight mb-0.5">{s.label}</span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  );
};

export default Services;
