import { useNavigate, useLocation } from 'react-router-dom';
import { History, QrCode } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-40">
      <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-0.5 flex-1">
        <svg className={`w-6 h-6 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span className={`text-[10px] font-semibold ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-400'}`}>Home</span>
      </button>
      <button onClick={() => navigate('/transactions')} className="flex flex-col items-center gap-0.5 flex-1">
        <History className={`w-6 h-6 ${isActive('/transactions') ? 'text-blue-600' : 'text-gray-400'}`} />
        <span className={`text-[10px] ${isActive('/transactions') ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Transactions</span>
      </button>
      <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-0.5 flex-1 -mt-5">
        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <span className="text-[10px] text-gray-400 mt-1">Scan/Pay</span>
      </button>
      <button onClick={() => navigate('/services')} className="flex flex-col items-center gap-0.5 flex-1">
        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-sm ${isActive('/services') ? 'bg-blue-600' : 'bg-gray-400'}`} />
          ))}
        </div>
        <span className={`text-[10px] ${isActive('/services') ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Services</span>
      </button>
      <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-0.5 flex-1">
        <svg className={`w-6 h-6 ${isActive('/settings') ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        <span className={`text-[10px] ${isActive('/settings') ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Account</span>
      </button>
    </div>
  );
};

export default BottomNav;
