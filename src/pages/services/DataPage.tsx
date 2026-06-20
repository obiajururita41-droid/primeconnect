import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { saveState, loadState, clearState } from '../../lib/sessionState';

const NETWORKS = [
  { id: 'mtn',     name: 'MTN',     color: 'bg-yellow-400', text: 'text-black',  networkKey: 'MTN' },
  { id: 'airtel',  name: 'Airtel',  color: 'bg-red-500',    text: 'text-white',  networkKey: 'Airtel' },
  { id: 'glo',     name: 'Glo',     color: 'bg-green-600',  text: 'text-white',  networkKey: 'Glo' },
  { id: '9mobile', name: '9mobile', color: 'bg-green-800',  text: 'text-white',  networkKey: '9mobile' },
];

const CATEGORIES = ['All', 'Daily', 'Weekly', 'Monthly'];

interface DataPlan { id: string; name: string; amount: number; category: string; size: string; duration: string; }

function generateRef() {
  return `PC-DATA-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function parsePlan(p: any): DataPlan {
  const name = p.PRODUCT_NAME
    .replace(' (Awoof Data)', '')
    .replace(' (Direct Data)', '')
    .replace(' (SME)', '')
    .trim();
  const amount = Math.round(Number(p.PRODUCT_AMOUNT) * 1.05);

  // Extract size and duration
  const sizeMatch = name.match(/^([\d.]+\s*[GMKB]+)/i);
  const size = sizeMatch ? sizeMatch[1].trim() : name.split('-')[0].trim();

  const durMatch = name.match(/(\d+)\s*(day|week|month|min)/i);
  const duration = durMatch ? `${durMatch[1]} ${durMatch[2]}${Number(durMatch[1]) > 1 ? 's' : ''}` : '';

  // Category
  let category = 'Monthly';
  const lower = name.toLowerCase();
  if (lower.includes('day') || lower.includes('daily')) category = 'Daily';
  else if (lower.includes('week')) category = 'Weekly';

  return { id: p.PRODUCT_ID, name, amount, category, size, duration };
}

export default function DataPage() {
  const { user } = useAuth();
  const [network, setNetwork]           = useState<string>(() => loadState<string>('data_network') || '');
  const [phone, setPhone]               = useState<string>(() => loadState<string>('data_phone') || '');
  const [plans, setPlans]               = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  useEffect(() => { saveState('data_network', network); }, [network]);
  useEffect(() => { saveState('data_phone', phone); }, [phone]);

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

  useEffect(() => {
    if (!network) return;
    setPlans([]); setSelectedPlan(null); setLoadingPlans(true); setError('');
    const selectedNet = NETWORKS.find(n => n.id === network);
    callClubKonnect('get_data_plans', { network })
      .then((res) => {
        const networkKey = selectedNet?.networkKey || 'MTN';
        const networkData = res?.MOBILE_NETWORK?.[networkKey];
        if (networkData?.[0]?.PRODUCT) {
          setPlans(networkData[0].PRODUCT.map(parsePlan));
        } else {
          setError('No plans available');
        }
      })
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoadingPlans(false));
  }, [network]);

  const filteredPlans = activeCategory === 'All' ? plans : plans.filter(p => p.category === activeCategory);

  const handlePurchase = async () => {
    setError(''); setSuccess('');
    if (!network)      return setError('Select a network');
    if (!selectedPlan) return setError('Select a data plan');
    if (!/^(070|071|080|081|090|091)\d{8}$/.test(phone))
      return setError('Enter a valid 11-digit Nigerian phone number');

    setLoading(true);
    const reference = generateRef();
    const numAmount = selectedPlan.amount;

    const { data: wallet } = await supabase.from('wallets').select('id, balance')
      .eq('user_id', user?.id).eq('is_active', true).single();

    if (!wallet || wallet.balance < numAmount) {
      setError('Insufficient wallet balance.'); setLoading(false); return;
    }

    await supabase.from('transactions').insert({
      user_id: user?.id, wallet_id: wallet.id, type: 'debit', status: 'pending',
      amount: numAmount, description: `${network.toUpperCase()} ${selectedPlan.name} → ${phone}`,
      reference, metadata: { network, phone, plan: selectedPlan },
    });

    const res = await callClubKonnect('buy_data', {
      network, phone, dataPlan: selectedPlan.id, requestId: reference,
    });

    if (res?.statuscode === '100' || res?.statuscode === '200' || res?.status === 'ORDER_RECEIVED' || res?.status === 'ORDER_COMPLETED') {
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: numAmount, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success' }).eq('reference', reference);
      setSuccess(`${selectedPlan.size} data activated on ${phone}!`);
      setSelectedPlan(null); setPhone('');
      clearState('data_network'); clearState('data_phone');
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(res?.status || res?.error || 'Purchase failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-black mb-1">Data Subscription</h1>
          <p className="text-blue-200 text-sm">Instant activation on all networks</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
        {/* Network + Phone Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">Select Network</label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {NETWORKS.map((n) => (
              <button key={n.id} onClick={() => { setNetwork(n.id); setActiveCategory('All'); }}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${network === n.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${n.color}`}>
                  <span className={`text-xs font-black ${n.text}`}>{n.name[0]}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">{n.name}</span>
              </button>
            ))}
          </div>

          <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="08012345678"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" />
          </div>
        </div>

        {/* Plans */}
        {network && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Category Tabs */}
            <div className="flex border-b border-gray-100">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${activeCategory === cat ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {loadingPlans ? (
              <div className="flex items-center justify-center py-12">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-4 grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {filteredPlans.map((plan) => (
                  <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    <span className={`text-lg font-black ${selectedPlan?.id === plan.id ? 'text-blue-700' : 'text-gray-800'}`}>
                      {plan.size}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">{plan.duration}</span>
                    <span className={`text-sm font-black mt-2 ${selectedPlan?.id === plan.id ? 'text-blue-600' : 'text-blue-500'}`}>
                      ₦{plan.amount.toLocaleString()}
                    </span>
                  </button>
                ))}
                {filteredPlans.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-400 text-sm">No plans in this category</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="bg-blue-50 rounded-2xl p-4 flex justify-between items-center border border-blue-100">
            <div>
              <p className="text-sm font-bold text-blue-800">{selectedPlan.name}</p>
              <p className="text-xs text-blue-500">{phone || 'Enter phone number'}</p>
            </div>
            <span className="text-xl font-black text-blue-700">₦{selectedPlan.amount.toLocaleString()}</span>
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

        <button onClick={handlePurchase} disabled={loading || !selectedPlan || !phone}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg">
          {loading ? (
            <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Activating...</>
          ) : selectedPlan ? (
            `Buy ${selectedPlan.size} — ₦${selectedPlan.amount.toLocaleString()}`
          ) : ('Select a Plan')}
        </button>
      </div>
    </div>
  );
}
