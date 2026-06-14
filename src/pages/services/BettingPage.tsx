import { useState } from 'react';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import BottomNav from '../../components/layout/BottomNav';

const PLATFORMS = [
  { id: 'sportybet',  name: 'SportyBet',  color: 'bg-green-500',  text: 'text-white' },
  { id: 'bet9ja',     name: 'Bet9ja',     color: 'bg-green-700',  text: 'text-white' },
  { id: '1xbet',      name: '1xBet',      color: 'bg-blue-600',   text: 'text-white' },
  { id: 'betway',     name: 'Betway',     color: 'bg-green-400',  text: 'text-white' },
  { id: 'bangbet',    name: 'BangBet',    color: 'bg-red-600',    text: 'text-white' },
  { id: 'msport',     name: 'MSport',     color: 'bg-blue-800',   text: 'text-white' },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

function generateRef() {
  return `PC-BET-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function BettingPage() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState('');
  const [userId, setUserId]     = useState('');
  const [amount, setAmount]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!platform) return setError('Select a betting platform');
    if (!userId.trim()) return setError('Enter your betting user ID');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) return setError('Minimum amount is ₦100');
    if (numAmount > 500000) return setError('Maximum amount is ₦500,000');

    setLoading(true);
    const reference = generateRef();

    try {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (!wallet || wallet.balance < numAmount) {
        setError('Insufficient wallet balance. Please fund your wallet.');
        setLoading(false);
        return;
      }

      await supabase.from('transactions').insert({
        user_id:     user?.id,
        wallet_id:   wallet?.id,
        type:        'debit',
        status:      'pending',
        amount:      numAmount,
        description: `${platform} Wallet Funding — ID: ${userId}`,
        reference,
        metadata:    { platform, betting_user_id: userId },
      });

      const { error: debitErr } = await supabase.rpc('debit_wallet', {
        p_user_id:   user?.id,
        p_amount:    numAmount,
        p_reference: reference,
      });

      if (debitErr) throw debitErr;

      setSuccess(`✅ ₦${numAmount.toLocaleString()} sent to your ${platform} account! It will reflect within 2 minutes.`);
      setUserId('');
      setAmount('');
      setPlatform('');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bet Wallet Funding</h1>
          </div>
          <p className="text-gray-500 text-sm">Fund your betting wallet instantly</p>
        </div>

        {/* Info Banner */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <Zap className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">Instant funding • No extra charges • 24/7 available</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.name)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    platform === p.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${p.color}`}>
                    <span className={`text-[10px] font-bold ${p.text} text-center leading-tight`}>{p.name}</span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-700 text-center">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {platform ? `${platform} User ID` : 'Betting User ID'}
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    amount === String(q) ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  ₦{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
              : `Fund${amount ? ` ₦${Number(amount).toLocaleString()}` : ''}`}
          </button>

          <p className="text-center text-xs text-gray-400">
            ⚡ Funds reflect in your betting wallet within 2 minutes
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
