import { useState, useEffect } from 'react';
import {
  User, Lock, Wallet, Bell, Share2, HelpCircle, Camera,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, Copy, CheckCircle2, Loader2,
  ChevronRight, LogOut, Settings as SettingsIcon,
  FileText, Users, Phone, Shield, ArrowLeft, History, MessageCircle, Star
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import TOTPSetup from '../components/TOTPSetup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type TabKey = 'profile' | 'security' | 'wallet' | 'notifications' | 'referral' | 'support';

const TABS: { key: TabKey; label: string; icon: any; desc: string; color: string }[] = [
  { key: 'profile',       label: 'Profile',          icon: User,       desc: 'Name, photo, phone',   color: 'bg-blue-500' },
  { key: 'security',      label: 'Security',         icon: Lock,       desc: 'PIN, password, 2FA',   color: 'bg-blue-700' },
  { key: 'wallet',        label: 'Wallet & Payment', icon: Wallet,     desc: 'Banks, cards, limits', color: 'bg-blue-600' },
  { key: 'notifications', label: 'Notifications',    icon: Bell,       desc: 'Alerts & preferences', color: 'bg-indigo-500' },
  { key: 'referral',      label: 'Referral',         icon: Share2,     desc: 'Earn commission',      color: 'bg-blue-800' },
  { key: 'support',       label: 'Support & Legal',  icon: HelpCircle, desc: 'Help, terms, privacy', color: 'bg-indigo-600' },
];

interface Toast { type: 'success' | 'error'; message: string; }

export default function Settings() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/'); };
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [toast, setToast] = useState<Toast | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => { if (user) fetchWallet(); }, [user]);

  async function fetchWallet() {
    const { data } = await supabase.from('wallets').select('balance')
      .eq('user_id', user?.id).eq('is_active', true).single();
    if (data) setWalletBalance(data.balance);
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const avatarInitials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const shortcuts = [
    { label: 'Transactions', icon: History,        color: 'bg-blue-600',   path: '/transactions' },
    { label: 'Orders',       icon: FileText,        color: 'bg-blue-700',   path: '/orders' },
    { label: 'Virtual No.',  icon: Phone,           color: 'bg-blue-500',   path: '/services/virtual-sms' },
    { label: 'Fund Wallet',  icon: Wallet,          color: 'bg-indigo-600', path: null },
    { label: 'Withdraw',     icon: ArrowLeft,       color: 'bg-blue-800',   path: '/withdrawal' },
    { label: 'Referral',     icon: Users,           color: 'bg-blue-600',   path: '/referral' },
    { label: 'Security',     icon: Lock,            color: 'bg-indigo-700', tab: 'security' },
    { label: 'Alerts',       icon: Bell,            color: 'bg-blue-700',   tab: 'notifications' },
  ];

  if (activeTab !== 'profile') {
    const tabInfo = TABS.find(t => t.key === activeTab);
    const TabIcon = tabInfo?.icon ?? User;
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="px-4 pt-12 pb-5" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}>
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={() => setActiveTab('profile')}
              className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center active:bg-white/30 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tabInfo?.color}`}>
                <TabIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-base leading-tight">{tabInfo?.label}</h1>
                <p className="text-blue-200 text-xs">{tabInfo?.desc}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 pt-4 pb-6">
          {activeTab === 'security'      && <SecurityTab user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />}
          {activeTab === 'wallet'        && <WalletTab user={user} showToast={showToast} />}
          {activeTab === 'notifications' && <NotificationsTab user={user} showToast={showToast} />}
          {activeTab === 'referral'      && <ReferralTab profile={profile} />}
          {activeTab === 'support'       && <SupportTab />}
        </div>
        <BottomNav />
        <ToastBar toast={toast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative overflow-hidden px-4 pt-12 pb-16"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -left-4 bottom-0 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute right-12 bottom-8 w-16 h-16 rounded-full bg-white/5" />
        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">My Account</p>
              <h1 className="text-white font-black text-2xl leading-tight">Profile</h1>
            </div>
            {profile?.is_verified && (
              <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-green-300 text-xs font-bold">Verified</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl" style={{ width: 72, height: 72 }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl"
                      style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>{avatarInitials}</div>}
              </div>
              <button onClick={() => setActiveTab('profile')}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-black text-xl leading-tight truncate">{profile?.full_name ?? 'User'}</h2>
              <p className="text-blue-200 text-sm mt-0.5 truncate">{user?.email}</p>
              <p className="text-blue-300/70 text-xs mt-1">@{user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label: 'Wallet',    value: '₦' + walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 0 }), icon: '💰' },
              { label: 'Referrals', value: String(profile?.referral_count ?? 0), icon: '👥' },
              { label: 'Orders',    value: String((profile as any)?.order_count ?? 0), icon: '📦' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-2 py-3 text-center border border-white/10">
                <p className="text-base mb-0.5">{stat.icon}</p>
                <p className="text-white font-black text-base leading-none">{stat.value}</p>
                <p className="text-blue-200 text-[11px] mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-3">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.label}
                  onClick={() => { if ((s as any).path) navigate((s as any).path); else if ((s as any).tab) setActiveTab((s as any).tab as TabKey); }}
                  className="flex flex-col items-center gap-2 active:scale-90 transition-all duration-150">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-500 text-center font-semibold leading-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 pt-4 pb-1">
            <h3 className="font-black text-gray-900 text-sm">Settings</h3>
          </div>
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-blue-50/50 transition-colors ${i < TABS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-black text-gray-900">{tab.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{tab.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <div className="flex justify-around">
            {[
              { icon: '🔒', label: 'Secure',   sub: 'Bank-grade' },
              { icon: '⚡', label: 'Instant',  sub: 'Real-time' },
              { icon: '🇳🇬', label: 'Nigerian', sub: 'Proudly local' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl">{b.icon}</span>
                <p className="text-xs font-black text-gray-800">{b.label}</p>
                <p className="text-[9px] text-gray-400">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-black text-sm active:scale-95 transition-all">
          <LogOut className="w-4 h-4" />
          Log Out of Account
        </button>
        <p className="text-center text-[11px] text-gray-400 pb-2">PrimeConnect v1.0 · Made with ❤️ in Nigeria</p>
      </div>
      <BottomNav />
      <ToastBar toast={toast} />
    </div>
  );
}

function ToastBar({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {toast.message}
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
      <h2 className="text-base font-black text-gray-900 mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  );
}

function TransferPINSection({ user, showToast }: any) {
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { checkPin(); }, [user]);
  const checkPin = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('transfer_pin').eq('id', user.id).single();
    setHasPin(!!data?.transfer_pin);
  };
  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) { showToast('error', 'PIN must be exactly 4 digits'); return; }
    if (pin !== confirmPin) { showToast('error', 'PINs do not match'); return; }
    if (hasPin && !currentPin) { showToast('error', 'Enter your current PIN to change it'); return; }
    setSaving(true);
    try {
      if (hasPin) {
        const { data } = await supabase.from('profiles').select('transfer_pin').eq('id', user.id).single();
        if (data?.transfer_pin !== currentPin) { showToast('error', 'Current PIN is incorrect'); setSaving(false); return; }
      }
      const { error } = await supabase.from('profiles').update({ transfer_pin: pin }).eq('id', user.id);
      if (error) throw error;
      setPin(''); setConfirmPin(''); setCurrentPin('');
      setHasPin(true);
      showToast('success', hasPin ? 'Transfer PIN updated!' : 'Transfer PIN set successfully!');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to set PIN');
    } finally { setSaving(false); }
  };
  return (
    <Card title="Transfer PIN" description="Set a 4-digit PIN to authorize withdrawals and transfers">
      <div className="space-y-4">
        {hasPin && (
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Current PIN</label>
            <input type="password" maxLength={4} value={currentPin}
              onChange={e => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              placeholder="Enter current PIN" />
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{hasPin ? 'New PIN' : 'Set PIN'}</label>
          <input type="password" maxLength={4} value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            placeholder="Enter 4-digit PIN" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm PIN</label>
          <input type="password" maxLength={4} value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            placeholder="Confirm PIN" />
        </div>
        <button onClick={handleSetPin} disabled={saving}
          className="w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-sm font-black py-4 rounded-xl active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {hasPin ? 'Update PIN' : 'Set PIN'}
        </button>
      </div>
    </Card>
  );
}

function SecurityTab({ user, profile, refreshProfile, showToast }: any) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) { showToast('error', 'Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { showToast('error', 'Passwords do not match'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword(''); setConfirmPassword('');
      showToast('success', 'Password changed successfully');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to change password');
    } finally { setSaving(false); }
  };
  return (
    <div>
      <TransferPINSection user={user} showToast={showToast} />
      <Card title="Change Password" description="Use a strong password you don't use elsewhere">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Min. 8 characters" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              placeholder="Repeat new password" />
          </div>
          <button onClick={handleChangePassword} disabled={saving}
            className="w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-sm font-black py-4 rounded-xl active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </div>
      </Card>
      <TOTPSetup user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />
    </div>
  );
}

function WalletTab({ user, showToast }: any) {
  return (
    <Card title="Wallet & Payment" description="Manage your payment methods and bank accounts">
      <p className="text-sm text-gray-400 text-center py-6">Payment settings coming soon.</p>
    </Card>
  );
}

function NotificationsTab({ user, showToast }: any) {
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true });
  const [saving, setSaving] = useState(false);
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); showToast('success', 'Preferences saved'); }, 800);
  };
  return (
    <Card title="Notification Preferences" description="Choose how you want to receive alerts">
      <div className="space-y-1">
        {(Object.keys(prefs) as (keyof typeof prefs)[]).map(key => (
          <div key={key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-black text-gray-900">{key === 'sms' ? 'SMS' : key.charAt(0).toUpperCase() + key.slice(1)} Notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {key === 'email' ? 'Transaction receipts & updates' : key === 'sms' ? 'OTP & security alerts' : 'App push notifications'}
              </p>
            </div>
            <button onClick={() => toggle(key)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${prefs[key] ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${prefs[key] ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
        <button onClick={handleSave} disabled={saving}
          className="mt-4 w-full flex items-center justify-center gap-2 text-white text-sm font-black py-4 rounded-xl active:scale-95 transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Preferences
        </button>
      </div>
    </Card>
  );
}

function ReferralTab({ profile }: any) {
  const [copied, setCopied] = useState(false);
  const code = profile?.referral_code ?? '—';
  const copyCode = () => {
    if (code === '—') return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-3">
      <div className="rounded-3xl p-6 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative">
          <div className="text-4xl mb-3">🎁</div>
          <h2 className="text-white font-black text-xl mb-1">Refer & Earn</h2>
          <p className="text-blue-200 text-sm mb-5">Earn 10% commission on every transaction — for life!</p>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
            <p className="text-blue-200 text-xs mb-2 uppercase tracking-widest font-bold">Your Referral Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-white font-black text-2xl tracking-widest">{code}</span>
              <button onClick={copyCode} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Referrals', value: profile?.referral_count ?? 0, icon: '👥' },
          { label: 'Total Earnings',  value: '₦' + Number(profile?.referral_earnings ?? 0).toLocaleString(), icon: '💰' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="font-black text-gray-900 text-lg">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <Card title="How it works">
        {[
          { step: '1', text: 'Share your unique referral code with friends' },
          { step: '2', text: 'They sign up and make their first transaction' },
          { step: '3', text: 'You earn 10% commission on every transaction forever!' },
        ].map(item => (
          <div key={item.step} className="flex items-start gap-3 mb-4 last:mb-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>{item.step}</div>
            <p className="text-sm text-gray-600 pt-1.5 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SupportTab() {
  const links = [
    { label: 'Help Center',      icon: HelpCircle,    href: '#', color: 'bg-blue-500' },
    { label: 'Contact Support',  icon: MessageCircle, href: '#', color: 'bg-blue-600' },
    { label: 'Terms of Service', icon: FileText,      href: '#', color: 'bg-blue-700' },
    { label: 'Privacy Policy',   icon: Shield,        href: '#', color: 'bg-indigo-600' },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {links.map((link, i) => {
          const Icon = link.icon;
          return (
            <a key={link.label} href={link.href}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-blue-50/50 transition-colors ${i < links.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${link.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="flex-1 text-sm font-black text-gray-900">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </a>
          );
        })}
      </div>
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
        <p className="text-sm font-black text-blue-700 mb-1">Need urgent help?</p>
        <p className="text-xs text-blue-500 mt-1">WhatsApp: +234 800 000 0000</p>
        <p className="text-xs text-blue-500">Email: support@primeconnect.ng</p>
      </div>
    </div>
  );
}
