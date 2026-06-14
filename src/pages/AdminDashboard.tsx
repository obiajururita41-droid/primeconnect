import AdminLayout from "../components/admin/AdminLayout";
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Wallet, ArrowUpRight, Gift, RefreshCw,
  CheckCircle, XCircle, Search, TrendingUp,
  Phone, Wifi, MessageSquare,
  Bell, ChevronRight, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Stats {
  totalUsers: number;
  totalWalletBalance: number;
  totalTransactions: number;
  pendingGiftCards: number;
  todayTransactions: number;
  totalRevenue: number;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  reference: string;
  created_at: string;
  metadata: any;
  profiles?: { full_name: string; email: string };
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  wallets?: { balance: number }[];
}

export default function AdminDashboard() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'overview' | 'transactions' | 'users' | 'giftcards' | 'wallets' | 'withdrawals' | 'referrals' | 'settings'>('overview');
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [giftCards, setGiftCards] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && user && !isAdmin) navigate('/dashboard');
  }, [user, isAdmin, authLoading]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchStats(), fetchTransactions(), fetchUsers(), fetchGiftCards(), fetchWallets(), fetchWithdrawals(), fetchReferrals()]);
    setLoading(false);
  }

  async function fetchStats() {
    const [usersRes, walletsRes, txRes, pendingRes, todayRes, revenueRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('wallets').select('balance'),
      supabase.from('transactions').select('id', { count: 'exact' }),
      supabase.from('transactions').select('id', { count: 'exact' }).eq('type', 'gift_card').eq('status', 'pending'),
      supabase.from('transactions').select('id', { count: 'exact' }).gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('transactions').select('amount').eq('type', 'credit').eq('status', 'success'),
    ]);
    const totalBalance = walletsRes.data?.reduce((s, w) => s + Number(w.balance), 0) ?? 0;
    const totalRevenue = revenueRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    setStats({
      totalUsers: usersRes.count ?? 0,
      totalWalletBalance: totalBalance,
      totalTransactions: txRes.count ?? 0,
      pendingGiftCards: pendingRes.count ?? 0,
      todayTransactions: todayRes.count ?? 0,
      totalRevenue,
    });
  }

  async function fetchTransactions() {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles:user_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setTransactions(data);
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, wallets(balance)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setUsers(data as any);
  }

  async function fetchReferrals() {
    const { data } = await supabase
      .from('referrals')
      .select('*, referrer:referrer_id(full_name, email), referred:referred_id(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setReferrals(data);
  }

  async function fetchWithdrawals() {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*, profiles:user_id(full_name, email, phone)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setWithdrawals(data);
  }

  async function fetchWallets() {
    const { data } = await supabase
      .from('wallets')
      .select('*, profiles:user_id(full_name, email)')
      .order('balance', { ascending: false })
      .limit(100);
    if (data) setWallets(data);
  }

  async function fetchGiftCards() {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles:user_id(full_name, email)')
      .eq('type', 'gift_card')
      .order('created_at', { ascending: false });
    if (data) setGiftCards(data);
  }

  async function updateGiftCard(id: string, status: string, userId: string, reference: string) {
    if (status === 'success') {
      const amt = prompt('Enter NGN amount to credit user:');
      if (!amt) return;
      await supabase.rpc('credit_wallet', { p_user_id: userId, p_amount: Number(amt), p_reference: reference });
    } else {
      await supabase.from('transactions').update({ status }).eq('id', id);
    }
    fetchGiftCards(); fetchStats();
  }

  async function toggleUserStatus(userId: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId);
    fetchUsers();
  }

  async function creditUser(userId: string) {
    const amt = prompt('Enter amount to credit:');
    if (!amt || isNaN(Number(amt))) return;
    const ref = `PC-ADMIN-${Date.now()}`;
    await supabase.from('transactions').insert({
      user_id: userId, type: 'credit', status: 'pending',
      amount: Number(amt), description: 'Admin credit', reference: ref, metadata: { admin: user?.id },
    });
    await supabase.rpc('credit_wallet', { p_user_id: userId, p_amount: Number(amt), p_reference: ref });
    fetchUsers(); fetchStats();
    alert('Wallet credited!');
  }

  const filteredTx = transactions.filter(tx => {
    const s = search.toLowerCase();
    const matchSearch = !search || tx.description?.toLowerCase().includes(s) || tx.reference?.toLowerCase().includes(s) || tx.profiles?.email?.toLowerCase().includes(s);
    const matchFilter = filter === 'all' || tx.status === filter || tx.type === filter;
    return matchSearch && matchFilter;
  });

  const filteredUsers = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Users',       value: stats?.totalUsers ?? 0,                                    icon: <Users className="w-5 h-5" />,         color: 'bg-blue-500',   trend: '' },
    { label: 'Wallet Balance',    value: `₦${(stats?.totalWalletBalance ?? 0).toLocaleString()}`,   icon: <Wallet className="w-5 h-5" />,        color: 'bg-green-500',  trend: '' },
    { label: 'Total Revenue',     value: `₦${(stats?.totalRevenue ?? 0).toLocaleString()}`,         icon: <TrendingUp className="w-5 h-5" />,     color: 'bg-purple-500', trend: '' },
    { label: 'Transactions',      value: stats?.totalTransactions ?? 0,                             icon: <ArrowUpRight className="w-5 h-5" />,  color: 'bg-orange-500', trend: '' },
    { label: 'Pending Gift Cards',value: stats?.pendingGiftCards ?? 0,                              icon: <Gift className="w-5 h-5" />,          color: 'bg-pink-500',   trend: '' },
    { label: "Today's Activity",  value: stats?.todayTransactions ?? 0,                             icon: <Activity className="w-5 h-5" />,      color: 'bg-teal-500',   trend: '' },
  ];

  const quickActions = [
    { label: 'Approve Gift Cards', icon: <Gift className="w-5 h-5" />,         color: 'bg-pink-50 text-pink-600',   onClick: () => setTab('giftcards') },
    { label: 'Manage Users',       icon: <Users className="w-5 h-5" />,        color: 'bg-blue-50 text-blue-600',   onClick: () => setTab('users') },
    { label: 'Transactions',       icon: <Wallet className="w-5 h-5" />,       color: 'bg-green-50 text-green-600', onClick: () => setTab('transactions') },
    { label: 'Refresh Data',       icon: <RefreshCw className="w-5 h-5" />,    color: 'bg-gray-50 text-gray-600',   onClick: fetchAll },
  ];

  const serviceStats = [
    { label: 'Airtime',      pct: 45, color: 'from-blue-500 to-blue-600',     bg: 'bg-blue-50',   text: 'text-blue-700',   icon: <Phone className="w-4 h-4" /> },
    { label: 'Data',         pct: 25, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', icon: <Wifi className="w-4 h-4" /> },
    { label: 'Gift Cards',   pct: 15, color: 'from-pink-500 to-rose-600',     bg: 'bg-pink-50',   text: 'text-pink-700',   icon: <Gift className="w-4 h-4" /> },
    { label: 'Virtual SMS',  pct: 10, color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Bulk SMS',     pct:  5, color: 'from-teal-500 to-emerald-500',  bg: 'bg-teal-50',   text: 'text-teal-700',   icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const navItems = [
    { label: 'Overview',     icon: <Activity className="w-4 h-4" />,        tab: 'overview',      badge: 0 },
    { label: 'Transactions', icon: <ArrowUpRight className="w-4 h-4" />,    tab: 'transactions',  badge: stats?.todayTransactions ?? 0 },
    { label: 'Users',        icon: <Users className="w-4 h-4" />,           tab: 'users',         badge: 0 },
    { label: 'Gift Cards',   icon: <Gift className="w-4 h-4" />,            tab: 'giftcards',     badge: stats?.pendingGiftCards ?? 0 },
    { label: 'Wallets',      icon: <Wallet className="w-4 h-4" />,          tab: 'wallets',       badge: 0 },
    { label: 'Withdrawals',  icon: <ArrowUpRight className="w-4 h-4" />,    tab: 'withdrawals',   badge: withdrawals.filter(w => w.status === 'pending').length },
    { label: 'Referrals',    icon: <ChevronRight className="w-4 h-4" />,    tab: 'referrals',     badge: 0 },
    { label: 'Settings',     icon: <Activity className="w-4 h-4" />,        tab: 'settings',      badge: 0 },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-64 bg-gray-900 shrink-0 min-h-screen p-4 gap-3">
          <div className="h-8 w-36 bg-gray-700 rounded-lg animate-pulse mb-4" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-800 rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
        {/* Main skeleton */}
        <div className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="h-16 bg-white rounded-2xl animate-pulse shadow-sm" />
          {/* Welcome */}
          <div className="space-y-2">
            <div className="h-7 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          {/* Content rows */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab} pendingGiftCards={stats?.pendingGiftCards ?? 0}>

      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">PC</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">PrimeConnect</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="w-4 h-4 text-gray-600" />
              {(stats?.pendingGiftCards ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">
                  {profile?.full_name?.charAt(0) ?? 'A'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-900">{profile?.full_name ?? 'Admin'}</p>
                <p className="text-xs text-green-500">● Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Welcome */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h1 className="text-xl font-black text-white">
                  Welcome back, {profile?.full_name?.split(' ')?.[0] ?? 'Admin'} 👋
                </h1>
                <p className="text-blue-200 text-xs mt-1">Here's your PrimeConnect platform summary.</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-black">{profile?.full_name?.charAt(0) ?? 'A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-white font-black text-lg">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
                <p className="text-blue-200 text-[10px] font-semibold">Total Users</p>
              </div>
              <div className="text-center border-x border-white/20">
                <p className="text-white font-black text-lg">{stats?.todayTransactions ?? 0}</p>
                <p className="text-blue-200 text-[10px] font-semibold">Today's Txns</p>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg">{stats?.pendingGiftCards ?? 0}</p>
                <p className="text-blue-200 text-[10px] font-semibold">Pending Cards</p>
              </div>
            </div>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: (stats?.totalUsers ?? 0).toLocaleString(), icon: <Users className="w-5 h-5" />, trend: '+12%', sub: 'Registered accounts', gradient: 'from-blue-600 to-blue-700', glow: 'shadow-blue-500/25', urgent: false },
            { label: 'Wallet Balance', value: `₦${(stats?.totalWalletBalance ?? 0).toLocaleString()}`, icon: <Wallet className="w-5 h-5" />, trend: '+8%', sub: 'Total held in wallets', gradient: 'from-emerald-500 to-green-600', glow: 'shadow-green-500/25', urgent: false },
            { label: 'Total Revenue', value: `₦${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, trend: '+15%', sub: 'Lifetime earnings', gradient: 'from-violet-600 to-purple-700', glow: 'shadow-purple-500/25', urgent: false },
            { label: 'Transactions', value: (stats?.totalTransactions ?? 0).toLocaleString(), icon: <ArrowUpRight className="w-5 h-5" />, trend: '+5%', sub: 'All time volume', gradient: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/25', urgent: false },
            { label: 'Pending Gift Cards', value: (stats?.pendingGiftCards ?? 0).toLocaleString(), icon: <Gift className="w-5 h-5" />, trend: null, sub: 'Awaiting review', gradient: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/25', urgent: (stats?.pendingGiftCards ?? 0) > 0 },
            { label: "Today's Activity", value: (stats?.todayTransactions ?? 0).toLocaleString(), icon: <Activity className="w-5 h-5" />, trend: null, sub: 'Transactions today', gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/25', urgent: false },
          ].map((s) => (
            <div key={s.label} className={`relative bg-gradient-to-br ${s.gradient} rounded-2xl p-4 shadow-lg ${s.glow} overflow-hidden group hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full bg-white/5" />
              <div className="flex items-start justify-between mb-3 relative">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                  {s.icon}
                </div>
                {s.urgent ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full animate-pulse">
                    ● Action needed
                  </span>
                ) : s.trend ? (
                  <span className="text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">
                    ▲ {s.trend}
                  </span>
                ) : null}
              </div>
              <p className="text-2xl font-black text-white leading-none tracking-tight mb-1 relative">{s.value}</p>
              <p className="text-xs font-semibold text-white/80 mb-0.5 relative">{s.label}</p>
              <p className="text-[10px] text-white/50 relative">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {navItems.map((n) => (
            <button
              key={n.tab}
              onClick={() => setTab(n.tab as any)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                tab === n.tab
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span className={tab === n.tab ? 'text-white' : 'text-gray-400'}>{n.icon}</span>
              {n.label}
              {!!n.badge && n.badge > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center ${
                  tab === n.tab ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                }`}>
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        {tab === 'users' && (
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === 'users' ? 'Search users...' : 'Search transactions...'}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
              />
            </div>
            {tab === 'transactions' && (
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-4">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Users',        value: stats?.totalUsers ?? 0,                                          icon: <Users className="w-4 h-4" />,        accent: 'border-l-blue-500',   iconBg: 'bg-blue-50 text-blue-600',   trend: '+12%' },
                { label: 'Wallet Balance',     value: `₦${(stats?.totalWalletBalance ?? 0).toLocaleString()}`,         icon: <Wallet className="w-4 h-4" />,       accent: 'border-l-green-500',  iconBg: 'bg-green-50 text-green-600', trend: '+8%' },
                { label: 'Total Revenue',      value: `₦${(stats?.totalRevenue ?? 0).toLocaleString()}`,               icon: <TrendingUp className="w-4 h-4" />,   accent: 'border-l-purple-500', iconBg: 'bg-purple-50 text-purple-600', trend: '+15%' },
                { label: 'Transactions',       value: stats?.totalTransactions ?? 0,                                   icon: <ArrowUpRight className="w-4 h-4" />, accent: 'border-l-orange-500', iconBg: 'bg-orange-50 text-orange-600', trend: '+5%' },
                { label: 'Pending Gift Cards', value: stats?.pendingGiftCards ?? 0,                                    icon: <Gift className="w-4 h-4" />,         accent: 'border-l-pink-500',   iconBg: 'bg-pink-50 text-pink-600',   trend: '' },
                { label: "Today's Activity",   value: stats?.todayTransactions ?? 0,                                   icon: <Activity className="w-4 h-4" />,     accent: 'border-l-teal-500',   iconBg: 'bg-teal-50 text-teal-600',   trend: '' },
              ].map((s) => (
                <div key={s.label} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 ${s.accent}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.iconBg}`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none mb-1">{s.value}</p>
                  <p className="text-xs text-gray-400 font-medium mb-1">{s.label}</p>
                  {s.trend ? (
                    <p className="text-[10px] text-green-500 font-bold">▲ {s.trend} this month</p>
                  ) : (
                    <p className="text-[10px] text-yellow-500 font-bold">⏳ Needs attention</p>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Common admin tasks</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">6 actions</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Approve Gift Cards', icon: <Gift className="w-5 h-5" />, gradient: 'from-pink-500 to-rose-500', onClick: () => setTab('giftcards'), badge: stats?.pendingGiftCards, sub: 'Review pending' },
                  { label: 'Manage Users', icon: <Users className="w-5 h-5" />, gradient: 'from-blue-500 to-blue-600', onClick: () => setTab('users'), badge: null, sub: 'View all users' },
                  { label: 'Withdrawals', icon: <ArrowUpRight className="w-5 h-5" />, gradient: 'from-orange-500 to-amber-500', onClick: () => setTab('withdrawals'), badge: withdrawals.filter(w => w.status === 'pending').length || null, sub: 'Process requests' },
                  { label: 'Transactions', icon: <Wallet className="w-5 h-5" />, gradient: 'from-emerald-500 to-green-600', onClick: () => setTab('transactions'), badge: null, sub: 'View history' },
                  { label: 'Referrals', icon: <TrendingUp className="w-5 h-5" />, gradient: 'from-violet-500 to-purple-600', onClick: () => setTab('referrals'), badge: null, sub: 'Track bonuses' },
                  { label: 'Refresh Data', icon: <RefreshCw className="w-5 h-5" />, gradient: 'from-gray-500 to-gray-600', onClick: fetchAll, badge: null, sub: 'Sync latest' },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className="relative flex flex-col items-start p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all active:scale-95 group overflow-hidden"
                  >
                    <div className="absolute -right-4 -bottom-4 w-14 h-14 rounded-full bg-gray-200/30 group-hover:scale-110 transition-transform duration-300" />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white mb-3 shadow-sm`}>
                      {a.icon}
                    </div>
                    <span className="text-sm font-bold text-gray-800 leading-tight">{a.label}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">{a.sub}</span>
                    {a.badge ? (
                      <span className="absolute top-3 right-3 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {a.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Latest platform transactions</p>
                </div>
                <button onClick={() => setTab('transactions')} className="text-xs text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">View all →</button>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-bold mb-1">No activity yet</p>
                  <p className="text-gray-300 text-xs">Transactions will appear here once users start transacting</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {transactions.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit' ? 'bg-green-100' :
                        tx.type === 'gift_card' ? 'bg-purple-100' :
                        tx.type === 'debit' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {tx.type === 'credit' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> :
                         tx.type === 'gift_card' ? <Gift className="w-4 h-4 text-purple-600" /> :
                         <Wallet className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{tx.description ?? 'Transaction'}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {tx.profiles?.email} • {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}&#8358;{Number(tx.amount).toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                          tx.status === 'success' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status === 'success' ? '✓ Success' : tx.status === 'pending' ? '⏳ Pending' : '✕ Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services Overview */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">Services Overview</h2>
              <div className="space-y-4">
                {[
                  { label: 'Airtime',     icon: <Phone className="w-4 h-4" />,         iconBg: 'bg-yellow-100 text-yellow-600', bar: 'bg-yellow-400', pct: 45 },
                  { label: 'Data',        icon: <Wifi className="w-4 h-4" />,          iconBg: 'bg-green-100 text-green-600',   bar: 'bg-green-500',  pct: 25 },
                  { label: 'Gift Cards',  icon: <Gift className="w-4 h-4" />,          iconBg: 'bg-purple-100 text-purple-600', bar: 'bg-purple-500', pct: 15 },
                  { label: 'Virtual SMS', icon: <MessageSquare className="w-4 h-4" />, iconBg: 'bg-blue-100 text-blue-600',    bar: 'bg-blue-500',   pct: 10 },
                  { label: 'Bulk SMS',    icon: <MessageSquare className="w-4 h-4" />, iconBg: 'bg-teal-100 text-teal-600',    bar: 'bg-teal-500',   pct: 5 },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}>{s.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                        <span className="text-xs font-bold text-gray-500">{s.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${s.bar} h-2 rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab === 'transactions' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">All Transactions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredTx.length} records found</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">{transactions.length} total</span>
                </div>
              </div>
              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by email, description, ref..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <select
                  className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-3 outline-none focus:border-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="gift_card">Gift Card</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              {/* Filter Pills */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {['all','credit','debit','gift_card','success','pending','failed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'gift_card' ? 'Gift Card' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredTx.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-600 font-bold text-sm mb-1">No transactions found</p>
                  <p className="text-gray-300 text-xs">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredTx.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          tx.type === 'credit' ? 'bg-green-100' :
                          tx.type === 'gift_card' ? 'bg-purple-100' :
                          'bg-red-100'
                        }`}>
                          {tx.type === 'credit'
                            ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                            : tx.type === 'gift_card'
                            ? <Gift className="w-4 h-4 text-purple-600" />
                            : <Wallet className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{tx.description ?? 'Transaction'}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{tx.profiles?.email}</p>
                              <p className="text-[10px] text-gray-300 font-mono mt-0.5 truncate">{tx.reference}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                {tx.type === 'credit' ? '+' : '-'}&#8358;{Number(tx.amount).toLocaleString()}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                                tx.status === 'success' ? 'bg-green-100 text-green-700' :
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {tx.status === 'success' ? '✓ Success' : tx.status === 'pending' ? '⏳ Pending' : '✕ Failed'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-300 mt-1">
                            {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">User Management</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredUsers.length} users found</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">{users.length} total</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-600 font-bold text-sm mb-1">No users found</p>
                <p className="text-gray-300 text-xs">Try adjusting your search</p>
              </div>
            ) : filteredUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-base font-bold">{u.full_name?.charAt(0) ?? 'U'}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.full_name ?? 'Unknown'}</p>
                      {u.is_verified && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    <p className="text-xs text-gray-400">{u.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-gray-900">&#8358;{(u.wallets?.[0]?.balance ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Wallet balance</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-[10px] text-gray-400">
                    Joined {new Date(u.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => creditUser(u.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Wallet className="w-3.5 h-3.5" /> Credit Wallet
                  </button>
                  <button
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-colors ${
                      u.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                    }`}
                  >
                    {u.is_active ? <><XCircle className="w-3.5 h-3.5" /> Deactivate</> : <><CheckCircle className="w-3.5 h-3.5" /> Activate</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GIFT CARDS TAB */}
        {tab === 'giftcards' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">Gift Card Submissions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{giftCards.length} total submissions</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${(stats?.pendingGiftCards ?? 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {stats?.pendingGiftCards ?? 0} pending
                </span>
              </div>
              {/* Summary Pills */}
              <div className="flex gap-2">
                <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-yellow-600">{giftCards.filter(g => g.status === 'pending').length}</p>
                  <p className="text-[10px] text-yellow-500 font-semibold">Pending</p>
                </div>
                <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-green-600">{giftCards.filter(g => g.status === 'success').length}</p>
                  <p className="text-[10px] text-green-500 font-semibold">Approved</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-red-600">{giftCards.filter(g => g.status === 'failed').length}</p>
                  <p className="text-[10px] text-red-500 font-semibold">Rejected</p>
                </div>
              </div>
            </div>

            {/* Gift Card List */}
            {giftCards.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-600 font-bold text-sm mb-1">No submissions yet</p>
                <p className="text-gray-300 text-xs">Gift card submissions will appear here</p>
              </div>
            ) : giftCards.map((gc) => (
              <div key={gc.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${gc.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'}`}>
                {/* Status Banner for pending */}
                {gc.status === 'pending' && (
                  <div className="flex items-center gap-2 bg-yellow-50 rounded-xl px-3 py-2 mb-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-yellow-700">Awaiting Review</p>
                  </div>
                )}

                {/* Card Info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {gc.metadata?.card_type ?? 'Gift Card'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {gc.metadata?.card_currency} {gc.metadata?.declared_value}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{gc.profiles?.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    gc.status === 'success' ? 'bg-green-100 text-green-700' :
                    gc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {gc.status === 'success' ? '✓ Approved' : gc.status === 'pending' ? '⏳ Pending' : '✕ Rejected'}
                  </span>
                </div>

                {/* Meta */}
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-[10px] text-gray-400 font-mono">{gc.reference}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(gc.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                {gc.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGiftCard(gc.id, 'success', gc.user_id, gc.reference)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Credit
                    </button>
                    <button
                      onClick={() => updateGiftCard(gc.id, 'failed', gc.user_id, gc.reference)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        {/* REFERRALS TAB */}
        {tab === 'referrals' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: referrals.length, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
                { label: 'Paid', value: referrals.filter(r => r.bonus_paid).length, color: 'from-emerald-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700' },
                { label: 'Pending', value: referrals.filter(r => !r.bonus_paid).length, color: 'from-amber-500 to-orange-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                  <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                  <p className={`text-[10px] font-bold ${s.text} opacity-70`}>{s.label}</p>
                </div>
              ))}
            </div>
            {referrals.filter(r =>
              !search ||
              r.referrer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referred?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referrer?.email?.toLowerCase().includes(search.toLowerCase())
            ).length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-7 h-7 text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold text-sm">No referrals found</p>
              </div>
            ) : referrals.filter(r =>
              !search ||
              r.referrer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referred?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referrer?.email?.toLowerCase().includes(search.toLowerCase())
            ).map((r) => (
              <div key={r.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${!r.bonus_paid ? 'border-yellow-200' : 'border-gray-100'}`}>
                {/* Referrer → Referred */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Referrer */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">{r.referrer?.full_name?.charAt(0) ?? 'R'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.referrer?.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.referrer?.email}</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  {/* Referred */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">{r.referred?.full_name?.charAt(0) ?? 'U'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.referred?.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.referred?.email}</p>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400">
                    {new Date(r.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.bonus_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.bonus_paid ? '✓ Bonus Paid' : '⏳ Pending'}
                    </span>
                    {!r.bonus_paid && (
                      <button
                        onClick={async () => {
                          await supabase.from('referrals').update({ bonus_paid: true }).eq('id', r.id);
                          fetchReferrals();
                        }}
                        className="text-[10px] font-bold py-1 px-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {tab === 'withdrawals' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">Withdrawal Requests</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{withdrawals.length} total requests</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${withdrawals.filter(w => w.status === 'pending').length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {withdrawals.filter(w => w.status === 'pending').length} pending
                </span>
              </div>
              {/* Summary Pills */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Pending', count: withdrawals.filter(w => w.status === 'pending').length, color: 'bg-yellow-50 text-yellow-600' },
                  { label: 'Approved', count: withdrawals.filter(w => w.status === 'approved').length, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Completed', count: withdrawals.filter(w => w.status === 'completed').length, color: 'bg-green-50 text-green-600' },
                  { label: 'Rejected', count: withdrawals.filter(w => w.status === 'rejected' || w.status === 'failed').length, color: 'bg-red-50 text-red-600' },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} rounded-xl p-2 text-center`}>
                    <p className="text-base font-black">{s.count}</p>
                    <p className="text-[10px] font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <select
                  className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-3 outline-none focus:border-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Withdrawal List */}
            {withdrawals.filter(w =>
              (filter === 'all' || w.status === filter) &&
              (!search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase()))
            ).length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ArrowUpRight className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-600 font-bold text-sm mb-1">No withdrawal requests</p>
                <p className="text-gray-300 text-xs">Requests will appear here</p>
              </div>
            ) : withdrawals.filter(w =>
              (filter === 'all' || w.status === filter) &&
              (!search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase()))
            ).map((w) => (
              <div key={w.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${w.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'}`}>
                {/* Pending Banner */}
                {w.status === 'pending' && (
                  <div className="flex items-center gap-2 bg-yellow-50 rounded-xl px-3 py-2 mb-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-yellow-700">Awaiting Approval</p>
                  </div>
                )}

                {/* User + Amount */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-black">{w.profiles?.full_name?.charAt(0) ?? 'U'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{w.profiles?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{w.profiles?.email}</p>
                      <p className="text-xs text-gray-400">{w.profiles?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-gray-900">&#8358;{Number(w.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Fee: &#8358;{Number(w.fee ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-green-600">Net: &#8358;{Number(w.net_amount ?? w.amount).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      w.status === 'completed' ? 'bg-green-100 text-green-700' :
                      w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      w.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      w.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>{w.status}</span>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Bank Details</p>
                  <p className="text-sm font-bold text-gray-800">{w.account_name ?? 'N/A'}</p>
                  <p className="text-xs text-gray-400">{w.bank_name ?? ''} {w.account_number ? `• ${w.account_number}` : ''}</p>
                  <p className="text-[10px] text-gray-300 font-mono mt-1">{w.reference}</p>
                  <p className="text-[10px] text-gray-400">{new Date(w.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Rejection Reason */}
                {w.rejection_reason && (
                  <div className="bg-red-50 rounded-xl p-3 mb-3 border border-red-100">
                    <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{w.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('withdrawal_requests').update({ status: 'approved', reviewed_by: user?.id }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={async () => {
                        const reason = prompt('Rejection reason:');
                        if (!reason) return;
                        await supabase.from('withdrawal_requests').update({ status: 'rejected', rejection_reason: reason, reviewed_by: user?.id }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
                {w.status === 'approved' && (
                  <button
                    onClick={async () => {
                      await supabase.from('withdrawal_requests').update({ status: 'processing' }).eq('id', w.id);
                      fetchWithdrawals();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 transition-colors"
                  >
                    Mark as Processing
                  </button>
                )}
                {w.status === 'processing' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('withdrawal_requests').update({ status: 'completed' }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                    <button
                      onClick={async () => {
                        const reason = prompt('Failure reason:');
                        if (!reason) return;
                        await supabase.from('withdrawal_requests').update({ status: 'failed', rejection_reason: reason }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Mark Failed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WALLETS TAB */}
        {tab === 'wallets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900">User Wallets</h2>
                <p className="text-xs text-gray-400 mt-0.5">{wallets.length} wallets · ₦{wallets.reduce((s, w) => s + Number(w.balance), 0).toLocaleString()} total</p>
              </div>
              <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                {wallets.filter(w => Number(w.balance) > 0).length} funded
              </div>
            </div>
            {wallets.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-7 h-7 text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold text-sm">No wallets found</p>
              </div>
            ) : wallets.filter(w =>
              !search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase())
            ).map((w) => {
              const bal = Number(w.balance);
              const tier = bal >= 10000 ? { label: 'High', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' }
                : bal >= 1000 ? { label: 'Mid', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' }
                : { label: 'Low', color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', text: 'text-gray-500' };
              return (
                <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-white text-sm font-black">{w.profiles?.full_name?.charAt(0) ?? 'W'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{w.profiles?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{w.profiles?.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>{tier.label}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Balance</p>
                      <p className="text-xl font-black text-gray-900">&#8358;{bal.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={async () => {
                        const amt = prompt('Set balance to:');
                        if (amt) {
                          const n = parseFloat(amt);
                          if (!isNaN(n) && n >= 0) {
                            const { data: sessionData } = await supabase.auth.getSession();
                            const token = sessionData.session?.access_token;
                            const { data, error } = await supabase.functions.invoke('admin-adjust-wallet', {
                              headers: { Authorization: `Bearer ${token}` },
                              body: { wallet_id: w.id, new_balance: n, reason: 'Manual admin adjustment' },
                            });
                            if (error || data?.error) {
                              alert(data?.error || 'Failed to update balance');
                            } else {
                              fetchAll();
                            }
                          }
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-sm"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <AdminSettingsTab />
        )}
      </div>
    </AdminLayout>
  );
}
