import { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { saveState, loadState, clearState } from '../../lib/sessionState';

const NETWORKS = [
  { id: 'mtn',      name: 'MTN',     color: 'bg-yellow-400', text: 'text-black' },
  { id: 'airtel',   name: 'Airtel',  color: 'bg-red-500',    text: 'text-white' },
  { id: 'glo',      name: 'Glo',     color: 'bg-green-600',  text: 'text-white' },
  { id: '9mobile',  name: '9mobile', color: 'bg-green-800',  text: 'text-white' },
];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

function generateRef() {
  return `PC-AIR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function AirtimePage() {
  const { user } = useAuth();
  const [network, setNetwork] = useState<string>(() => loadState<string>('airtime_network') || '');
  const [phone, setPhone]     = useState<string>(() => loadState<string>('airtime_phone') || '');
  const [amount, setAmount]   = useState<string>(() => loadState<string>('airtime_amount') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { saveState('airtime_network', network); }, [network]);
  useEffect(() => { saveState('airtime_phone', phone); }, [phone]);
  useEffect(() => { saveState('airtime_amount', amount); }, [amount]);

  const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  async function callClubKonnect(action: string, payload: Record<string, any>) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/clubkonnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    return res.json();
  }

  const handlePurchase = async () => {
    setError(''); setSuccess('');
    if (!network) return setError('Select a network');
    if (!/^(070|071|080|081|090|091)\d{8}$/.test(phone))
      return setError('Enter a valid 11-digit Nigerian phone number');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 50)  return setError('Minimum airtime is ₦50');
    if (numAmount > 50000)             return setError('Maximum airtime is ₦50,000');

    setLoading(true);
    const reference = generateRef();

    const { data: wallet } = await supabase
      .from('wallets').select('id, balance')
      .eq('user_id', user?.id).eq('is_active', true).single();

    if (!wallet || wallet.balance < numAmount) {
      setError('Insufficient wallet balance. Please fund your wallet.');
      setLoading(false); return;
    }

    await supabase.from('transactions').insert({
      user_id: user?.id, wallet_id: wallet.id,
      type: 'debit', status: 'pending', amount: numAmount,
      description: `${network.toUpperCase()} ₦${numAmount} airtime → ${phone}`,
      reference, metadata: { network, phone },
    });

    const res = await callClubKonnect('buy_airtime', {
      network, phone, amount: numAmount, requestId: reference,
    });

    if (res?.statuscode === '100' || res?.statuscode === '200' || res?.status === 'ORDER_RECEIVED' || res?.status === 'ORDER_COMPLETED') {
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: numAmount, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success', metadata: { ...res } }).eq('reference', reference);
      setSuccess(`✅ ₦${numAmount} airtime sent to ${phone}!`);
      setPhone(''); setAmount(''); setNetwork('');
      clearState('airtime_network'); clearState('airtime_phone'); clearState('airtime_amount');
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(res?.status || res?.error || 'Purchase failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Buy Airtime</h1>
          <p className="text-gray-500 text-sm mt-1">Instant delivery to any Nigerian network</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button key={n.id} onClick={() => setNetwork(n.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${network === n.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${n.color}`}>
                    <span className={`text-xs font-bold ${n.text}`}>{n.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{n.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="08012345678"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {QUICK_AMOUNTS.map((q) => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  ₦{q}
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
          <button onClick={handlePurchase} disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
            ) : (`Buy Airtime${amount ? ` — ₦${Number(amount).toLocaleString()}` : ''}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
