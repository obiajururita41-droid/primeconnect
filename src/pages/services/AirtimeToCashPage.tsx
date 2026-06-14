import { useState } from 'react';
import { Phone, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import BottomNav from '../../components/layout/BottomNav';

const NETWORKS = [
  { id: 'mtn',      name: 'MTN',     color: 'bg-yellow-400', text: 'text-black', rate: 0.75 },
  { id: 'airtel',   name: 'Airtel',  color: 'bg-red-500',    text: 'text-white', rate: 0.73 },
  { id: 'glo',      name: 'Glo',     color: 'bg-green-600',  text: 'text-white', rate: 0.70 },
  { id: 'etisalat', name: '9mobile', color: 'bg-green-800',  text: 'text-white', rate: 0.68 },
];

function generateRef() {
  return `PC-A2C-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function AirtimeToCashPage() {
  const { user } = useAuth();
  const [network, setNetwork] = useState('');
  const [phone, setPhone]     = useState('');
  const [amount, setAmount]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const selectedNetwork = NETWORKS.find(n => n.id === network);
  const cashValue = selectedNetwork && amount
    ? Math.floor(Number(amount) * selectedNetwork.rate)
    : 0;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!network) return setError('Select a network');
    if (!/^(070|071|080|081|090|091)\d{8}$/.test(phone))
      return setError('Enter a valid 11-digit Nigerian phone number');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) return setError('Minimum amount is ₦100');
    if (numAmount > 50000) return setError('Maximum amount is ₦50,000');

    setLoading(true);
    const reference = generateRef();

    try {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      await supabase.from('transactions').insert({
        user_id:     user?.id,
        wallet_id:   wallet?.id,
        type:        'credit',
        status:      'pending',
        amount:      cashValue,
        description: `Airtime to Cash — ${network.toUpperCase()} ₦${numAmount} → ₦${cashValue}`,
        reference,
        metadata:    { network, phone, airtime_amount: numAmount, cash_value: cashValue },
      });

      setSuccess(`✅ Request submitted! Send ₦${numAmount} airtime to our number. You will receive ₦${cashValue} in your wallet within 5 minutes.`);
      setPhone('');
      setAmount('');
      setNetwork('');
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
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Airtime to Cash</h1>
          </div>
          <p className="text-gray-500 text-sm">Convert your airtime to wallet cash instantly</p>
        </div>

        {/* Rate Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 mb-6 text-white">
          <p className="text-sm font-medium opacity-80 mb-2">Current Rates</p>
          <div className="grid grid-cols-2 gap-2">
            {NETWORKS.map(n => (
              <div key={n.id} className="bg-white/20 rounded-xl px-3 py-2 flex justify-between items-center">
                <span className="text-sm font-bold">{n.name}</span>
                <span className="text-sm font-bold">{Math.round(n.rate * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Network */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNetwork(n.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    network === n.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${n.color}`}>
                    <span className={`text-xs font-bold ${n.text}`}>{n.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{n.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="08012345678"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Airtime Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Cash Value Preview */}
          {cashValue > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-yellow-700 font-medium">You will receive</p>
                <p className="text-2xl font-extrabold text-yellow-600">₦{cashValue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Rate</p>
                <p className="text-sm font-bold text-gray-700">{selectedNetwork ? Math.round(selectedNetwork.rate * 100) : 0}%</p>
              </div>
            </div>
          )}

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
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
              : `Convert${amount ? ` ₦${Number(amount).toLocaleString()} Airtime` : ''}`}
          </button>

          <p className="text-center text-xs text-gray-400">
            ⚡ Cash credited to wallet within 5 minutes after airtime is received
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
