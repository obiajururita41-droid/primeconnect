import { useState, useEffect } from 'react';
import { saveState, loadState } from '../../lib/sessionState';
import { Wifi, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const NETWORKS = [
  { id: 'mtn-data',      name: 'MTN',     color: 'bg-yellow-400', text: 'text-black' },
  { id: 'airtel-data',   name: 'Airtel',  color: 'bg-red-500',    text: 'text-white' },
  { id: 'glo-data',      name: 'Glo',     color: 'bg-green-600',  text: 'text-white' },
  { id: 'etisalat-data', name: '9mobile', color: 'bg-green-800',  text: 'text-white' },
];

interface DataPlan {
  variation_code: string;
  name: string;
  variation_amount: string;
}

function generateRef() {
  return `PC-DATA-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function DataPage() {
  const { user } = useAuth();
  const [network, setNetwork] = useState(() => loadState<string>('data_network') || '');
  const [phone, setPhone] = useState(() => loadState<string>('data_phone') || '');
  const [plans, setPlans]           = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  async function callVtpass(action: string, payload: Record<string, any>) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/vtpass`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    return res.json();
  }

  useEffect(() => {
    if (!network) return;
    setPlans([]);
    setSelectedPlan(null);
    setLoadingPlans(true);
    callVtpass('get_variations', { serviceID: network })
      .then((res) => setPlans(res?.content?.variations ?? []))
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoadingPlans(false));
  }, [network]);

  const handlePurchase = async () => {
    setError('');
    setSuccess('');
    if (!network)      return setError('Select a network');
    if (!selectedPlan) return setError('Select a data plan');
    if (!/^(070|071|080|081|090|091)\d{8}$/.test(phone))
      return setError('Enter a valid 11-digit Nigerian phone number');

    setLoading(true);
    const reference = generateRef();
    const numAmount = Number(selectedPlan.variation_amount);

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
      wallet_id:   wallet.id,
      type:        'debit',
      status:      'pending',
      amount:      numAmount,
      description: `${network} ${selectedPlan.name} → ${phone}`,
      reference,
      metadata:    { network, phone, plan: selectedPlan },
    });

    const res = await callVtpass('pay', {
      request_id:     reference,
      serviceID:      network,
      billersCode:    phone,
      variation_code: selectedPlan.variation_code,
      amount:         String(numAmount),
      phone,
    });

    const status = res?.content?.transactions?.status;
    if (res?.code === '000' || status === 'delivered') {
      const { error: debitErr } = await supabase.rpc('debit_wallet', {
        p_user_id:   user?.id,
        p_amount:    numAmount,
        p_reference: reference,
      });
      if (debitErr) {
        setError('Data activated but wallet debit failed. Contact support: ' + reference);
      } else {
        setSuccess(`✅ ${selectedPlan.name} activated on ${phone}!`);
        setSelectedPlan(null);
        setPhone('');
      }
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(res?.response_description || 'Purchase failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Subscription</h1>
          <p className="text-gray-500 text-sm mt-1">All networks, all plans — instant activation</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNetwork(n.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    network === n.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="08012345678"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {network && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Plan</label>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-6">
                  <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Loading plans...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {plans.map((plan) => (
                    <button
                      key={plan.variation_code}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                        selectedPlan?.variation_code === plan.variation_code
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-800">{plan.name}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        ₦{Number(plan.variation_amount).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
            onClick={handlePurchase}
            disabled={loading || !selectedPlan}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Activating...</>
            ) : selectedPlan ? (
              `Buy ${selectedPlan.name} — ₦${Number(selectedPlan.variation_amount).toLocaleString()}`
            ) : (
              'Select a Plan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
