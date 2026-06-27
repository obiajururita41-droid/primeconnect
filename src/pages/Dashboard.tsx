import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft,
  Copy, CheckCircle, Phone, Wifi, Tv, Zap,
  Eye, EyeOff, X, AlertCircle,
  Bell, History, Send, CreditCard,
  Star, ChevronRight, RefreshCw, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { usePaystackFunding } from '../hooks/usePaystack';

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

interface ServiceSettings {
  airtime_enabled: boolean;
  data_enabled: boolean;
  virtual_sms_enabled: boolean;
  bulk_sms_enabled: boolean;
  airtime_to_cash_enabled: boolean;
  betting_enabled: boolean;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { fundWallet } = usePaystackFunding();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletError, setWalletError] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const [serviceSettings, setServiceSettings] = useState<ServiceSettings>({
    airtime_enabled: true,
    data_enabled: true,
    virtual_sms_enabled: true,
    bulk_sms_enabled: true,
    airtime_to_cash_enabled: true,
    betting_enabled: true,
  });
  const [fundTab, setFundTab] = useState<'card' | 'bank'>('card');
  const [virtualAccount, setVirtualAccount] = useState<{
    account_number: string;
    bank_name: string;
  } | null>(null);
  const [bvn, setBvn] = useState('');
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);
    setWalletError('');
    try {
      const [svcRes, walletRes, txnRes, notifRes] = await Promise.all([
        supabase.from('service_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('wallets').select('id, balance, currency')
          .eq('user_id', user.id).eq('is_active', true).single(),
        supabase.from('transactions').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('notifications').select('id', { count: 'exact' })
          .eq('user_id', user.id).eq('is_read', false),
      ]);
      if (svcRes.data) {
        setServiceSettings({
          airtime_enabled: svcRes.data.airtime_enabled ?? true,
          data_enabled: svcRes.data.data_enabled ?? true,
          virtual_sms_enabled: svcRes.data.virtual_sms_enabled ?? true,
          bulk_sms_enabled: svcRes.data.bulk_sms_enabled ?? true,
          airtime_to_cash_enabled: svcRes.data.airtime_to_cash_enabled ?? true,
          betting_enabled: svcRes.data.betting_enabled ?? true,
        });
      }
      if (walletRes.error) {
        setWalletError('Could not load wallet. Tap to retry.');
      } else if (walletRes.data) {
        setWallet(walletRes.data);
      }
      if (txnRes.data) setTransactions(txnRes.data);
      if (notifRes.count !== null) setNotifCount(notifRes.count);
    } finally {
      setPageLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyReferral = () => {
    navigator.clipboard.writeText(profile?.referral_code ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkVirtualAccount = async () => {
    const { data } = await supabase
      .from('virtual_accounts')
      .select('account_number, bank_name')
      .eq('user_id', user?.id)
      .single();
    if (data) setVirtualAccount(data);
  };

  const createVirtualAccount = async () => {
    setVaError('');
    if (!bvn || bvn.length !== 11 || !/^\d+$/.test(bvn)) {
      setVaError('Enter a valid 11-digit BVN');
      return;
    }
    setVaLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const { data, error } = await supabase.functions.invoke(
      'paystack-create-virtual-account',
      { headers: { Authorization: `Bearer ${token}` }, body: { bvn } }
    );
    setVaLoading(false);
    if (error || data?.error) {
      setVaError(data?.error || 'Failed to create account. Please try again.');
      return;
    }
    setVirtualAccount({
      account_number: data.account_number,
      bank_name: data.bank_name,
    });
  };

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

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')?.[0] ?? 'User';
  const avatarInitials = profile?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'U';
  const referralEarnings = profile?.referral_earnings ?? 0;

  const quickActions = [
    { label: 'Airtime',     icon: <Phone className="w-6 h-6 text-blue-600" />, path: '/services/airtime',      enabled: serviceSettings.airtime_enabled },
    { label: 'Data',        icon: <Wifi className="w-6 h-6 text-blue-600" />,  path: '/services/data',         enabled: serviceSettings.data_enabled },
    { label: 'Cable TV',    icon: <Tv className="w-6 h-6 text-blue-600" />,    path: '/services/tv-subscription', enabled: true },
    { label: 'Electricity', icon: <Zap className="w-6 h-6 text-blue-600" />,   path: '/services/electricity',  enabled: true },
    { label: 'History',     icon: <History className="w-6 h-6 text-blue-600" />, path: '/transactions',        enabled: true },
    { label: 'Transfer',    icon: <Send className="w-6 h-6 text-blue-600" />,  path: '/withdrawal',            enabled: true },
    { label: 'Withdraw',    icon: <ArrowUpRight className="w-6 h-6 text-blue-600" />, path: '/withdrawal',    enabled: true },
    { label: 'More',        icon: <CreditCard className="w-6 h-6 text-blue-600" />, path: '/services',        enabled: true },
  ];

  const getTransactionMeta = (txn: Transaction) => {
    const desc = (txn.description ?? '').toLowerCase();
    if (desc.includes('airtime')) return { icon: <Phone className="w-4 h-4" />, bg: 'bg-blue-50', color: 'text-blue-500' };
    if (desc.includes('data')) return { icon: <Wifi className="w-4 h-4" />, bg: 'bg-green-50', color: 'text-green-500' };
    if (desc.includes('electricity') || desc.includes('power')) return { icon: <Zap className="w-4 h-4" />, bg: 'bg-yellow-50', color: 'text-yellow-500' };
    if (desc.includes('cable') || desc.includes('tv') || desc.includes('dstv')) return { icon: <Tv className="w-4 h-4" />, bg: 'bg-purple-50', color: 'text-purple-500' };
    if (desc.includes('fund') || desc.includes('wallet')) return { icon: <Wallet className="w-4 h-4" />, bg: 'bg-indigo-50', color: 'text-indigo-500' };
    if (desc.includes('transfer')) return { icon: <Send className="w-4 h-4" />, bg: 'bg-indigo-50', color: 'text-indigo-500' };
    return txn.type === 'credit'
      ? { icon: <ArrowDownLeft className="w-4 h-4" />, bg: 'bg-green-50', color: 'text-green-500' }
      : { icon: <ArrowUpRight className="w-4 h-4" />, bg: 'bg-red-50', color: 'text-red-500' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };
  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24">
      <div className="max-w-md mx-auto">
        <div className="px-4 pt-12 pb-24 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f2070 0%, #1a3aad 40%, #2254e8 100%)' }}>
          <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute right-8 top-16 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -left-8 bottom-0 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-sm overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : avatarInitials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">{getGreeting()} 👋</p>
                <p className="text-white font-black text-[15px]">{firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {referralEarnings > 0 && (
                <button onClick={() => navigate('/referral')} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 active:scale-95 transition-transform">
                  <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-black text-white">₦{Number(referralEarnings).toLocaleString('en-NG', { minimumFractionDigits: 0 })}</span>
                </button>
              )}
              <button onClick={() => navigate('/notifications')} className="relative w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center active:scale-95 transition-transform">
                <Bell className="w-5 h-5 text-white" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-black px-1">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="mx-4 -mt-16 relative z-10 mb-4">
          {pageLoading ? (
            <div className="rounded-3xl p-5 shadow-2xl bg-white animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
              <div className="h-10 bg-gray-100 rounded w-48 mb-6" />
              <div className="grid grid-cols-4 gap-2">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                    <div className="h-3 bg-gray-100 rounded w-10" />
                  </div>
                ))}
              </div>
            </div>
          ) : walletError ? (
            <div className="rounded-3xl p-5 shadow-xl bg-white border border-red-100">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm font-semibold">{walletError}</p>
              </div>
              <button onClick={fetchData} className="flex items-center gap-2 text-blue-600 text-sm font-bold">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : (
            <div className="rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden" style={{ background: "linear-gradient(145deg, #0a1d6e 0%, #1535a8 40%, #2254e8 100%)" }}>
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -left-6 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute right-16 bottom-8 w-20 h-20 rounded-full bg-white/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white/60 text-[11px] font-semibold uppercase tracking-widest">Wallet Balance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span className="text-[9px] text-emerald-300 font-black uppercase tracking-wide">Secured</span>
                    </div>
                    <button onClick={() => setShowBalance(!showBalance)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
                      {showBalance ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1">Available Balance</p>
                <p className="text-[40px] font-black tracking-tight leading-none mb-1">
                  {showBalance ? "₦" + (wallet?.balance ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "₦ ••••••"}
                </p>
                <p className="text-white/30 text-[10px] font-medium mb-5">NGN • PrimeConnect Wallet</p>
                <div className="border-t border-white/10 mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Add Money", icon: <Plus className="w-5 h-5" />, action: () => { setShowFund(true); checkVirtualAccount(); } },
                    { label: "Transfer", icon: <Send className="w-5 h-5" />, action: () => navigate("/send") },
                    { label: "Withdraw", icon: <ArrowUpRight className="w-5 h-5" />, action: () => navigate("/withdrawal") },
                    { label: "History", icon: <History className="w-5 h-5" />, action: () => navigate("/transactions") },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center text-white">
                        {btn.icon}
                      </div>
                      <span className="text-white/60 text-[10px] font-semibold text-center leading-tight">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <div className="mx-4 mb-4">
            <div className="relative overflow-hidden rounded-3xl" style={{ background: banners[bannerIndex]?.bg_color ?? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
              <div className="p-5 relative">
                <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
                <div className="relative">
                  <p className="text-4xl mb-2">{banners[bannerIndex]?.emoji}</p>
                  <h3 className="text-white font-black text-lg leading-tight mb-1">{banners[bannerIndex]?.title}</h3>
                  <p className="text-white/70 text-xs mb-4">{banners[bannerIndex]?.subtitle}</p>
                  <button onClick={() => navigate(banners[bannerIndex]?.cta_link ?? '/services')}
                    className="bg-white text-blue-600 font-black text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all">
                    {banners[bannerIndex]?.cta_text} →
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-1.5 pb-3">
                {banners.map((_: any, i: number) => (
                  <button key={i} onClick={() => setBannerIndex(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === bannerIndex ? 20 : 6, background: i === bannerIndex ? 'white' : 'rgba(255,255,255,0.4)' }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mx-4 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-gray-900 text-[15px]">Quick Actions</h2>
                <p className="text-gray-400 text-xs mt-0.5">What do you want to do?</p>
              </div>
              <button onClick={() => navigate('/services')} className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-transform">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 px-1">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  disabled={!action.enabled}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  className={'flex flex-col items-center gap-2.5 py-2 rounded-2xl transition-all duration-150 active:scale-90 active:bg-blue-50 ' + (!action.enabled ? 'opacity-35' : '')}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center transition-all duration-150">
                    {action.icon}
                  </div>
                  <span className="text-[11px] text-gray-600 font-semibold text-center leading-tight tracking-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {profile?.referral_code && (
          <div className="mx-4 mb-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-black text-sm">Refer and Earn</p>
                    <p className="text-gray-400 text-xs">Code: <span className="text-blue-600 font-bold">{profile.referral_code}</span></p>
                  </div>
                </div>
                <button onClick={copyReferral} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform">
                  {copied ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mx-4 mb-4">
          <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0f2070 0%, #2254e8 100%)' }}>
            <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-semibold mb-1">Special Offer</p>
                <h3 className="text-white font-black text-lg leading-tight mb-1">Airtime and Data Made Easy</h3>
                <p className="text-white/50 text-xs mb-4">Top up anytime, anywhere</p>
                <button onClick={() => navigate('/services/airtime')} className="bg-white text-blue-700 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-lg">
                  Buy Now <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-10 h-10 text-white/60" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 mb-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-gray-900 text-[15px]">Recent Transactions</h2>
              <p className="text-gray-400 text-xs mt-0.5">Your latest activity</p>
            </div>
            <button onClick={() => navigate('/transactions')} className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-transform">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {pageLoading ? (
            <div className="space-y-3">
              {[0,1,2].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-700 text-sm font-bold mb-1">No transactions yet</p>
              <p className="text-gray-400 text-xs mb-4">Fund your wallet to get started</p>
              <button onClick={() => { setShowFund(true); checkVirtualAccount(); }} className="text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #1535a8, #2254e8)' }}>
                Add Money
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((txn) => {
                const meta = getTransactionMeta(txn);
                return (
                  <div key={txn.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ' + meta.bg + ' ' + meta.color}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-gray-800 text-sm font-bold leading-tight line-clamp-1">{txn.description || 'Transaction'}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">{formatDate(txn.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={'text-sm font-black ' + (txn.type === 'credit' ? 'text-emerald-600' : 'text-gray-800')}>
                        {txn.type === 'credit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </p>
                      <span className={'text-[10px] font-bold px-1.5 py-0.5 rounded-md ' + (txn.status === 'success' ? 'bg-emerald-50 text-emerald-600' : txn.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500')}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      <BottomNav />
      </div>
      {showFund && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFund(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-10 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Add Money</h3>
                <p className="text-gray-400 text-xs mt-0.5">Choose how to fund your wallet</p>
              </div>
              <button onClick={() => setShowFund(false)} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-90 transition-transform">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
              {(['card', 'bank'] as const).map((tab) => (
                <button key={tab} onClick={() => setFundTab(tab)} className={'flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ' + (fundTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400')}>
                  {tab === 'card' ? 'Card / USSD' : 'Bank Transfer'}
                </button>
              ))}
            </div>
            {fundTab === 'card' ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {QUICK_AMOUNTS.map((q) => (
                    <button key={q} onClick={() => setAmount(String(q))} className={'py-2.5 rounded-2xl text-sm font-bold border transition-all active:scale-95 ' + (amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-100')}>
                      ₦{q.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="mb-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">₦</span>
                    <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} placeholder="Enter amount" className="w-full pl-9 pr-4 py-4 rounded-2xl border border-gray-200 text-gray-900 font-bold text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50" />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-red-500 text-xs font-semibold">{error}</p>
                    </div>
                  )}
                </div>
                <button onClick={handleFund} disabled={loading} className="w-full py-4 rounded-2xl text-white font-black text-base active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1535a8, #2254e8)' }}>
                  {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</> : 'Fund ₦' + Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })}
                </button>
              </>
            ) : (
 <>
                {virtualAccount ? (
                  <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                    <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-3">Your Dedicated Account</p>
                    <p className="text-gray-900 font-black text-2xl tracking-wider mb-1">{virtualAccount.account_number}</p>
                    <p className="text-gray-500 text-sm font-semibold">{virtualAccount.bank_name}</p>
                    <div className="border-t border-blue-100 mt-3 pt-3">
                      <p className="text-gray-400 text-xs">Transfer any amount to this account. Your wallet will be credited automatically.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm font-semibold mb-3">Enter your BVN to create a dedicated bank account</p>
                    <input type="tel" value={bvn} onChange={(e) => { setBvn(e.target.value); setVaError(''); }} placeholder="11-digit BVN" maxLength={11} className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-gray-900 font-bold text-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 tracking-widest" />
                    {vaError && (
                      <div className="flex items-center gap-2 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        <p className="text-red-500 text-xs font-semibold">{vaError}</p>
                      </div>
                    )}
                    <button onClick={createVirtualAccount} disabled={vaLoading} className="w-full mt-3 py-4 rounded-2xl text-white font-black text-base active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1535a8, #2254e8)' }}>
                      {vaLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
