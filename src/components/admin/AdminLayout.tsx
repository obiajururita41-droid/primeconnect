import { useState } from 'react';
import {
  LayoutDashboard, Users, ArrowUpRight, Gift, Wallet, ArrowDownToLine,
  Share2, Sparkles, GraduationCap, Briefcase, BarChart3, FileText,
  Megaphone, Settings, FileClock, Search, Bell, Moon, ChevronDown, Menu, X, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  pendingGiftCards?: number;
}

export default function AdminLayout({ children, activeTab, onTabChange, pendingGiftCards = 0 }: AdminLayoutProps) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const managementItems = [
    { key: 'overview' as const,     label: 'Dashboard',    icon: LayoutDashboard, active: true },
    { key: 'users' as const,        label: 'Users',        icon: Users, active: true },
    { key: 'transactions' as const, label: 'Transactions', icon: ArrowUpRight, active: true },
    { key: 'wallets' as const,      label: 'Wallets',      icon: Wallet, active: true },
    { key: 'giftcards' as const,    label: 'Gift Cards',   icon: Gift, badge: pendingGiftCards, active: true },
    { key: 'withdrawals',           label: 'Withdrawals',  icon: ArrowDownToLine, active: true },
    { key: 'referrals',             label: 'Referrals',    icon: Share2, active: true },
    { key: 'aihub',                 label: 'AI Hub',       icon: Sparkles, active: true },
    { key: 'education',             label: 'Education (Pins)', icon: GraduationCap, active: false },
    { key: 'businesstools',         label: 'Business Tools', icon: Briefcase, active: false },
  ];

  const analyticsItems = [
    { key: 'analytics', label: 'Analytics', icon: BarChart3, active: false },
    { key: 'reports',   label: 'Reports',   icon: FileText, active: false },
  ];

  const communicationItems = [
    { key: 'notifications', label: 'Notifications', icon: Bell, active: false },
    { key: 'broadcasts',    label: 'Broadcasts',    icon: Megaphone, active: false },
  ];

  const settingsItems = [
    { key: 'settings',   label: 'Settings',    icon: Settings, active: true },
    { key: 'systemlogs', label: 'System Logs', icon: FileClock, active: false },
  ];

  const renderItem = (item: any, closeOnClick = false) => {
    const Icon = item.icon;
    const isActiveTab = item.active && activeTab === item.key;
    if (!item.active) {
      return (
        <div
          key={item.key}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed opacity-60"
        >
          <Icon className="w-4 h-4" />
          <span className="flex-1 text-left">{item.label}</span>
          <span className="text-[10px] uppercase tracking-wide bg-gray-700 text-gray-300 rounded-full px-1.5 py-0.5">Soon</span>
        </div>
      );
    }
    return (
      <button
        key={item.key}
        onClick={() => { if (item.key === 'aihub') { navigate('/ai-hub'); } else { onTabChange(item.key); } if (closeOnClick) setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActiveTab
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.01]'
            : 'hover:bg-gray-800/80 text-gray-400 hover:text-gray-100'
        }`}
      >
        <div className={`shrink-0 ${isActiveTab ? 'text-white' : 'text-gray-500'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left">{item.label}</span>
        {!!item.badge && item.badge > 0 && (
          <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${isActiveTab ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}`}>
            {item.badge}
          </span>
        )}
        {isActiveTab && <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
      </button>
    );
  };

  const renderNav = (closeOnClick = false) => (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</p>
      {managementItems.map((item) => renderItem(item, closeOnClick))}

      <p className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</p>
      {analyticsItems.map((item) => renderItem(item, closeOnClick))}

      <p className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Communication</p>
      {communicationItems.map((item) => renderItem(item, closeOnClick))}

      <p className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</p>
      {settingsItems.map((item) => renderItem(item, closeOnClick))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-900 text-gray-300 shrink-0 min-h-screen">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">PC</span>
          </div>
          <span className="text-white font-bold text-lg">
            Prime<span className="text-blue-400">Connect</span>
          </span>
        </div>
        {renderNav(false)}
        <div className="p-4 m-3 rounded-xl bg-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0) ?? 'A'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-gray-900 text-gray-300 min-h-screen flex flex-col">
            <div className="flex items-center justify-between px-5 py-5">
              <span className="text-white font-bold text-lg">
                Prime<span className="text-blue-400">Connect</span>
              </span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            {renderNav(true)}
          <div className="p-4 m-3 rounded-xl bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0) ?? 'A'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? 'Admin'}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent text-sm outline-none flex-1 min-w-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Bell className="w-4 h-4 text-gray-600" />
                {pendingGiftCards > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Moon className="w-4 h-4 text-gray-600" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">{profile?.full_name?.charAt(0) ?? 'A'}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{profile?.full_name ?? 'Admin'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
