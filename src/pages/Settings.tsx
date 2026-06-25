import { useState, useEffect } from 'react';
import {
  User, Lock, Wallet, Bell, Share2, HelpCircle, Camera,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, Copy, CheckCircle2, Loader2,
  ChevronRight, History, CreditCard, LogOut, Settings as SettingsIcon,
  FileText, Users, Phone
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import TOTPSetup from '../components/TOTPSetup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type TabKey = 'profile' | 'security' | 'wallet' | 'notifications' | 'referral' | 'support';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'wallet', label: 'Wallet & Payment', icon: Wallet },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'referral', label: 'Referral', icon: Share2 },
  { key: 'support', label: 'Support & Legal', icon: HelpCircle },
];

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function Settings() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/"); };
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const avatarInitials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';
  const firstName = profile?.full_name?.split(' ')?.[0] ?? 'User';

  const shortcuts = [
    { label: 'Transaction\nHistory', icon: History,   color: 'bg-blue-600',   path: '/transactions' },
    { label: 'Order\nHistory',       icon: FileText,  color: 'bg-indigo-600', path: '/orders' },
    { label: 'Virtual\nNumbers',     icon: Phone,     color: 'bg-purple-600', path: '/services/virtual-sms' },
    { label: 'Fund\nWallet',         icon: Wallet,    color: 'bg-emerald-500',path: null },
    { label: 'Withdraw\nHistory',    icon: ChevronRight, color: 'bg-orange-500', path: '/withdrawal' },
    { label: 'Referral &\nEarn',     icon: Users,     color: 'bg-pink-500',   path: '/referral' },
    { label: 'Security\nSettings',   icon: Lock,      color: 'bg-slate-600',  tab: 'security' },
    { label: 'Notifications',         icon: Bell,      color: 'bg-yellow-500', tab: 'notifications' },
  ];

  if (activeTab !== 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="px-4 pt-10 pb-6" style={{background:'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)'}}>
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white rotate-180" />
            </button>
            <h1 className="text-white font-black text-lg">
              {TABS.find(t => t.key === activeTab)?.label}
            </h1>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 -mt-2 pb-6">
          
          {activeTab === 'security' && <SecurityTab user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />}
          {activeTab === 'wallet' && <WalletTab user={user} showToast={showToast} />}
          {activeTab === 'notifications' && <NotificationsTab user={user} showToast={showToast} />}
          {activeTab === 'referral' && <ReferralTab profile={profile} />}
          {activeTab === 'support' && <SupportTab />}
        </div>
        <BottomNav />
        {toast && (
          <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header */}
      <div className="px-4 pt-10 pb-20 relative overflow-hidden" style={{background:'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)'}}>
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
        <div className="absolute -left-6 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white font-black text-xl">My Account</h1>
            <button onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* Avatar + Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-black text-2xl overflow-hidden border-4 border-white/20 shadow-xl">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  : avatarInitials}
              </div>
              <button onClick={() => setActiveTab('profile')}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-black text-lg leading-tight">{profile?.full_name ?? 'User'}</h2>
              <p className="text-blue-200 text-sm">@{user?.email?.split('@')[0]}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-300 text-xs font-bold">Verified Account</span>
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Wallet', value: '₦' + Number((profile as any)?.wallet_balance ?? 0).toLocaleString('en-NG', {minimumFractionDigits:0}) },
              { label: 'Referrals', value: String(profile?.referral_count ?? 0) },
              { label: 'Orders', value: String((profile as any)?.order_count ?? 0) },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl px-3 py-3 text-center">
                <p className="text-white font-black text-base">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
        {/* Account Shortcuts */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 text-base mb-4">Account Shortcuts</h3>
          <div className="grid grid-cols-4 gap-3">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.label}
                  onClick={() => { if (s.path) navigate(s.path); else if (s.tab) setActiveTab(s.tab as TabKey); }}
                  className="flex flex-col items-center gap-2 active:scale-90 transition-all">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-600 text-center font-semibold leading-tight whitespace-pre-line">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < TABS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <span className="flex-1 text-sm font-bold text-gray-900 text-left">{tab.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-black text-sm active:scale-95 transition-all">
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <BottomNav />

      {toast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared Card wrapper ---------------- */
function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  );
}

/* ---------------- Profile Tab ---------------- */
function ProfileTab({ user, profile, refreshProfile, showToast }: any) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
    setAvatarUrl(profile?.avatar_url ?? '');
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshProfile?.();
      showToast('success', 'Profile picture updated');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      showToast('error', 'Full name is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          email: user.email,
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await refreshProfile?.();
      showToast('success', 'Profile updated successfully');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Profile Information" description="Update your personal details and profile picture">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-blue-700 transition-colors">
            {uploading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{fullName || 'Your Name'}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="08012345678"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition-all" style={{background:'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow:'0 4px 15px rgba(37,99,235,0.4)'}}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </Card>
  );
}


/* ---------------- Transfer PIN Tab ---------------- */
function TransferPINSection({ user, showToast }: any) {
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkPin();
  }, [user]);

  const checkPin = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('transfer_pin')
      .eq('id', user.id)
      .single();
    setHasPin(!!data?.transfer_pin);
  };

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      showToast('error', 'PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      showToast('error', 'PINs do not match');
      return;
    }
    if (hasPin && !currentPin) {
      showToast('error', 'Enter your current PIN to change it');
      return;
    }
    setSaving(true);
    try {
      if (hasPin) {
        const { data } = await supabase
          .from('profiles')
          .select('transfer_pin')
          .eq('id', user.id)
          .single();
        if (data?.transfer_pin !== currentPin) {
          showToast('error', 'Current PIN is incorrect');
          setSaving(false);
          return;
        }
      }
      const { error } = await supabase
        .from('profiles')
        .update({ transfer_pin: pin })
        .eq('id', user.id);
      if (error) throw error;
      setPin(''); setConfirmPin(''); setCurrentPin('');
      setHasPin(true);
      showToast('success', hasPin ? 'Transfer PIN updated!' : 'Transfer PIN set successfully!');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to set PIN');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Transfer PIN" description="Set a 4-digit PIN to authorize withdrawals and transfers">
      <div className="space-y-4 max-w-md">
        {hasPin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current PIN</label>
            <input
              type="password"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter current PIN"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{hasPin ? 'New PIN' : 'Set PIN'}</label>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter 4-digit PIN"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm PIN</label>
          <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm 4-digit PIN"
          />
        </div>
      </div>
      <button
        onClick={handleSetPin}
        disabled={saving}
        className="mt-6 w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition-all" style={{background:'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow:'0 4px 15px rgba(37,99,235,0.4)'}}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
        {hasPin ? 'Update PIN' : 'Set Transfer PIN'}
      </button>
    </Card>
  );
}

/* ---------------- Security Tab ---------------- */
function SecurityTab({ user, profile, refreshProfile, showToast }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [user]);

  const fetchActivity = async () => {
    if (!user) return;
    setLoadingActivity(true);
    const { data } = await supabase
      .from('security_activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setActivity(data ?? []);
    setLoadingActivity(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      // Re-authenticate with current password first
      if (user?.email && currentPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (signInError) {
          showToast('error', 'Current password is incorrect');
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      await supabase.from('security_activity_log').insert({
        user_id: user.id,
        event_type: 'password_change',
        user_agent: navigator.userAgent,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', 'Password updated successfully');
      fetchActivity();
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TransferPINSection user={user} showToast={showToast} />
      <Card title="Change Password" description="Update your password to keep your account secure">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="At least 6 characters"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Re-enter new password"
            />
          </div>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={saving}
          className="mt-6 w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition-all" style={{background:'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow:'0 4px 15px rgba(37,99,235,0.4)'}}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update Password
        </button>
      </Card>

      <Card title="Two-Factor Authentication" description="Add an extra layer of security to your account">
        {/* Email 2FA */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Email Verification</p>
              <p className="text-xs text-gray-500 mt-0.5">OTP sent to {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-600 rounded-full px-2 py-1 font-bold">Active</span>
          </div>
        </div>
        {/* SMS 2FA */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">SMS Verification</p>
              <p className="text-xs text-gray-500 mt-0.5">OTP sent to your phone number</p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wide bg-yellow-100 text-yellow-600 rounded-full px-2 py-1 font-bold">Coming Soon</span>
        </div>
        <TOTPSetup user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />
      </Card>

      <Card title="Recent Activity" description="Recent logins and security events on your account">
        {loadingActivity ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : activity.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No recent activity recorded</p>
        ) : (
          <div className="space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">{a.event_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

/* ---------------- Wallet & Payment Tab ---------------- */
function WalletTab({ user, showToast }: any) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_name: '' });

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAccounts(data ?? []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.bank_name || !form.account_number || !form.account_name) {
      showToast('error', 'Please fill all bank account fields');
      return;
    }
    if (form.account_number.length !== 10 || !/^\d+$/.test(form.account_number)) {
      showToast('error', 'Account number must be 10 digits');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('bank_accounts').insert({
        user_id: user.id,
        bank_name: form.bank_name,
        account_number: form.account_number,
        account_name: form.account_name,
        is_default: accounts.length === 0,
      });
      if (error) throw error;

      setForm({ bank_name: '', account_number: '', account_name: '' });
      showToast('success', 'Bank account added');
      fetchAccounts();
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to add bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    try {
      await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', user.id);
      await supabase.from('bank_accounts').update({ is_default: true }).eq('id', id);
      showToast('success', 'Default withdrawal account updated');
      fetchAccounts();
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to update default account');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Bank account removed');
      fetchAccounts();
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to remove account');
    }
  };

  return (
    <>
      <Card title="Withdrawal Accounts" description="Manage bank accounts for withdrawals">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-gray-400 mb-4">No bank accounts added yet</p>
        ) : (
          <div className="space-y-3 mb-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{acc.bank_name}</p>
                    {acc.is_default && (
                      <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 font-semibold">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{acc.account_number} &middot; {acc.account_name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!acc.is_default && (
                    <button onClick={() => handleSetDefault(acc.id)} className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => handleDelete(acc.id)} className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Add New Bank Account</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Bank Name"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Account Number"
              maxLength={10}
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, '') })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Account Name"
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Add Account
          </button>
        </div>
      </Card>
    </>
  );
}

/* ---------------- Notifications Tab ---------------- */
function NotificationsTab({ user, showToast }: any) {
  const [prefs, setPrefs] = useState({
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    marketing_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, [user]);

  const fetchPrefs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setPrefs({
        push_enabled: data.push_enabled,
        email_enabled: data.email_enabled,
        sms_enabled: data.sms_enabled,
        marketing_enabled: data.marketing_enabled,
      });
    }
    setLoading(false);
  };

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: user.id, ...prefs, updated_at: new Date().toISOString() });
      if (error) throw error;
      showToast('success', 'Notification preferences saved');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const items: { key: keyof typeof prefs; label: string; description: string }[] = [
    { key: 'push_enabled', label: 'Push Notifications', description: 'Receive alerts on your device' },
    { key: 'email_enabled', label: 'Email Notifications', description: 'Transaction receipts and account updates' },
    { key: 'sms_enabled', label: 'SMS Notifications', description: 'Important alerts via text message' },
    { key: 'marketing_enabled', label: 'Marketing & Promotions', description: 'News, offers, and product updates' },
  ];

  return (
    <Card title="Notification Preferences" description="Choose how you want to be notified">
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${prefs[item.key] ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${prefs[item.key] ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="mt-6 w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white text-sm font-bold py-3.5 rounded-xl transition-all" style={{background:'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow:'0 4px 15px rgba(37,99,235,0.4)'}}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Preferences
      </button>
    </Card>
  );
}

/* ---------------- Referral Tab ---------------- */
function ReferralTab({ profile }: any) {
  const [copied, setCopied] = useState(false);
  const referralCode = profile?.referral_code ?? '--------';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card title="Referral Settings" description="Share your link and track your earnings">
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-500 mb-1">Your Referral Code</p>
        <p className="text-lg font-bold text-blue-700 tracking-wide">{referralCode}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Referral Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-800 mb-1">Payout Preference</p>
        <p className="text-xs text-gray-500">Referral bonuses are credited directly to your wallet balance and can be withdrawn alongside your main balance.</p>
      </div>
    </Card>
  );
}

/* ---------------- Support & Legal Tab ---------------- */
function SupportTab() {
  const links = [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Support', href: '/contact' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ];

  return (
    <Card title="Support & Legal" description="Get help and review our policies">
      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            {link.label}
            <span className="text-gray-400">&rarr;</span>
          </a>
        ))}
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-xl text-xs text-gray-500">
        Need urgent help? Email us at <span className="font-medium text-blue-600">support.primeconnect@gmail.com</span>
      </div>
    </Card>
  );
}
