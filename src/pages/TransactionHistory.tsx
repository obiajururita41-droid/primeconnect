import { useState, useEffect } from 'react';
import BottomNav from '../components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Search, Wallet, Gift, Phone, Wifi, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  reference: string;
  created_at: string;
  metadata: any;
}

const TYPE_ICONS: Record<string, any> = {
  credit:    { icon: ArrowDownLeft, color: 'bg-green-50 text-green-600' },
  debit:     { icon: ArrowUpRight,  color: 'bg-red-50 text-red-500' },
  airtime:   { icon: Phone,         color: 'bg-yellow-50 text-yellow-600' },
  data:      { icon: Wifi,          color: 'bg-blue-50 text-blue-600' },
  gift_card: { icon: Gift,          color: 'bg-purple-50 text-purple-600' },
  sms:       { icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
};

export default function TransactionHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, filter, page]);

  async function fetchTransactions() {
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter !== 'all') {
      if (['pending', 'success', 'failed'].includes(filter)) {
        query = query.eq('status', filter);
      } else {
        query = query.eq('type', filter);
      }
    }

    const { data } = await query;
    if (data) setTransactions(data);
    setLoading(false);
  }

  const filtered = transactions.filter(tx =>
    !search ||
    tx.description?.toLowerCase().includes(search.toLowerCase()) ||
    tx.reference?.toLowerCase().includes(search.toLowerCase())
  );

  function getIcon(type: string) {
    const config = TYPE_ICONS[type] ?? TYPE_ICONS['debit'];
    return config;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900">Transaction History</h1>
            <p className="text-xs text-gray-400">All your transactions</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all',       label: 'All' },
            { key: 'credit',    label: 'Credits' },
            { key: 'debit',     label: 'Debits' },
            { key: 'pending',   label: 'Pending' },
            { key: 'success',   label: 'Success' },
            { key: 'failed',    label: 'Failed' },
            { key: 'airtime',   label: 'Airtime' },
            { key: 'data',      label: 'Data' },
            { key: 'gift_card', label: 'Gift Cards' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.map((tx, i) => {
              const { icon: Icon, color } = getIcon(tx.type);
              return (
                <div
                  key={tx.id}
                  className={`flex items-center gap-3 p-4 ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tx.description ?? 'Transaction'}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs font-mono text-gray-300 truncate">{tx.reference}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.status === 'success' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{tx.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={filtered.length < PAGE_SIZE}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
          <BottomNav />
    </div>
  );
}
