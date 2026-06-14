import { useState, useEffect } from 'react';
import {
  User, Lock, Wallet, Bell, Share2, HelpCircle, Camera,
  Save, Eye, EyeOff, CheckCircle, AlertCircle, Copy, CheckCircle2, Loader2
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container-custom max-w-5xl mx-auto px-4 py-6 lg:py-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 text-sm font-semibold bg-red-50 px-3 py-2 rounded-xl">Logout</button>
        </div>
        <p className="text-gray-500 text-sm mb-6">Manage your account, security and preferences</p>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs - sidebar on desktop, scroll row on mobile */}
          <div className="lg:w-64 shrink-0">
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 lg:overflow-visible">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <ProfileTab user={user} profile={profile} refreshProfile={refreshProfile} showToast={showToast} />
            )}
            {activeTab === 'security' && <SecurityTab user={user} showToast={showToast} />}
            {activeTab === 'wallet' && <WalletTab user={user} showToast={showToast} />}
            {activeTab === 'notifications' && <NotificationsTab user={user} showToast={showToast} />}
            {activeTab === 'referral' && <ReferralTab profile={profile} />}
            {activeTab === 'support' && <SupportTab />}
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
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
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </Card>
  );
}

/* ---------------- Security Tab ---------------- */
function SecurityTab({ user, showToast }: any) {
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
          className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update Password
        </button>
      </Card>

      <Card title="Two-Factor Authentication" description="Add an extra layer of security to your account">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-800">2FA via Email/SMS</p>
            <p className="text-xs text-gray-500 mt-0.5">Coming soon — we'll notify you when this is available</p>
          </div>
          <span className="text-[10px] uppercase tracking-wide bg-gray-200 text-gray-500 rounded-full px-2 py-1 font-semibold">Soon</span>
        </div>
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
        className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
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
