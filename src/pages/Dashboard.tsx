import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft,
  Copy, CheckCircle, Phone, Wifi, Tv, Zap, Gift, Users, Eye, EyeOff, X, AlertCircle, MessageSquare,
  Bell, History, Send, QrCode, TrendingUp, CreditCard, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useFlutterwaveFunding } from '../hooks/useFlutterwave';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  created_at: string;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];


/* ---------------- Transaction Insights ---------------- */
function InsightsDashboard({ userId, referralEarnings }: { userId: string; referralEarnings: number }) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInsights(); }, [userId]);

  async function fetchInsights() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!txns) { setLoading(false); return; }

    const monthTxns = txns.filter(t => t.created_at >= startOfMonth);
    const totalSpent = monthTxns.filter(t => t.type === 'debit' && t.status === 'success').reduce((s, t) => s + Number(t.amount), 0);
    const totalFunded = monthTxns.filter(t => t.type === 'credit' && t.status === 'success').reduce((s, t) => s + Number(t.amount), 0);

    // Most used service
    const serviceCounts: Record<string, number> = {};
    txns.forEach(t => {
      const desc = (t.description || '').toLowerCase();
      if (desc.includes('airtime')) serviceCounts['Airtime'] = (serviceCounts['Airtime'] || 0) + 1;
      else if (desc.includes('data')) serviceCounts['Data'] = (serviceCounts['Data'] || 0) + 1;
      else if (desc.includes('virtual sms')) serviceCounts['Virtual SMS'] = (serviceCounts['Virtual SMS'] || 0) + 1;
      else if (desc.includes('gift')) serviceCounts['Gift Cards'] = (serviceCounts['Gift Cards'] || 0) + 1;
      else if (desc.includes('bet') || desc.includes('sport')) serviceCounts['Bet Funding'] = (serviceCounts['Bet Funding'] || 0) + 1;
    });
    const mostUsed = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Last 7 days activity
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayTxns = txns.filter(t => t.created_at.startsWith(dateStr) && t.type === 'debit');
      return { day: d.toLocaleDateString('en', { weekday: 'short' }), amount: dayTxns.reduce((s, t) => s + Number(t.amount), 0) };
    });

    setInsights({ totalSpent, totalFunded, mostUsed, last7, totalTxns: txns.length });
    setLoading(false);
  }

  if (loading) return (
    <div style={{ margin: '0 16px 16px', background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 14, background: '#E2E8F0', borderRadius: 8, width: '40%', marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 70, background: '#E2E8F0', borderRadius: 14 }} />)}
      </div>
    </div>
  );

  if (!insights) return null;

  const maxAmount = Math.max(...insights.last7.map((d: any) => d.amount), 1);

  return (
    <div style={{ margin: '0 16px 16px', background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Transaction Insights</p>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>This month overview</p>
        </div>
        <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '4px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB' }}>This Month</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: 16, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#3B82F6', fontWeight: 600, marginBottom: 4 }}>💸 Total Spent</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#1E40AF' }}>₦{insights.totalSpent.toLocaleString()}</p>
          <p style={{ fontSize: 10, color: '#93C5FD', marginTop: 2 }}>This month</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', borderRadius: 16, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginBottom: 4 }}>💰 Total Funded</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#15803D' }}>₦{insights.totalFunded.toLocaleString()}</p>
          <p style={{ fontSize: 10, color: '#86EFAC', marginTop: 2 }}>This month</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', borderRadius: 16, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#EA580C', fontWeight: 600, marginBottom: 4 }}>⭐ Most Used</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#C2410C' }}>{insights.mostUsed}</p>
          <p style={{ fontSize: 10, color: '#FCA5A5', marginTop: 2 }}>Top service</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FDF4FF, #FAE8FF)', borderRadius: 16, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, color: '#9333EA', fontWeight: 600, marginBottom: 4 }}>🎁 Referral Earned</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#7E22CE' }}>₦{Number(referralEarnings).toLocaleString()}</p>
          <p style={{ fontSize: 10, color: '#D8B4FE', marginTop: 2 }}>Lifetime</p>
        </div>
      </div>

      {/* Activity Graph */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>📊 Last 7 Days Activity</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {insights.last7.map((d: any, i: number) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', borderRadius: 6, background: d.amount > 0 ? 'linear-gradient(180deg, #3B82F6, #1D4ED8)' : '#E5E7EB', height: Math.max((d.amount / maxAmount) * 60, d.amount > 0 ? 8 : 4), transition: 'height 0.5s ease' }} />
              <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600 }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { fundWallet } = useFlutterwaveFunding();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [serviceSettings, setServiceSettings] = useState<Record<string, boolean>>({
    airtime_enabled: true,
    data_enabled: true,
    giftcard_enabled: true,
    virtual_sms_enabled: true,
    bulk_sms_enabled: true,
    airtime_to_cash_enabled: true,
    betting_enabled: true,
  });
  const [fundTab, setFundTab] = useState<'card' | 'bank'>('card');
  const [virtualAccount, setVirtualAccount] = useState<{ account_number: string; bank_name: string } | null>(null);
  const [bvn, setBvn] = useState('');
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState('');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    // Fetch service settings
    const { data: svc } = await supabase
      .from('service_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (svc) setServiceSettings({
      airtime_enabled: svc.airtime_enabled ?? true,
      data_enabled: svc.data_enabled ?? true,
      giftcard_enabled: svc.giftcard_enabled ?? true,
      virtual_sms_enabled: svc.virtual_sms_enabled ?? true,
      bulk_sms_enabled: svc.bulk_sms_enabled ?? true,
      airtime_to_cash_enabled: svc.airtime_to_cash_enabled ?? true,
      betting_enabled: svc.betting_enabled ?? true,
    });
    const { data: w, error: walletErr } = await supabase
      .from('wallets')
      .select('id, balance, currency')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single();
    if (w) setWallet(w);
    if (walletErr) alert('WALLET ERROR: ' + JSON.stringify(walletErr) + ' | uid=' + String(user?.id));

    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (txns) setTransactions(txns);
  }

  const copyReferral = () => {
    navigator.clipboard.writeText(profile?.referral_code ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function checkVirtualAccount() {
    const { data } = await supabase
      .from('virtual_accounts')
      .select('account_number, bank_name')
      .eq('user_id', user?.id)
      .single();
    if (data) setVirtualAccount(data);
  }

  async function createVirtualAccount() {
    setVaError('');
    if (!bvn || bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      setVaError('Enter a valid 11-digit BVN');
      return;
    }
    setVaLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('flutterwave-create-virtual-account', {
      headers: { Authorization: `Bearer ${token}` },
      body: { bvn },
    });

    setVaLoading(false);

    if (error || data?.error) {
      setVaError(data?.error || 'Failed to create account. Please try again.');
      return;
    }

    setVirtualAccount({ account_number: data.account_number, bank_name: data.bank_name });
  }

  const handleFund = async () => {
    setError('');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      setError('Minimum amount is ₦100');
      return;
    }
    if (!wallet?.id) {
      setError('Wallet not found. Please contact support.');
      return;
    }
    setLoading(true);
    await fundWallet({
      amount: numAmount,
      userEmail: user?.email ?? '',
      userName: profile?.full_name ?? 'PrimeConnect User',
      userPhone: profile?.phone ?? '08000000000',
      userId: user?.id ?? '',
      walletId: wallet.id,
      onSuccess: () => {
        setShowFund(false);
        setAmount('');
        setLoading(false);
        fetchData();
      },
      onError: (msg) => {
        setError(msg);
        setLoading(false);
      },
    });
  };

  const quickActions = [
    { label: 'Airtime',    icon: <Phone className="w-6 h-6" />,        color: 'bg-blue-600',   path: '/services/airtime' },
    { label: 'Data',       icon: <Wifi className="w-6 h-6" />,         color: 'bg-blue-600',   path: '/services/data' },
    { label: 'Gift Cards', icon: <Gift className="w-6 h-6" />,         color: 'bg-purple-600', path: '/services/gift-card' },
    { label: 'Virtual SMS',icon: <MessageSquare className="w-6 h-6" />,color: 'bg-cyan-600',   path: '/services/virtual-sms' },
    { label: 'Bulk SMS',   icon: <Send className="w-6 h-6" />,         color: 'bg-teal-600',   path: '/services/bulk-sms' },
    { label: 'Fund Wallet',icon: <Plus className="w-6 h-6" />,         color: 'bg-blue-600',   path: null },
    { label: 'Withdraw',   icon: <ArrowUpRight className="w-6 h-6" />, color: 'bg-orange-500', path: '/withdrawal' },
    { label: 'Refer & Earn',icon: <Users className="w-6 h-6" />,       color: 'bg-pink-600',   path: '/referral' },
    { label: 'A2 Cash',    icon: <TrendingUp className="w-6 h-6" />,   color: 'bg-green-600',  path: '/services/airtime-to-cash' },
    { label: 'Bet Funding',icon: <Zap className="w-6 h-6" />,          color: 'bg-red-500',    path: '/services/betting' },
  ];

  const firstName = profile?.full_name?.split(' ')?.[0] ?? 'User';
  const avatarInitials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
  const totalTxns = transactions.length;
  const referralEarnings = profile?.referral_earnings ?? 0;
  const loyaltyPoints = profile?.loyalty_points ?? 0;

  const getTransactionIcon = (txn: Transaction) => {
    const desc = (txn.description ?? '').toLowerCase();
    if (desc.includes('airtime')) return <Phone className="w-4 h-4 text-blue-500" />;
    if (desc.includes('data')) return <Wifi className="w-4 h-4 text-green-500" />;
    if (desc.includes('electricity') || desc.includes('power')) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (desc.includes('gift')) return <Gift className="w-4 h-4 text-purple-500" />;
    if (desc.includes('fund') || desc.includes('wallet') || desc.includes('transfer')) return <Wallet className="w-4 h-4 text-indigo-500" />;
    return txn.type === 'credit'
      ? <ArrowDownLeft className="w-4 h-4 text-green-500" />
      : <ArrowUpRight className="w-4 h-4 text-red-500" />;
  };

  const getTransactionBg = (txn: Transaction) => {
    const desc = (txn.description ?? '').toLowerCase();
    if (desc.includes('airtime')) return 'bg-blue-50';
    if (desc.includes('data')) return 'bg-green-50';
    if (desc.includes('electricity') || desc.includes('power')) return 'bg-yellow-50';
    if (desc.includes('gift')) return 'bg-purple-50';
    if (desc.includes('fund') || desc.includes('wallet') || desc.includes('transfer')) return 'bg-indigo-50';
    return txn.type === 'credit' ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="max-w-md mx-auto">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-6 pb-4 bg-white">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : avatarInitials}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {firstName} 👋</p>
              <p className="text-xs text-gray-400">Welcome back to PrimeConnect</p>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-500 font-medium">Verified Account</span>
              </div>
            </div>
          </div>
          {/* Refer & Earn pill + Bell */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/referral')}
              className="flex flex-col items-end bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm"
            >
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Refer & Earn</span>
              </div>
              <span className="text-sm font-bold text-green-500">₦{Number(referralEarnings).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
            </button>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="mx-4 mb-4">
          <div className="bg-gradient-to-br from-[#1a56db] via-[#1e40af] to-[#1e3a8a] rounded-3xl p-5 text-white shadow-xl shadow-blue-900/30 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
            <div className="absolute -left-6 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute right-14 bottom-2 w-16 h-16 rounded-full bg-white/5" />
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 20px)'}} />

            <div className="flex items-center justify-between mb-3 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium opacity-80 tracking-wide uppercase">Wallet Balance</span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] opacity-50 mb-1 tracking-widest uppercase">Available</p>
            <div className="text-[36px] font-black tracking-tight leading-none mb-3">
              {showBalance
                ? `₦${(wallet?.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                : '₦ ••••••'}
            </div>

            <div className="border-t border-white/10 mb-3 relative" />

            <div className="flex items-center justify-between relative">
              {[
                { label: 'Add Money', icon: <Plus className="w-4 h-4" />,         action: () => { setShowFund(true); checkVirtualAccount(); } },
                { label: 'Transfer',  icon: <Send className="w-4 h-4" />,         action: () => navigate('/withdrawal') },
                { label: 'Withdraw',  icon: <ArrowUpRight className="w-4 h-4" />, action: () => navigate('/withdrawal') },
                { label: 'History',   icon: <History className="w-4 h-4" />,      action: () => navigate('/transactions') },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className="flex flex-col items-center gap-2 flex-1 active:scale-95 transition-transform"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10 hover:bg-white/25 transition-colors">
                    {btn.icon}
                  </div>
                  <span className="text-[10px] font-medium opacity-80 text-center leading-tight">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mx-4 bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-base">Quick Actions</h2>
            <button onClick={() => navigate('/services')} className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">View All ›</button>
          </div>
          <div className="grid grid-cols-5 gap-y-4 gap-x-2">
            {quickActions.filter(action => {
              if (action.label === 'Airtime')      return serviceSettings.airtime_enabled;
              if (action.label === 'Data')         return serviceSettings.data_enabled;
              if (action.label === 'Gift Cards')   return serviceSettings.giftcard_enabled;
              if (action.label === 'Virtual SMS')  return serviceSettings.virtual_sms_enabled;
              if (action.label === 'Bulk SMS')     return serviceSettings.bulk_sms_enabled;
              if (action.label === 'A2 Cash')      return serviceSettings.airtime_to_cash_enabled;
              if (action.label === 'Bet Funding')  return serviceSettings.betting_enabled;
              return true;
            }).map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  if (action.path) navigate(action.path);
                  else if (action.label === 'Fund Wallet') { setShowFund(true); checkVirtualAccount(); }
                }}
                className="flex flex-col items-center gap-2 active:scale-90 transition-all duration-150"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-[9px] text-gray-500 text-center leading-tight font-semibold w-full truncate px-0.5">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Insights Dashboard */}
        {user?.id && <InsightsDashboard userId={user.id} referralEarnings={referralEarnings} />}

        {/* Invite Banner */}
        {showBanner && (
          <div className="mx-4 mb-4 rounded-2xl relative overflow-hidden">
            {/* Background */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-4 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -left-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />

              {/* Close */}
              <button
                onClick={() => setShowBanner(false)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-3 h-3 text-white" />
              </button>

              {/* Top row */}
              <div className="flex items-start justify-between pr-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🎁</span>
                    <p className="text-white font-extrabold text-sm">Invite friends, earn more!</p>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed mb-3">
                    Earn up to <span className="text-white font-bold">10% lifetime commission</span> every time your referrals transact.
                  </p>

                  {/* Referral code pill */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5">
                      <span className="text-white/60 text-[10px] font-medium uppercase tracking-wide">Your Code</span>
                      <span className="text-white text-xs font-black tracking-widest">{profile?.referral_code ?? '------'}</span>
                    </div>
                    <button
                      onClick={copyReferral}
                      className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded-xl active:scale-95 transition-all"
                    >
                      {copied
                        ? <><CheckCircle className="w-3 h-3 text-green-300" /><span className="text-white text-[10px] font-bold">Copied!</span></>
                        : <><Copy className="w-3 h-3 text-white" /><span className="text-white text-[10px] font-bold">Copy</span></>
                      }
                    </button>
                  </div>

                  <button
                    onClick={() => navigate('/referral')}
                    className="bg-white text-indigo-600 text-xs font-extrabold px-5 py-2 rounded-xl active:scale-95 transition-transform shadow-lg"
                  >
                    Invite Now →
                  </button>
                </div>

                {/* Earnings badge */}
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 shrink-0 ml-2">
                  <p className="text-white font-extrabold text-lg leading-none">10%</p>
                  <p className="text-white/70 text-[9px] font-bold tracking-wide mt-0.5">COMMISSION</p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="bg-indigo-900 flex divide-x divide-white/10">
              <div className="flex-1 py-2.5 text-center">
                <p className="text-white font-bold text-sm">{profile?.referral_count ?? 0}</p>
                <p className="text-white/50 text-[10px]">Referrals</p>
              </div>
              <div className="flex-1 py-2.5 text-center">
                <p className="text-green-400 font-bold text-sm">₦{Number(referralEarnings).toLocaleString()}</p>
                <p className="text-white/50 text-[10px]">Earned</p>
              </div>
              <div className="flex-1 py-2.5 text-center">
                <p className="text-white font-bold text-sm">10%</p>
                <p className="text-white/50 text-[10px]">Per Referral</p>
              </div>
            </div>
          </div>
        )}



        {/* Recent Transactions */}
        <div className="mx-4 bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-base">Recent Transactions</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Your latest activity</p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg"
            >
              View All
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1">No transactions yet</p>
              <p className="text-gray-300 text-xs mb-4">Fund your wallet to get started</p>
              <button
                onClick={() => { setShowFund(true); checkVirtualAccount(); }}
                className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-xl active:scale-95 transition-transform"
              >
                + Add Money
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${getTransactionBg(txn)}`}>
                      {getTransactionIcon(txn)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{txn.description ?? 'Transaction'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(txn.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-500' : 'text-gray-800'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      txn.status === 'success' ? 'bg-green-50 text-green-600' :
                      txn.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-500'
                    }`}>
                      {txn.status === 'success' ? '✓ Success' : txn.status === 'pending' ? '⏳ Pending' : '✕ Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-40 max-w-md mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="w-6 h-6 text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">Home</span>
        </button>
        <button onClick={() => navigate('/transactions')} className="flex flex-col items-center gap-0.5 flex-1">
          <History className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] text-gray-400">Transactions</span>
        </button>
        <button
          onClick={() => navigate('/scan')}
          className="flex flex-col items-center gap-0.5 flex-1 -mt-5"
        >
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] text-gray-400 mt-1">Scan/Pay</span>
        </button>
        <button onClick={() => navigate('/services')} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-400 rounded-sm" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">Services</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="w-6 h-6 text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <span className="text-[10px] text-gray-400">Account</span>
        </button>
      </div>

      {/* Fund Wallet Modal */}
      {showFund && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl animate-slide-up">

            {/* Drag handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Fund Wallet</h2>
                <p className="text-xs text-gray-400 mt-0.5">Add money to your PrimeConnect wallet</p>
              </div>
              <button
                onClick={() => { setShowFund(false); setError(''); setAmount(''); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="flex gap-1 mb-5 bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setFundTab('card')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    fundTab === 'card'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  💳 Card / USSD
                </button>
                <button
                  onClick={() => setFundTab('bank')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    fundTab === 'bank'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🏦 Bank Transfer
                </button>
              </div>

              {/* CARD / USSD TAB */}
              {fundTab === 'card' && (
                <>
                  {/* Amount input */}
                  <div className="relative mb-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-gray-400 text-xs font-bold">NGN</span>
                      <div className="w-px h-4 bg-gray-200 mx-1" />
                      <span className="text-gray-700 font-bold">₦</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full pl-20 pr-4 py-4 border-2 border-gray-100 rounded-2xl text-xl font-bold text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50 transition-colors"
                    />
                  </div>

                  {/* Quick amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {QUICK_AMOUNTS.map(q => (
                      <button
                        key={q}
                        onClick={() => setAmount(String(q))}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                          amount === String(q)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        ₦{q.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-xs text-red-600 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => { setShowFund(false); setError(''); setAmount(''); }}
                      className="flex-1 border-2 border-gray-100 py-3.5 rounded-2xl text-sm font-semibold text-gray-600 active:scale-95 transition-transform"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFund}
                      disabled={loading || !amount}
                      className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-200 disabled:text-blue-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                        : `Pay ₦${Number(amount || 0).toLocaleString()}`}
                    </button>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-4 pb-6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-green-500 text-xs">🔒</span>
                      <span className="text-xs text-gray-400 font-medium">256-bit SSL</span>
                    </div>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">⚡</span>
                      <span className="text-xs text-gray-400 font-medium">Instant Credit</span>
                    </div>
                    <div className="w-px h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 font-medium">Secured by Flutterwave</span>
                    </div>
                  </div>
                </>
              )}

              {/* BANK TRANSFER TAB */}
              {fundTab === 'bank' && (
                <div className="pb-6">
                  {virtualAccount ? (
                    <>
                      <p className="text-xs text-gray-500 mb-3 text-center">Send to this dedicated account — funds credit within minutes</p>

                      {/* Account Card */}
                      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 mb-4 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
                        <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wide">Bank Name</p>
                        <p className="text-white font-bold text-base mb-4">{virtualAccount.bank_name}</p>
                        <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wide">Account Number</p>
                        <div className="flex items-center justify-between">
                          <p className="text-white text-2xl font-black tracking-[0.15em]">{virtualAccount.account_number}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(virtualAccount.account_number);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors active:scale-95"
                          >
                            {copied
                              ? <><CheckCircle className="w-3.5 h-3.5 text-green-300" /><span className="text-white text-xs font-semibold">Copied!</span></>
                              : <><Copy className="w-3.5 h-3.5 text-white" /><span className="text-white text-xs font-semibold">Copy</span></>
                            }
                          </button>
                        </div>
                      </div>

                      {/* Info row */}
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                        <span className="text-blue-500 text-sm mt-0.5">ℹ️</span>
                        <p className="text-xs text-blue-700 leading-relaxed">This is your dedicated account number. Any transfer to this account is automatically credited to your wallet.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                        <p className="text-xs font-bold text-blue-700 mb-2">🏦 Pay via Bank Transfer</p>
                        <ol className="text-xs text-blue-600 space-y-1.5">
                          <li>1. Enter amount and tap Pay Now below</li>
                          <li>2. Select Bank Transfer in the payment popup</li>
                          <li>3. Transfer to the account shown — wallet credited instantly</li>
                        </ol>
                      </div>
                      <div className="space-y-2 mb-4">
                        {[500, 1000, 2000, 5000].map((q) => (
                          <button key={q} onClick={() => setAmount(String(q))}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                              amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                            }`}>
                            ₦{q.toLocaleString()}
                          </button>
                        ))}
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₦</span>
                          <input type="number" placeholder="Other amount" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!amount || Number(amount) < 100) { setError('Minimum amount is ₦100'); return; }
                          fundWallet({
                            amount: Number(amount),
                            userEmail: profile?.email ?? '',
                            userName: profile?.full_name ?? '',
                            userPhone: profile?.phone ?? '',
                            userId: user?.id ?? '',
                            walletId: wallet?.id ?? '',
                            onSuccess: () => { setShowFund(false); setAmount(''); fetchData(); },
                            onError: (msg) => setError(msg),
                          });
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                      >
                        🏦 Pay via Bank Transfer {amount ? `— ₦${Number(amount).toLocaleString()}` : ''}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => { setShowFund(false); setError(''); setAmount(''); }}
                    className="w-full border-2 border-gray-100 py-3 rounded-2xl text-sm font-semibold text-gray-600 mt-3 active:scale-95 transition-transform"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
