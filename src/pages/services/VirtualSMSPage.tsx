import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Copy, CheckCircle, RefreshCw, X, AlertCircle, Search, ArrowLeft, Phone, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const COUNTRY_LIST = [
  { code: 'usa', name: 'United States', flag: '🇺🇸' },
  { code: 'england', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'russia', name: 'Russia', flag: '🇷🇺' },
  { code: 'ukraine', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'china', name: 'China', flag: '🇨🇳' },
  { code: 'india', name: 'India', flag: '🇮🇳' },
  { code: 'indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'brazil', name: 'Brazil', flag: '🇧🇷' },
  { code: 'france', name: 'France', flag: '🇫🇷' },
  { code: 'germany', name: 'Germany', flag: '🇩🇪' },
  { code: 'nigeria', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ghana', name: 'Ghana', flag: '🇬🇭' },
  { code: 'kenya', name: 'Kenya', flag: '🇰🇪' },
  { code: 'canada', name: 'Canada', flag: '🇨🇦' },
  { code: 'australia', name: 'Australia', flag: '🇦🇺' },
  { code: 'philippines', name: 'Philippines', flag: '🇵🇭' },
  { code: 'mexico', name: 'Mexico', flag: '🇲🇽' },
  { code: 'vietnam', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'pakistan', name: 'Pakistan', flag: '🇵🇰' },
];

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_high_risk: boolean;
  available: boolean;
  price_usd: number | null;
  price_ngn: number | null;
  status: string;
  success_rate: number;
  warning: string | null;
}

interface Order {
  id: number;
  phone: string;
  country: string;
  service: string;
  price: number;
  sms?: string;
  status?: 'active' | 'expired';
  created_at?: string;
}

function generateRef() {
  return 'PC-SMS-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default function VirtualSMSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'buy' | 'my'>('buy');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_LIST[15]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Service[]>>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [myNumbers, setMyNumbers] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchService, setSearchService] = useState('');
  const autoCheckRef = useRef<any>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  async function callFunction(name: string, body: Record<string, any>) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  useEffect(() => {
    fetchServices();
  }, [selectedCountry]);

  async function fetchServices() {
    setLoadingServices(true);
    setSelectedService(null);
    const data = await callFunction('get-services', { country: selectedCountry.code });
    if (data?.services) {
      setServices(data.services);
      setGrouped(data.grouped || {});
    }
    setLoadingServices(false);
  }

  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, svcs]) => {
    const filtered = svcs.filter(s => !searchService || s.name.toLowerCase().includes(searchService.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, Service[]>);

  async function handleBuyNumber() {
    if (!selectedService) return setError('Select a service first');
    if (!selectedService.available) return setError('No numbers available for this service. Try another country.');
    setError(''); setSuccess('');

    const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user?.id).eq('is_active', true).single();
    const price = selectedService.price_ngn || 0;
    if (!wallet || wallet.balance < price) return setError('Insufficient balance. Need N' + price);

    setLoading(true);
    const reference = generateRef();
    await supabase.from('transactions').insert({
      user_id: user?.id, wallet_id: wallet.id, type: 'debit', status: 'pending',
      amount: price, description: 'Virtual SMS - ' + selectedService.name + ' (' + selectedCountry.name + ')',
      reference, metadata: { service: selectedService.slug, country: selectedCountry.code },
    });

    const data = await callFunction('virtual-sms', { action: 'buy_number', country: selectedCountry.code, service: selectedService.slug });

    if (data?.phone) {
      const newOrder: Order = { ...data, country: selectedCountry.name, service: selectedService.name, price, status: 'active', created_at: new Date().toISOString() };
      setOrder(newOrder);
      setMyNumbers(prev => [newOrder, ...prev]);
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: price, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success' }).eq('reference', reference);
      setSuccess('Number activated! Use it on ' + selectedService.name + ' then click Check for SMS');
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(data?.error || data?.message || 'No numbers available right now. Try again later or choose another country.');
    }
    setLoading(false);
  }

  async function handleCheckSMS(targetOrder?: Order) {
    const o = targetOrder || order;
    if (!o?.id) return;
    setCheckingOrder(true);
    const data = await callFunction('virtual-sms', { action: 'check_sms', orderId: o.id });
    if (data?.sms?.length > 0) {
      const smsCode = data.sms[0]?.code ?? data.sms[0]?.text;
      const updated = { ...o, sms: smsCode };
      setOrder(updated);
      setMyNumbers(prev => prev.map(n => n.id === o.id ? updated : n));
      setSuccess('SMS received!');
      clearInterval(autoCheckRef.current);
    } else {
      setSuccess('No SMS yet. Try again in a moment.');
    }
    setCheckingOrder(false);
  }

  async function handleCancel() {
    if (!order?.id) return;
    await callFunction('virtual-sms', { action: 'cancel_order', orderId: order.id });
    setMyNumbers(prev => prev.map(n => n.id === order.id ? { ...n, status: 'expired' as const } : n));
    setOrder(null); setSuccess('Order cancelled.');
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const statusColor = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'limited') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-500';
  };

  const filteredCountries = COUNTRY_LIST.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white px-4 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Virtual SMS</h1>
            <p className="text-xs text-gray-400">International numbers for OTP verification</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
            <button onClick={() => setTab('buy')} className={'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ' + (tab === 'buy' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500')}>
              <Phone className="w-4 h-4" /> Buy Number
            </button>
            <button onClick={() => setTab('my')} className={'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ' + (tab === 'my' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500')}>
              <MessageSquare className="w-4 h-4" /> My Numbers
              {myNumbers.length > 0 && <span className="w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">{myNumbers.length}</span>}
            </button>
          </div>

          {tab === 'buy' && (
            <div className="space-y-4">
              {order && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-blue-800">Number Active</p>
                    <button onClick={handleCancel} className="text-xs text-red-500 font-semibold">Cancel</button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-3">
                    <p className="text-lg font-black text-gray-900 tracking-wider">{order.phone}</p>
                    <button onClick={() => copyText(order.phone)}>
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mb-3 text-center">Enter this number on {order.service} then click Check for SMS</p>
                  {order.sms ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs text-green-600 font-bold mb-1">SMS CODE RECEIVED ✅</p>
                      <p className="text-2xl font-black text-green-700 tracking-widest">{order.sms}</p>
                    </div>
                  ) : (
                    <button onClick={() => handleCheckSMS()} disabled={checkingOrder} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                      {checkingOrder ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</> : <><RefreshCw className="w-4 h-4" />Check for SMS</>}
                    </button>
                  )}
                </div>
              )}
   <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-3">Select Country</p>
                <button onClick={() => setShowCountryPicker(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <span className="text-sm font-semibold text-gray-800 flex-1 text-left">{selectedCountry.name}</span>
                  <span className="text-gray-400 text-xs">Change ›</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-3">Select Service</p>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchService} onChange={e => setSearchService(e.target.value)} placeholder="Search services..." className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm outline-none" />
                </div>
                {loadingServices ? (
                  <div className="flex justify-center py-8"><span className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /></div>
                ) : (
                  Object.entries(filteredGrouped).map(([category, svcs]) => (
                    <div key={category} className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">{category}</p>
                      <div className="space-y-2">
                        {svcs.map(service => (
                          <button key={service.id} onClick={() => service.available && setSelectedService(service)}
                            className={'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ' + (selectedService?.id === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-gray-50') + (!service.available ? ' opacity-50' : '')}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800">{service.name}</p>
                                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + statusColor(service.status)}>{service.status}</span>
                                {service.is_high_risk && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                              </div>
                              {service.price_ngn && <p className="text-xs text-gray-500 mt-0.5">N{service.price_ngn} • {service.success_rate}% success rate</p>}
                              {service.warning && <p className="text-xs text-yellow-600 mt-0.5">{service.warning}</p>}
                            </div>
                            {!service.available && <span className="text-xs text-red-400">Unavailable</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedService && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Estimated Price</p>
                      <p className="text-2xl font-black text-gray-900">N{selectedService.price_ngn || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Service</p>
                      <p className="text-sm font-bold text-blue-600">{selectedService.name}</p>
                    </div>
                  </div>
                  {selectedService.is_high_risk && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-xl mb-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                      <p className="text-xs text-yellow-700">Low reliability service. OTP may not arrive. Consider Google or Telegram instead.</p>
                    </div>
                  )}
                  {error && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-3"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-xs text-red-600">{error}</p></div>}
                  {success && <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl mb-3"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /><p className="text-xs text-green-600">{success}</p></div>}
                  <button onClick={handleBuyNumber} disabled={loading || !selectedService.available}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:bg-blue-200 disabled:text-blue-400">
                    {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Getting Number...</> : <><Phone className="w-4 h-4" />Get Number - N{selectedService.price_ngn}</>}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Secured by 5sim</p>
                </div>
              )}
            </div>
          )}

          {tab === 'my' && (
            <div>
              {myNumbers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Phone className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold text-sm mb-1">No active numbers</p>
                  <button onClick={() => setTab('buy')} className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-xl mt-2">Buy a Number</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myNumbers.map(num => (
                    <div key={num.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-gray-800">{num.service}</p>
                        <span className={'text-xs px-2 py-0.5 rounded-full ' + (num.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{num.status}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900 mb-2">{num.phone}</p>
                      <p className="text-xs text-gray-400 mb-3">{num.country}</p>
                      {num.sms ? (
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs text-green-600 font-bold">SMS CODE</p>
                          <p className="text-xl font-black text-green-700">{num.sms}</p>
                        </div>
                      ) : num.status === 'active' && (
                        <button onClick={() => handleCheckSMS(num)} disabled={checkingOrder} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                          {checkingOrder ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</> : <><RefreshCw className="w-4 h-4" />Check for SMS</>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
   {showCountryPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-900">Select Country</p>
              <button onClick={() => setShowCountryPicker(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <input value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Search country..." className="w-full px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm outline-none mb-3" />
            <div className="space-y-1">
              {filteredCountries.map(c => (
                <button key={c.code} onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); setCountrySearch(''); }}
                  className={'w-full flex items-center gap-3 p-3 rounded-xl ' + (selectedCountry.code === c.code ? 'bg-blue-50' : 'hover:bg-gray-50')}>
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-sm font-medium text-gray-800">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
