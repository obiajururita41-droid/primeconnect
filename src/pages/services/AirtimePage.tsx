import BackButton from '../../components/ui/BackButton';
import { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle2, Tag, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { saveState, loadState, clearState } from '../../lib/sessionState';

const NETWORKS = [
  { id: 'mtn',     name: 'MTN',     bg: 'bg-yellow-400', text: 'text-black',  border: 'border-yellow-400' },
  { id: 'airtel',  name: 'Airtel',  bg: 'bg-red-500',    text: 'text-white',  border: 'border-red-500' },
  { id: 'glo',     name: 'Glo',     bg: 'bg-green-500',  text: 'text-white',  border: 'border-green-500' },
  { id: '9mobile', name: '9mobile', bg: 'bg-green-800',  text: 'text-white',  border: 'border-green-800' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const NETWORK_LOGOS: Record<string, string> = {
  mtn: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mtn.svg',
  airtel: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/airtel.svg',
  glo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Glo_logo.svg/120px-Glo_logo.svg.png',
  '9mobile': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/9mobile_logo.svg/120px-9mobile_logo.svg.png',
};

function generateRef() {
  return `PC-AIR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function AirtimePage() {
  const { user } = useAuth();
  const [network, setNetwork] = useState<string>(() => loadState<string>('airtime_network') || '');
  const [phone, setPhone]     = useState<string>(() => loadState<string>('airtime_phone') || '');
  const [amount, setAmount]   = useState<string>(() => loadState<string>('airtime_amount') || '');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { saveState('airtime_network', network); }, [network]);
  useEffect(() => { saveState('airtime_phone', phone); }, [phone]);
  useEffect(() => { saveState('airtime_amount', amount); }, [amount]);

  useEffect(() => {
    supabase.from('wallets').select('balance')
      .eq('user_id', user?.id).eq('is_active', true).single()
      .then(({ data }) => { if (data) setWalletBalance(data.balance); });
  }, [user]);

  const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  async function callClubKonnect(action: string, payload: Record<string, any>) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/clubkonnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ action, payload }),
    });
    return res.json();
  }

  const numAmount = Number(amount);
  const isValid = network && /^(070|071|080|081|090|091)\d{8}$/.test(phone) && numAmount >= 50;

  const handlePurchase = async () => {
    setError(''); setSuccess('');
    if (!network) return setError('Select a network');
    if (!/^(070|071|080|081|090|091)\d{8}$/.test(phone)) return setError('Enter a valid 11-digit Nigerian phone number');
    if (!numAmount || numAmount < 50)  return setError('Minimum airtime is ₦50');
    if (numAmount > 50000)             return setError('Maximum airtime is ₦50,000');
    setLoading(true);
    const reference = generateRef();
    const { data: wallet } = await supabase.from('wallets').select('id, balance')
      .eq('user_id', user?.id).eq('is_active', true).single();
    if (!wallet || wallet.balance < numAmount) {
      setError('Insufficient wallet balance. Please fund your wallet.');
      setLoading(false); return;
    }
    await supabase.from('transactions').insert({
      user_id: user?.id, wallet_id: wallet.id, type: 'debit', status: 'pending',
      amount: numAmount, description: `${network.toUpperCase()} ₦${numAmount} airtime → ${phone}`,
      reference, metadata: { network, phone },
    });
    const res = await callClubKonnect('buy_airtime', { network, phone, amount: numAmount, requestId: reference });
    if (res?.statuscode === '100' || res?.statuscode === '200' || res?.status === 'ORDER_RECEIVED' || res?.status === 'ORDER_COMPLETED') {
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: numAmount, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success', metadata: { ...res } }).eq('reference', reference);
      setWalletBalance(prev => prev - numAmount);
      setSuccess(`₦${numAmount.toLocaleString()} airtime sent to ${phone}!`);
      setPhone(''); setAmount(''); setNetwork('');
      clearState('airtime_network'); clearState('airtime_phone'); clearState('airtime_amount');
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(res?.status || res?.error || 'Purchase failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <BackButton />

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-20">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-black mb-1">Buy Airtime</h1>
          <p className="text-blue-200 text-sm mb-4">Instant delivery to any Nigerian network</p>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">⚡ Instant Delivery</span>
            <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">🔒 Secure Payment</span>
            <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">🎁 Best Prices</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-12 space-y-4">

        {/* Wallet Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Wallet Balance</p>
            <p className="text-2xl font-black text-gray-900">₦{walletBalance.toLocaleString()}</p>
          </div>
          <button className="bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
            Fund Wallet
          </button>
        </div>

        {/* Network Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">Select Network</p>
          <div className="grid grid-cols-4 gap-3">
            {NETWORKS.map((n) => (
              <button key={n.id} onClick={() => setNetwork(n.id)}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${network === n.id ? `${n.border} bg-blue-50` : 'border-gray-100 bg-gray-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1.5 ${n.bg} relative`}>
                  <span className={`text-xs font-black ${n.text}`}>{n.name}</span>
                  {network === n.id && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-700">{n.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Phone Number</p>
            <button className="text-blue-600 text-xs font-bold flex items-center gap-1">
              <User className="w-3 h-3" /> Recent Numbers
            </button>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="080 1234 5678"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-800 font-medium" />
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-3">Select Amount</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {QUICK_AMOUNTS.map((q) => (
              <button key={q} onClick={() => setAmount(String(q))}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all relative ${amount === String(q) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-700'}`}>
                {q === 200 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">Popular</span>}
                ₦{q.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Other amount"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-gray-700" />
          </div>
        </div>

        {/* Order Summary */}
        {network && phone && numAmount >= 50 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2.5">
            <p className="text-sm font-bold text-gray-800 mb-1">Order Summary</p>
            {[
              ['Network', NETWORKS.find(n => n.id === network)?.name || ''],
              ['Phone Number', phone],
              ['Amount', `₦${numAmount.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Total Payable</span>
              <span className="text-lg font-black text-blue-600">₦{numAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Cashback Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <Tag className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-700">Get up to 2% cashback</p>
            <p className="text-xs text-blue-500">on airtime purchases.</p>
          </div>
          <span className="text-blue-400 font-bold">›</span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-2 p-3.5 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-3.5 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* CTA Button */}
        <button onClick={handlePurchase} disabled={loading || !isValid}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-200">
          {loading
            ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
            : isValid ? `Continue to Pay — ₦${numAmount.toLocaleString()}` : 'Continue to Pay'
          }
        </button>

      </div>
    </div>
  );
}
