import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft,
  Copy, CheckCircle, Phone, Wifi, Tv, Zap, Users, Eye, EyeOff, X, AlertCircle, MessageSquare,
  Bell, History, Send, QrCode, TrendingUp, CreditCard, PiggyBank, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { usePaystackFunding } from '../hooks/usePaystack';

interface WalletData { id: string; balance: number; currency: string; }
interface Transaction { id: string; type: string; status: string; amount: number; description: string; created_at: string; }

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
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serviceSettings, setServiceSettings] = useState<Record<string, boolean>>({
    airtime_enabled: true, data_enabled: true, virtual_sms_enabled: true,
    bulk_sms_enabled: true, airtime_to_cash_enabled: true, betting_enabled: true,
  });
  const [fundTab, setFundTab] = useState<'card' | 'bank'>('card');
  const [virtualAccount, setVirtualAccount] = useState<{ account_number: string; bank_name: string } | null>(null);
  const [bvn, setBvn] = useState('');
  const [vaLoading, setVaLoading] = useState(false);
  const [vaError, setVaError] = useState('');

  useEffect(() => { if (user) fetchData(); }, [user]);

  async function fetchData() {
    const { data: svc } = await supabase.from('service_settings').select('*').eq('id', 1).maybeSingle();
    if (svc) setServiceSettings({
      airtime_enabled: svc.airtime_enabled ?? true,
      data_enabled: svc.data_enabled ?? true,
      virtual_sms_enabled: svc.virtual_sms_enabled ?? true,
      bulk_sms_enabled: svc.bulk_sms_enabled ?? true,
      airtime_to_cash_enabled: svc.airtime_to_cash_enabled ?? true,
      betting_enabled: svc.betting_enabled ?? true,
    });
    const { data: w, error: walletErr } = await supabase
      .from('wallets').select('id, balance, currency')
      .eq('user_id', user?.id).eq('is_active', true).single();
    if (w) setWallet(w);
    if (walletErr) alert('WALLET ERROR: ' + JSON.stringify(walletErr) + ' | uid=' + String(user?.id));
    const { data: txns } = await supabase
      .from('transactions').select('*').eq('user_id', user?.id)
      .order('created_at', { ascending: false }).limit(5);
    if (txns) setTransactions(txns);
  }

  const copyReferral = () => {
    navigator.clipboard.writeText(profile?.referral_code ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function checkVirtualAccount() {
    const { data } = await supabase.from('virtual_accounts')
      .select('account_number, bank_name').eq('user_id', user?.id).single();
    if (data) setVirtualAccount(data);
  }

  async function createVirtualAccount() {
    setVaError('');
    if (!bvn || bvn.length !== 11 || !/^\d+$/.test(bvn)) { setVaError('Enter a valid 11-digit BVN'); return; }
    setVaLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const { data, error } = await supabase.functions.invoke('paystack-create-virtual-account', {
      headers: { Authorization: `Bearer ${token}` }, body: { bvn },
    });
    setVaLoading(false);
    if (error || data?.error) { setVaError(data?.error || 'Failed to create account. Please try again.'); return; }
    setVirtualAccount({ account_number: data.account_number, bank_name: data.bank_name });
  }

  const handleFund = async () => {
    setError('');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) { setError('Minimum amount is ₦100'); return; }
    if (!wallet?.id) { setError('Wallet not found. Please contact support.'); return; }
    setLoading(true);
    await fundWallet({
      amount: numAmount, userEmail: user?.email ?? '',
      userName: profile?.full_name ?? 'PrimeConnect User',
      userPhone: profile?.phone ?? '08000000000',
      userId: user?.id ?? '', walletId: wallet.id,
      onSuccess: () => { setShowFund(false); setAmount(''); setLoading(false); fetchData(); },
      onError: (msg) => { setError(msg); setLoading(false); },
    });
  };

  const quickActions = [
    { label: 'Airtime',      icon: <Phone className="w-6 h-6" />,        path: '/services/airtime' },
    { label: 'Data',         icon: <Wifi className="w-6 h-6" />,         path: '/services/data' },
    { label: 'Cable TV',     icon: <Tv className="w-6 h-6" />,           path: '/services/tv-subscription' },
    { label: 'Electricity',  icon: <Zap className="w-6 h-6" />,          path: '/services/electricity' },
    { label: 'Transactions', icon: <History className="w-6 h-6" />,      path: '/transactions' },
    { label: 'Transfer',     icon: <Send className="w-6 h-6" />,         path: '/withdrawal' },
    { label: 'Withdraw',     icon: <ArrowUpRight className="w-6 h-6" />, path: '/withdrawal' },
    { label: 'More',         icon: <CreditCard className="w-6 h-6" />,   path: '/services' },
  ];

  const firstName = profile?.full_name?.split(' ')?.[0] ?? 'User';
  const avatarInitials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';
  const referralEarnings = profile?.referral_earnings ?? 0;

  const getTransactionIcon = (txn: Transaction) => {
    const desc = (txn.description ?? '').toLowerCase();
    if (desc.includes('airtime')) return <Phone className="w-4 h-4 text-blue-500" />;
    if (desc.includes('data')) return <Wifi className="w-4 h-4 text-green-500" />;
    if (desc.includes('electricity') || desc.includes('power')) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (desc.includes('fund') || desc.includes('wallet') || desc.includes('transfer')) return <Wallet className="w-4 h-4 text-indigo-500" />;
    return txn.type === 'credit' ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />;
  };

  const getTransactionBg = (txn: Transaction) => {
    const desc = (txn.description ?? '').toLowerCase();
    if (desc.includes('airtime')) return 'bg-blue-50';
    if (desc.includes('data')) return 'bg-green-50';
    if (desc.includes('electricity') || desc.includes('power')) return 'bg-yellow-50';
    if (desc.includes('fund') || desc.includes('wallet') || desc.includes('transfer')) return 'bg-indigo-50';
    return txn.type === 'credit' ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto">

        {/* ── Header ── */}
        <div className="px-4 pt-12 pb-20 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)' }}>
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
          <div className="absolute -left-6 bottom-0 w-32 h-32 rounded-full bg-white/5" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-base overflow-hidden border-2 border-white/20">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    : avatarInitials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium">
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
                </p>
                <p className="text-white font-black text-base leading-tight">{firstName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/referral')}
                className="flex items-center gap-1.5 bg-white/15 border border-white/10 rounded-2xl px-3 py-2">
                <Star className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-xs font-black text-white">₦{Number(referralEarnings).toLocaleString('en-NG', { minimumFractionDigits: 0 })}</span>
              </button>
              <button onClick={() => navigate('/notifications')}
                className="relative w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-black">3</span>
              </button>
            </div>
          </div>
        </div>
{/* ── Wallet Card ── */}
        <div className="mx-4 -mt-12 relative z-10 mb-4">
          <div className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 50%, #1e3a8a 100%)' }}>
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute -left-4 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 20px)' }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
                </div>
                <button onClick={() => setShowBalance(!showBalance)}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  {showBalance ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
                </button>
              </div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Available</p>
              <p className="text-4xl font-black tracking-tight mb-5">
                {showBalance
                  ? `₦${(wallet?.balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                  : '₦ ••••••'}
              </p>
              <div className="border-t border-white/10 mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Add Money', icon: <Plus className="w-5 h-5" />, action: () => { setShowFund(true); checkVirtualAccount(); } },
                  { label: 'Transfer',  icon: <Send className="w-5 h-5" />,         action: () => navigate('/withdrawal') },
                  { label: 'Withdraw',  icon: <ArrowUpRight className="w-5 h-5" />, action: () => navigate('/withdrawal') },
                  { label: 'History',   icon: <History className="w-5 h-5" />,      action: () => navigate('/transactions') },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.action}
                    className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                      {btn.icon}
                    </div>
                    <span className="text-white/70 text-[10px] font-semibold">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="mx-4 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-gray-900 text-base">Quick Actions</h2>
                <p className="text-gray-400 text-xs mt-0.5">What do you want to do?</p>
              </div>
              <button onClick={() => navigate('/services')}
                className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl">
                View All →
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <button key={action.label}
                  onClick={() => action.path ? navigate(action.path) : (setShowFund(true), checkVirtualAccount())}
                  className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-blue-50 text-blue-600">
                    {action.icon}
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Promo Banner ── */}
        <div className="mx-4 mb-4">
          <div className="rounded-3xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' }}>
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute right-4 bottom-0 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative">
              <p className="text-white/70 text-xs font-semibold mb-1">Special Offer</p>
              <h3 className="text-white font-black text-lg leading-tight mb-1">Airtime & Data<br />Made Easy</h3>
              <p className="text-white/60 text-xs mb-4">Top up anytime, anywhere</p>
              <button onClick={() => navigate('/services/airtime')}
                className="bg-white text-blue-600 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all">
                Buy Now →
              </button>
            </div>
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="mx-4 mb-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-gray-900 text-base">Recent Transactions</h2>
              <p className="text-gray-400 text-xs mt-0.5">Your latest activity</p>
            </div>
            <button onClick={() => navigate('/transactions')}
              className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-xl">
              View All
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-500 text-sm font-bold mb-1">No transactions yet</p>
              <p className="text-gray-300 text-xs mb-4">Fund your wallet to get started</p>
              <button onClick={() => { setShowFund(true); checkVirtualAccount(); }}
                className="text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
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
                      <p className="text-sm font-bold text-gray-800 leading-tight">{txn.description ?? 'Transaction'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(txn.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${txn.type === 'credit' ? 'text-green-500' : 'text-gray-800'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      txn.status === 'success' ? 'bg-green-50 text-green-600' :
                      txn.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
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
 {/* ── Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-40 max-w-md mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="w-6 h-6 text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <span className="text-[10px] text-blue-600 font-bold">Home</span>
        </button>
        <button onClick={() => navigate('/transactions')} className="flex flex-col items-center gap-0.5 flex-1">
          <History className="w-6 h-6 text-gray-400" />
          <span className="text-[10px] text-gray-400">Transactions</span>
        </button>
        <button onClick={() => navigate('/scan')} className="flex flex-col items-center gap-0.5 flex-1 -mt-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] text-gray-400 mt-1">Scan/Pay</span>
        </button>
        <button onClick={() => navigate('/services')} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-400 rounded-sm" />)}
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

      {/* ── Fund Wallet Modal ── */}
      {showFund && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl">
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div>
                <h2 className="text-lg font-black text-gray-900">Fund Wallet</h2>
                <p className="text-xs text-gray-400 mt-0.5">Add money to your PrimeConnect wallet</p>
              </div>
              <button onClick={() => { setShowFund(false); setError(''); setAmount(''); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-6 pt-4">
              <div className="flex gap-1 mb-5 bg-gray-100 rounded-2xl p-1">
                {(['card', 'bank'] as const).map(tab => (
                  <button key={tab} onClick={() => setFundTab(tab)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${fundTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                    {tab === 'card' ? '💳 Card / USSD' : '🏦 Bank Transfer'}
                  </button>
                ))}
              </div>
              {fundTab === 'card' && (
                <>
                  <div className="relative mb-4">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-gray-400 text-xs font-bold">NGN</span>
                      <div className="w-px h-4 bg-gray-200 mx-1" />
                      <span className="text-gray-700 font-bold">₦</span>
                    </div>
                    <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                      className="w-full pl-20 pr-4 py-4 border-2 border-gray-100 rounded-2xl text-xl font-black text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {QUICK_AMOUNTS.map(q => (
                      <button key={q} onClick={() => setAmount(String(q))}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100'}`}>
                        ₦{q.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <p className="text-xs text-red-600 font-medium">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3 mb-4">
                    <button onClick={() => { setShowFund(false); setError(''); setAmount(''); }}
                      className="flex-1 border-2 border-gray-100 py-3.5 rounded-2xl text-sm font-bold text-gray-600">
                      Cancel
                    </button>
                    <button onClick={handleFund} disabled={loading || !amount}
                      className="flex-1 text-white py-3.5 rounded-2xl text-sm font-black disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                        : `Pay ₦${Number(amount || 0).toLocaleString()}`}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 pb-6">
                    <span className="text-xs text-gray-400">🔒 256-bit SSL</span>
                    <div className="w-px h-3 bg-gray-200" />
                    <span className="text-xs text-gray-400">⚡ Instant Credit</span>
                    <div className="w-px h-3 bg-gray-200" />
                    <span className="text-xs text-gray-400">Secured by Paystack</span>
                  </div>
                </>
              )}
              {fundTab === 'bank' && (
                <div className="pb-6">
                  {virtualAccount ? (
                    <>
                      <p className="text-xs text-gray-500 mb-3 text-center">Send to this dedicated account — funds credit within minutes</p>
                      <div className="rounded-2xl p-5 mb-4 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                        <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wide">Bank Name</p>
                        <p className="text-white font-black text-base mb-4">{virtualAccount.bank_name}</p>
                        <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wide">Account Number</p>
                        <div className="flex items-center justify-between">
                          <p className="text-white text-2xl font-black tracking-[0.15em]">{virtualAccount.account_number}</p>
                          <button onClick={() => { navigator.clipboard.writeText(virtualAccount.account_number); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                            className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl active:scale-95">
                            {copied ? <><CheckCircle className="w-3.5 h-3.5 text-green-300" /><span className="text-white text-xs font-bold">Copied!</span></> : <><Copy className="w-3.5 h-3.5 text-white" /><span className="text-white text-xs font-bold">Copy</span></>}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                        <span className="text-blue-500 text-sm mt-0.5">ℹ️</span>
                        <p className="text-xs text-blue-700 leading-relaxed">This is your dedicated account. Any transfer here is automatically credited to your wallet.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                        <p className="text-xs font-black text-blue-700 mb-2">🏦 Pay via Bank Transfer</p>
                        <ol className="text-xs text-blue-600 space-y-1.5">
                          <li>1. Enter amount and tap Pay Now below</li>
                          <li>2. Select Bank Transfer in the payment popup</li>
                          <li>3. Transfer to the account shown — wallet credited instantly</li>
                        </ol>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[500, 1000, 2000, 5000, 10000, 20000].map((q) => (
                          <button key={q} onClick={() => setAmount(String(q))}
                            className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
                            ₦{q.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₦</span>
                        <input type="number" placeholder="Other amount" value={amount} onChange={e => setAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 text-sm focus:outline-none focus:border-blue-500 bg-gray-50" />
                      </div>
                      <button onClick={() => {
                        if (!amount || Number(amount) < 100) { setError('Minimum amount is ₦100'); return; }
                        fundWallet({ amount: Number(amount), userEmail: profile?.email ?? '', userName: profile?.full_name ?? '', userPhone: profile?.phone ?? '', userId: user?.id ?? '', walletId: wallet?.id ?? '', onSuccess: () => { setShowFund(false); setAmount(''); fetchData(); }, onError: (msg: string) => setError(msg) });
                      }} className="w-full text-white font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>
                        🏦 Pay via Bank Transfer {amount ? `— ₦${Number(amount).toLocaleString()}` : ''}
                      </button>
                    </>
                  )}
                  <button onClick={() => { setShowFund(false); setError(''); setAmount(''); }}
                    className="w-full border-2 border-gray-100 py-3 rounded-2xl text-sm font-bold text-gray-600 mt-3">
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
