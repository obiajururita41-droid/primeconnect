import { useState, useEffect } from 'react';
import BackButton from '../../components/ui/BackButton';
import { PiggyBank, TrendingUp, ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

function generateRef() {
  return `PC-SAV-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

export default function SavingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'overview'|'deposit'|'withdraw'>('overview');
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [interestRate, setInterestRate] = useState(5);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, [user]);

  async function fetchData() {
    if (!user) return;
    const { data: wallet } = await supabase.from('wallets').select('balance, savings_balance').eq('user_id', user.id).single();
    if (wallet) setWalletBalance(Number(wallet.balance));

    if (wallet) setSavingsBalance(Number(wallet.savings_balance));

    const { data: settings } = await supabase.from('platform_settings').select('value').eq('key', 'savings_interest_rate').single();
    if (settings) setInterestRate(Number(settings.value));

    const { data: txns } = await supabase.from('transactions').select('*').eq('user_id', user.id).in('type', ['savings_deposit','savings_withdraw']).order('created_at', { ascending: false }).limit(10);
    if (txns) setHistory(txns);
  }

  async function handleDeposit() {
    setError(''); setSuccess('');
    const amt = Number(amount);
    if (!amt || amt < 100) return setError('Minimum deposit is ₦100');
    if (amt > walletBalance) return setError('Insufficient wallet balance');
    setLoading(true);
    const ref = generateRef();
    const { error: e1 } = await supabase.rpc('savings_deposit', { p_user_id: user!.id, p_amount: amt, p_ref: ref });
    if (e1) { setError('Deposit failed: ' + e1.message); setLoading(false); return; }
    setSuccess(`₦${amt.toLocaleString()} deposited successfully!`);
    setAmount('');
    await fetchData();
    setLoading(false);
  }

  async function handleWithdraw() {
    setError(''); setSuccess('');
    const amt = Number(amount);
    if (!amt || amt < 100) return setError('Minimum withdrawal is ₦100');
    if (amt > savingsBalance) return setError('Insufficient savings balance');
    setLoading(true);
    const ref = generateRef();
    const { error: e1 } = await supabase.rpc('savings_withdraw', { p_user_id: user!.id, p_amount: amt, p_ref: ref });
    if (e1) { setError('Withdrawal failed: ' + e1.message); setLoading(false); return; }
    setSuccess(`₦${amt.toLocaleString()} withdrawn to wallet!`);
    setAmount('');
    await fetchData();
    setLoading(false);
  }

  const monthlyEarning = (savingsBalance * interestRate) / 100 / 12;

  return (
      <BackButton />
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-12 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Savings Account</p>
              <p className="text-white font-bold text-lg">PrimeConnect Savings</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur">
            <p className="text-blue-100 text-xs mb-1">Total Savings Balance</p>
            <p className="text-white text-3xl font-black mb-3">₦{savingsBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-blue-100 text-xs">Interest Rate</p>
                <p className="text-white font-bold">{interestRate}% p.a.</p>
              </div>
              <div className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-blue-100 text-xs">Monthly Earning</p>
                <p className="text-white font-bold">₦{monthlyEarning.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['overview','deposit','withdraw'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); setAmount(''); }}
              className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-500 border border-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600" />
                <p className="font-bold text-gray-800 text-sm">How it works</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Deposit from your wallet anytime</li>
                <li>• Earn {interestRate}% annual interest, credited monthly</li>
                <li>• Withdraw back to wallet anytime</li>
                <li>• No lock-in period, no hidden fees</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="font-bold text-gray-800 text-sm mb-3">Recent Activity</p>
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No savings activity yet</p>
              ) : history.map(t => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    {t.type === 'savings_deposit'
                      ? <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                      : <ArrowUpRight className="w-4 h-4 text-orange-500" />}
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{t.type === 'savings_deposit' ? 'Deposit' : 'Withdrawal'}</p>
                      <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${t.type === 'savings_deposit' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {t.type === 'savings_deposit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'deposit' || tab === 'withdraw') && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="mb-4 p-3 bg-gray-50 rounded-xl flex justify-between">
              <span className="text-xs text-gray-500">Wallet Balance</span>
              <span className="text-xs font-bold text-gray-700">₦{walletBalance.toLocaleString()}</span>
            </div>
            <div className="mb-4 p-3 bg-blue-50 rounded-xl flex justify-between">
              <span className="text-xs text-blue-700">Savings Balance</span>
              <span className="text-xs font-bold text-blue-700">₦{savingsBalance.toLocaleString()}</span>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₦)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xl font-bold focus:outline-none focus:border-blue-500 mb-4" />
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[500,1000,5000,10000,20000,50000].map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className={`py-2 rounded-xl text-xs font-bold border-2 ${amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100'}`}>
                  ₦{q.toLocaleString()}
                </button>
              ))}
            </div>
            {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl mb-4"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{error}</p></div>}
            {success && <div className="flex gap-2 p-3 bg-blue-50 rounded-xl mb-4"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /><p className="text-sm text-blue-600">{success}</p></div>}
            <button onClick={tab === 'deposit' ? handleDeposit : handleWithdraw} disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : tab === 'deposit' ? <><ArrowDownLeft className="w-5 h-5" />Deposit to Savings</> : <><ArrowUpRight className="w-5 h-5" />Withdraw to Wallet</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
