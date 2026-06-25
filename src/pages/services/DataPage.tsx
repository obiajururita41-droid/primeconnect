import BackButton from '../../components/ui/BackButton';
import { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle2, Tag, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { saveState, loadState, clearState } from '../../lib/sessionState';

const NETWORKS = [
  { id: 'mtn',     name: 'MTN',     bg: 'bg-yellow-400', text: 'text-black',  border: 'border-yellow-400', networkKey: 'MTN' },
  { id: 'airtel',  name: 'Airtel',  bg: 'bg-red-500',    text: 'text-white',  border: 'border-red-500',    networkKey: 'Airtel' },
  { id: 'glo',     name: 'Glo',     bg: 'bg-green-500',  text: 'text-white',  border: 'border-green-500',  networkKey: 'Glo' },
  { id: '9mobile', name: '9mobile', bg: 'bg-green-800',  text: 'text-white',  border: 'border-green-800',  networkKey: 'm_9mobile' },
];

const CATEGORIES = ['All', 'Daily', 'Weekly', 'Monthly'];

interface DataPlan { id: string; name: string; amount: number; category: string; size: string; duration: string; popular?: boolean; bestValue?: boolean; }

function generateRef() {
  return `PC-DATA-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function parsePlan(p: any, network: string = "mtn"): DataPlan {
  const name = p.PRODUCT_NAME
    .replace(' (Awoof Data)', '').replace(' (Direct Data)', '').replace(' (SME)', '').trim();
  const isSME = p.PRODUCT_NAME.includes("SME");
  const markupMap: Record<string,number> = { mtn: 1.08, airtel: 1.05, glo: 1.10, "9mobile": 1.08 };
  const markup = isSME ? (markupMap[network] || 1.08) : 1.03;
  const amount = Math.round(Number(p.PRODUCT_AMOUNT) * markup);
  const sizeMatch = name.match(/^([\d.]+\s*[GMKB]+)/i);
  const size = sizeMatch ? sizeMatch[1].trim() : name.split('-')[0].trim();
  const durMatch = name.match(/(\d+)\s*(day|week|month|min)/i);
  const duration = durMatch ? `${durMatch[1]} ${durMatch[2]}${Number(durMatch[1]) > 1 ? 's' : ''}` : '';
  const lower = name.toLowerCase();
  let category = "Monthly";
  if (lower.includes("daily") || lower.includes("1 day")) category = "Daily";
  else if (lower.includes("weekly") || lower.includes("7 day")) category = "Weekly";
  else if (lower.includes("monthly")) category = "Monthly";
  else {
    const dayMatch = lower.match(/-\s*(\d+)\s*days?/);
    const days = dayMatch ? parseInt(dayMatch[1]) : 30;
    if (days === 1) category = "Daily";
    else if (days >= 2 && days <= 7) category = "Weekly";
    else category = "Monthly";
  }
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
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => { saveState('data_network', network); }, [network]);
  useEffect(() => { saveState('data_phone', phone); }, [phone]);

  useEffect(() => {
    supabase.from('wallets').select('balance')
      .eq('user_id', user?.id).eq('is_active', true).single()
      .then(({ data }) => { if (data) setWalletBalance(data.balance); });
  }, [user]);

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
          const parsed = networkData[0].PRODUCT.map((p: any) => parsePlan(p, network));
          // mark popular and best value
          parsed[1] && (parsed[1].popular = true);
          parsed[4] && (parsed[4].bestValue = true);
          setPlans(parsed);
        } else { setError('No plans available'); }
      })
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoadingPlans(false));
  }, [network]);

  const filteredPlans = activeCategory === 'All' ? plans : plans.filter(p => p.category === activeCategory);

  const isValid = network && /^(070|071|080|081|090|091)\d{8}$/.test(phone) && selectedPlan;

  const handlePurchase = async () => {
    setError(''); setSuccess('');
    if (!network)      return setError('Select a network');
    if (!selectedPlan) return setError('Select a data plan');
    if (!/^(070|071|080|081|090|091)\d{8}$/.test(phone)) return setError('Enter a valid 11-digit Nigerian phone number');
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
      amount: numAmount, description: `${network.toUpperCase()} ${selectedPlan.size} → ${phone}`,
      reference, metadata: { network, phone, plan: selectedPlan },
    });
    const res = await callClubKonnect('buy_data', { network, phone, dataPlan: selectedPlan.id, requestId: reference });
    if (res?.statuscode === '100' || res?.statuscode === '200' || res?.status === 'ORDER_RECEIVED' || res?.status === 'ORDER_COMPLETED') {
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: numAmount, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success' }).eq('reference', reference);
      setWalletBalance(prev => prev - numAmount);
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
      <BackButton />

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-20">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-black mb-1">Buy Data</h1>
          <p className="text-blue-200 text-sm mb-4">Instant activation on all networks</p>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">⚡ Instant Delivery</span>
            <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">🔒 Secure Payment</span>
            <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">🎁 Best Prices</span>
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
              <button key={n.id} onClick={() => { setNetwork(n.id); setActiveCategory('All'); }}
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

        {/* Plans */}
        {network && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Select Plan</p>
            </div>
            {/* Category Tabs */}
            <div className="flex border-b border-gray-100 px-2 pt-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-full mx-1 mb-1 transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
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
                    className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    {plan.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">POPULAR</span>
                    )}
                    {plan.bestValue && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">BEST VALUE</span>
                    )}
                    <span className={`text-base font-black mt-1 ${selectedPlan?.id === plan.id ? 'text-blue-700' : 'text-gray-800'}`}>{plan.size}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{plan.duration}</span>
                    <span className={`text-sm font-black mt-2 ${selectedPlan?.id === plan.id ? 'text-blue-600' : 'text-blue-500'}`}>₦{plan.amount.toLocaleString()}</span>
                    {plan.amount < 500 && (
                      <span className="mt-1 text-[9px] font-bold text-orange-500">🔥 Best Price</span>
                    )}
                  </button>
                ))}
                {filteredPlans.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-400 text-sm">No plans in this category</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        {selectedPlan && phone && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2.5">
            <p className="text-sm font-bold text-gray-800 mb-1">Order Summary</p>
            {[
              ['Network', NETWORKS.find(n => n.id === network)?.name || ''],
              ['Phone Number', phone],
              ['Plan', `${selectedPlan.size} · ${selectedPlan.duration}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2.5 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">Total Payable</span>
              <span className="text-lg font-black text-blue-600">₦{selectedPlan.amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Cashback Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <Tag className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-700">All data plans are valid for selected networks</p>
            <p className="text-xs text-blue-500">and are non-refundable.</p>
          </div>
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
            ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Activating...</>
            : isValid ? `Continue to Pay — ₦${selectedPlan!.amount.toLocaleString()}` : 'Continue to Pay'
          }
        </button>

      </div>
    </div>
  );
}
