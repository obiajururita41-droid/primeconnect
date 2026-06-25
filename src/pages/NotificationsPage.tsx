import { useState, useEffect } from 'react';
import BottomNav from '../components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, CheckCircle, Wallet, Gift, Users, Zap, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Notification {
  id: string;
  type: 'transaction' | 'system' | 'promotion' | 'referral';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'system',      title: 'Welcome to PrimeConnect!',       message: 'Your account has been verified successfully. Start transacting today.', read: false, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '2', type: 'promotion',   title: 'Earn 10% on every referral',     message: 'Invite friends and earn lifetime commission on all their transactions.', read: false, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', type: 'system',      title: 'BVN Verification Available',     message: 'Verify your BVN to get a dedicated bank account for easy funding.',     read: true,  created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '4', type: 'promotion',   title: 'New Service: Airtime to Cash',   message: 'Convert your airtime to cash instantly. Available on all networks.',    read: true,  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const typeConfig = {
  transaction: { icon: <Wallet className="w-4 h-4" />,   bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'Transaction' },
  system:      { icon: <Info className="w-4 h-4" />,      bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'System' },
  promotion:   { icon: <Zap className="w-4 h-4" />,       bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Promo' },
  referral:    { icon: <Users className="w-4 h-4" />,     bg: 'bg-pink-100',   text: 'text-pink-600',   label: 'Referral' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'transaction' | 'system' | 'promotion'>('all');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const filtered = tab === 'all' ? notifications : notifications.filter(n => n.type === tab);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="bg-white px-4 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Notifications</h1>
              {unread > 0 && <p className="text-xs text-gray-400">{unread} unread</p>}
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {(['all', 'transaction', 'system', 'promotion'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {t === 'all' ? `All (${notifications.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="px-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">No notifications</p>
              <p className="text-gray-300 text-xs mt-1">You're all caught up!</p>
            </div>
          ) : filtered.map(notif => {
            const cfg = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`bg-white rounded-2xl p-4 flex items-start gap-3 border transition-all ${
                  !notif.read ? 'border-blue-100 shadow-sm' : 'border-gray-50'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.text}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-tight ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                      className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-gray-300">{timeAgo(notif.created_at)}</span>
                    {!notif.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-auto" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
          <BottomNav />
    </div>
  );
}
