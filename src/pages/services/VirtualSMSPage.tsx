import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Copy, CheckCircle, RefreshCw, X, Search, ChevronDown } from 'lucide-react';
import { saveState, loadState, clearState } from '../../lib/sessionState';

interface Country { code: string; name: string; flag: string; }
interface Service { slug: string; name: string; logo: string; color: string; category: string; price_ngn: number; available: boolean; count: number; success_rate: number | null; }
interface Order { id: number; phone: string; service: string; country: string; price: number; status: 'active' | 'expired'; sms?: string; created_at: string; }

const COUNTRY_LIST: Country[] = [
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
  { code: 'bangladesh', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'malaysia', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'thailand', name: 'Thailand', flag: '🇹🇭' },
  { code: 'colombia', name: 'Colombia', flag: '🇨🇴' },
  { code: 'argentina', name: 'Argentina', flag: '🇦🇷' },
  { code: 'poland', name: 'Poland', flag: '🇵🇱' },
  { code: 'southafrica', name: 'South Africa', flag: '🇿🇦' },
  { code: 'egypt', name: 'Egypt', flag: '🇪🇬' },
  { code: 'turkey', name: 'Turkey', flag: '🇹🇷' },
];

const CATEGORIES = ['All', 'Social Media', 'Email & Tech', 'Business', 'Shopping', 'Gaming'];

const SERVICE_LOGOS: Record<string, string> = {
  whatsapp: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg',
  facebook: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg',
  instagram: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
  telegram: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg',
  twitter: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
  tiktok: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg',
  snapchat: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/snapchat.svg',
  google: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg',
  gmail: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg',
  youtube: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg',
  amazon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg',
  netflix: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg',
  uber: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/uber.svg',
  linkedin: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg',
  discord: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg',
  microsoft: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg',
  apple: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg',
  paypal: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/paypal.svg',
  spotify: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg',
  binance: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/binance.svg',
  steam: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/steam.svg',
};

const SERVICE_COLORS: Record<string, string> = {
  whatsapp: '#25D366', facebook: '#1877F2', instagram: '#E1306C',
  telegram: '#2AABEE', twitter: '#1DA1F2', tiktok: '#010101',
  snapchat: '#FFFC00', google: '#4285F4', gmail: '#EA4335',
  youtube: '#FF0000', amazon: '#FF9900', netflix: '#E50914',
  uber: '#000000', linkedin: '#0A66C2', discord: '#5865F2',
  microsoft: '#00A4EF', apple: '#555555', paypal: '#003087',
  spotify: '#1DB954', binance: '#F3BA2F', steam: '#1B2838',
};

