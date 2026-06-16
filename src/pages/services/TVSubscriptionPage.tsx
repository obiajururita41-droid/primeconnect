import { useState } from 'react';
import { Tv, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const PROVIDERS = [
  { id: 'DSTV', name: 'DSTV', color: 'bg-blue-600', plans: [
    { name: 'Padi', amount: 2500 }, { name: 'Yanga', amount: 3500 },
    { name: 'Confam', amount: 6200 }, { name: 'Compact', amount: 10500 },
    { name: 'Compact Plus', amount: 16600 }, { name: 'Premium', amount: 24500 },
  ]},
  { id: 'GOTV', name: 'GOtv', color: 'bg-green-600', plans: [
    { name: 'Smallie', amount: 900 }, { name: 'Jinja', amount: 1900 },
    { name: 'Jolli', amount: 2800 }, { name: 'Max', amount: 4150 },
    { name: 'Supa', amount: 6400 }, { name: 'Supa Plus', amount: 7200 },
  ]},
  { id: 'STARTIME', name: 'StarTimes', color: 'bg-red-600', plans: [
    { name: 'Nova', amount: 900 }, { name: 'Basic', amount: 1700 },
    { name: 'Smart', amount: 2200 }, { name: 'Classic', amount: 2500 },
    { name: 'Super', amount: 4200 },
  ]},
];

function generateRef() {
  return `PC-TV-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

export default function TVSubscriptionPage() {
  const { user } = useAuth();
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [plan, setPlan] = useState<{name:string;amount:number}|null>(null);
  const [smartCard, setSmartCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handlePay() {
    setError('');
    if (!smartCard.trim()) return setError('Enter your smart card / IUC number');
    if (!plan) return setError('Select a plan');
    setLoading(true);

    const { data: wallet } = await supabase.from('wallets').select('id,balance').eq('user_id', user!.id).single();
    if (!wallet || Number(wallet.balance) < plan.amount) {
      setError('Insufficient wallet balance'); setLoading(false); return;
    }

    const ref = generateRef();
    const { error: txErr } = await supabase.from('transactions').insert({
      user_id: user!.id, type: 'tv_subscription', status: 'pending',
      amount: plan.amount,
      description: `${provider.name} ${plan.name} - Card: ${smartCard}`,
      reference: ref,
      metadata: { provider: provider.id, plan: plan.name, smart_card: smartCard },
    });
    if (txErr) { setError('Transaction failed'); setLoading(false); return; }

    const { error: walletErr } = await supabase.from('wallets').update({ balance: Number(wallet.balance) - plan.amount }).eq('id', wallet.id);
    if (walletErr) { setError('Wallet deduction failed'); setLoading(false); return; }

    await supabase.from('transactions').update({ status: 'success' }).eq('reference', ref);
    setSuccess(true);
    setLoading(false);
  }

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Subscription Successful!</h2>
        <p className="text-gray-500 text-sm mb-6">{provider.name} {plan?.name} activated for smart card <strong>{smartCard}</strong></p>
        <button onClick={() => { setSuccess(false); setSmartCard(''); setPlan(null); }}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Pay Another</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 px-4 pt-12 pb-16">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Bill Payment</p>
            <p className="text-white font-bold text-lg">TV Subscription</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-5">
          {/* Provider */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => { setProvider(p); setPlan(null); }}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${provider.id === p.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Card */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Smart Card / IUC Number</label>
            <input type="text" value={smartCard} onChange={e => setSmartCard(e.target.value)}
              placeholder="Enter your card number"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-mono focus:outline-none focus:border-blue-500" />
          </div>

          {/* Plans */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {provider.plans.map(p => (
                <button key={p.name} onClick={() => setPlan(p)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${plan?.name === p.name ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                  <p className="text-xs font-bold text-gray-700">{p.name}</p>
                  <p className="text-sm font-black text-blue-600">₦{p.amount.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {plan && (
            <div className="bg-blue-50 rounded-xl p-3 flex justify-between">
              <span className="text-sm text-blue-700">Total to pay</span>
              <span className="text-sm font-black text-blue-700">₦{plan.amount.toLocaleString()}</span>
            </div>
          )}

          {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{error}</p></div>}

          <button onClick={handlePay} disabled={loading || !plan}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Tv className="w-5 h-5" />Pay Subscription</>}
          </button>
        </div>
      </div>
    </div>
  );
}