function generateRef() {
  return 'SMS-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

const LogoBubble = ({ slug, name }: { slug: string; name: string }) => {
  const key = slug?.split('_')[0];
  const logoUrl = SERVICE_LOGOS[slug] || SERVICE_LOGOS[key];
  const color = SERVICE_COLORS[slug] || SERVICE_COLORS[key] || '#6366F1';
  const isLight = ['#FFFC00', '#F3BA2F', '#FF9900'].includes(color);
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ background: color, boxShadow: `0 4px 12px ${color}44` }}>
      {logoUrl
        ? <img src={logoUrl} alt={name} className="w-7 h-7 object-contain" style={{ filter: isLight ? 'none' : 'invert(1)' }} />
        : <span className="text-sm font-black" style={{ color: isLight ? '#111' : '#fff' }}>{name?.slice(0, 2).toUpperCase()}</span>
      }
    </div>
  );
};
export default function VirtualSMSPage() {
  const { user } = useAuth();
  const autoCheckRef = useRef<any>(null);

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRY_LIST[0]);
  const [services, setServices] = useState<Service[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Service[]>>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [order, setOrder] = useState<Order | null>(() => loadState<Order>('sms_order'));
  const [loadingServices, setLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [countryOpen, setCountryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (order) saveState('sms_order', order); else clearState('sms_order'); }, [order]);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  async function callFunction(name: string, body: Record<string, any>) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      if (!text || text.trim() === '') return { error: 'Empty response' };
      if (text.includes('no free phones')) return { error: 'no_numbers' };
      try { return JSON.parse(text); } catch { return { error: 'Invalid response' }; }
    } catch { return { error: 'Network error' }; }
  }

  useEffect(() => { fetchServices(); }, [selectedCountry]);

  async function fetchServices() {
    setLoadingServices(true); setSelectedService(null); setError('');
    const data = await callFunction('get-services', { country: selectedCountry.code });
    if (data?.services) { setServices(data.services); setGrouped(data.grouped || {}); }
    else setError('Could not load services.');
    setLoadingServices(false);
  }

  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, svcs]) => {
    if (activeCategory !== 'All' && cat !== activeCategory) return acc;
    const filtered = svcs.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, Service[]>);

  async function handleBuyNumber() {
    if (!selectedService) return setError('Select a service first');
    if (!selectedService.available || selectedService.count === 0) return setError('No numbers available. Try another country.');
    setError(''); setSuccess('');
    const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', user?.id).eq('is_active', true).single();
    const price = selectedService.price_ngn || 0;
    if (!wallet || wallet.balance < price) return setError('Insufficient balance. Need ₦' + price);
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
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: price, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success' }).eq('reference', reference);
      setSuccess('Number activated! Use it on ' + selectedService.name + ' then click Check SMS');
      autoCheckRef.current = setInterval(() => handleCheckSMS(newOrder), 8000);
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(data?.error === 'no_numbers' ? 'No numbers available. Try another country.' : data?.error || 'Failed. Try again.');
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
      setOrder(updated); setSuccess('SMS received!');
      clearInterval(autoCheckRef.current);
    } else { setSuccess('No SMS yet. Try again in a moment.'); }
    setCheckingOrder(false);
  }

  async function handleCancel() {
    if (!order?.id) return;
    await callFunction('virtual-sms', { action: 'cancel_order', orderId: order.id });
    clearInterval(autoCheckRef.current);
    setOrder(null); setSuccess('Order cancelled.');
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  // Active Order View
  if (order && order.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-16">
          <div className="max-w-md mx-auto">
            <h1 className="text-white text-2xl font-black mb-1">Virtual SMS</h1>
            <p className="text-blue-200 text-sm">Your number is active</p>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
          {/* Number Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-blue-100 text-sm font-semibold">{order.service}</span>
                <span className="bg-green-400 text-green-900 text-xs font-black px-3 py-1 rounded-full">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-3xl font-black tracking-wider">{order.phone}</span>
                <button onClick={() => copyText(order.phone)}
                  className="bg-white/20 p-2 rounded-xl">
                  {copied ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5 text-white" />}
                </button>
              </div>
              <p className="text-blue-200 text-xs mt-2">{order.country} • ₦{order.price}</p>
            </div>

            {/* SMS Result */}
            {order.sms ? (
              <div className="p-5">
                <p className="text-xs font-bold text-gray-500 mb-2">SMS RECEIVED</p>
                <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-2xl font-black text-green-700">{order.sms}</span>
                  <button onClick={() => copyText(order.sms!)} className="bg-green-100 p-2 rounded-xl">
                    {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-green-600" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-blue-600 text-sm font-semibold">Waiting for SMS...</p>
                  <p className="text-blue-400 text-xs mt-1">Use this number on {order.service} then click Check SMS</p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl border border-red-100"><span className="text-red-500 text-sm">{error}</span></div>}
          {success && <div className="flex gap-2 p-3 bg-green-50 rounded-xl border border-green-100"><span className="text-green-700 text-sm">{success}</span></div>}

          {/* Action Buttons */}
          <button onClick={() => handleCheckSMS()} disabled={checkingOrder}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black rounded-2xl flex items-center justify-center gap-2">
            <RefreshCw className={`w-5 h-5 ${checkingOrder ? 'animate-spin' : ''}`} />
            {checkingOrder ? 'Checking...' : 'Check SMS'}
          </button>
          <button onClick={handleCancel}
            className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-2xl flex items-center justify-center gap-2 border border-red-100">
            <X className="w-5 h-5" />
            Cancel Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-2xl font-black">Virtual SMS</h1>
              <p className="text-blue-200 text-sm">Receive OTPs from 200+ services</p>
            </div>
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">5SIM</span>
          </div>

          {/* Country Selector */}
          <div className="relative">
            <button onClick={() => setCountryOpen(o => !o)}
              className="w-full flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span className="text-white font-semibold flex-1 text-left">{selectedCountry.name}</span>
              <ChevronDown className="w-4 h-4 text-white/70" />
            </button>
            {countryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
                {COUNTRY_LIST.map(c => (
                  <button key={c.code} onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCountry.code === c.code ? 'bg-blue-50' : ''}`}>
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-12 space-y-4">
        {/* Search + Category */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search service (WhatsApp, Google...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${activeCategory === cat ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'}`}>
                {cat}
              </button>
            ))}
          </div>
{/* Services List */}
          <div className="max-h-96 overflow-y-auto">
            {loadingServices ? (
              <div className="flex items-center justify-center py-12">
                <span className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : Object.keys(filteredGrouped).length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No services found</div>
            ) : (
              Object.entries(filteredGrouped).map(([cat, svcs]) => (
                <div key={cat}>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{cat}</span>
                  </div>
                  {svcs.map(svc => (
                    <button key={svc.slug} onClick={() => setSelectedService(svc)}
                      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 transition-all ${selectedService?.slug === svc.slug ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <LogoBubble slug={svc.slug} name={svc.name} />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-gray-800">{svc.name}</p>
                        <p className="text-xs text-gray-400">
                          {svc.count > 0 ? `${svc.count} available` : 'Sold out'}
                          {svc.success_rate && ` • ${svc.success_rate}% success`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-blue-600">₦{svc.price_ngn}</p>
                        {!svc.available || svc.count === 0
                          ? <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Sold Out</span>
                          : svc.count < 10
                          ? <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">Limited</span>
                          : <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Available</span>
                        }
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Service */}
        {selectedService && (
          <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3 border border-blue-100">
            <LogoBubble slug={selectedService.slug} name={selectedService.name} />
            <div className="flex-1">
              <p className="font-bold text-blue-800">{selectedService.name}</p>
              <p className="text-xs text-blue-500">{selectedCountry.flag} {selectedCountry.name}</p>
            </div>
            <span className="text-xl font-black text-blue-700">₦{selectedService.price_ngn}</span>
          </div>
        )}

        {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl border border-red-100"><span className="text-red-600 text-sm">{error}</span></div>}
        {success && <div className="flex gap-2 p-3 bg-green-50 rounded-xl border border-green-100"><span className="text-green-700 text-sm">{success}</span></div>}

        <button onClick={handleBuyNumber} disabled={loading || !selectedService || !selectedService?.available}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black rounded-2xl flex items-center justify-center gap-2 text-lg">
          {loading
            ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Getting Number...</>
            : selectedService ? `Get ${selectedService.name} Number — ₦${selectedService.price_ngn}` : 'Select a Service'
          }
        </button>
      </div>
    </div>
  );
}
