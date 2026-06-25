import BackButton from '../../components/ui/BackButton';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Copy, CheckCircle, RefreshCw, X, Search, ChevronDown, Phone, Clock, AlertTriangle } from 'lucide-react';
import CountryDropdown from '../../components/CountryDropdown';
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
  const [copiedSms, setCopiedSms] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => { if (order) saveState('sms_order', order); else clearState('sms_order'); }, [order]);
  useEffect(() => { fetchServices(); }, [selectedCountry]);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!order || order.status !== 'active') return;
    const EXPIRY_MINUTES = 19;
    const created = new Date(order.created_at).getTime();

    const tick = () => {
      const elapsed = (Date.now() - created) / 1000;
      const remaining = Math.max(0, EXPIRY_MINUTES * 60 - elapsed);
      setTimeLeft(Math.floor(remaining));
      if (remaining <= 0) {
        callFunction('virtual-sms', { action: 'cancel_order', orderId: order.id }).then(() => {
          supabase.rpc('credit_wallet', { p_user_id: user?.id, p_amount: order.price, p_reference: 'REFUND-EXP-' + order.id });
          setOrder(null);
          setSuccess('Number expired. ₦' + order.price + ' has been refunded to your wallet.');
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return m + ':' + s;
  };

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

  async function fetchServices() {
    setLoadingServices(true); setSelectedService(null); setError('');
    const data = await callFunction('get-services', { country: selectedCountry.code });
    if (data?.services) { setGrouped(data.grouped || {}); setError(''); }
    else if (!data?.services && Object.keys(grouped).length === 0) setError('Could not load services.');
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
    await supabase.rpc('credit_wallet', { p_user_id: user?.id, p_amount: order.price, p_reference: 'REFUND-CANCEL-' + order.id });
    setOrder(null); setSuccess('Order cancelled. ₦' + order.price + ' refunded to your wallet.');
  }

  function copyText(text: string, type: 'phone' | 'sms' = 'phone') {
    navigator.clipboard.writeText(text);
    if (type === 'sms') { setCopiedSms(true); setTimeout(() => setCopiedSms(false), 2000); }
    else { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  // ── Active Order View ──────────────────────────────────────────────
  if (order && order.status === 'active') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-10 pb-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-white text-xl font-black">Virtual SMS</h1>
            </div>
            <p className="text-blue-200 text-sm ml-11">Number is active — waiting for OTP</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-14 space-y-3">

          {/* Service badge */}
          <div className="flex items-center gap-2">
            <LogoBubble slug={order.service.toLowerCase().replace(/\s/g,'')} name={order.service} />
            <div>
              <p className="text-white font-bold text-sm">{order.service}</p>
              <p className="text-blue-200 text-xs">{order.country} · ₦{order.price}</p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1">
              <span className="flex items-center gap-1.5 bg-green-400/20 border border-green-400/30 text-green-300 text-xs font-bold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                ACTIVE
              </span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${timeLeft <= 60 ? 'bg-red-500/30 text-red-300 animate-pulse' : timeLeft <= 180 ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/10 text-white/70'}`}>
                ⏱ {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Phone number card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Virtual Number</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-2xl font-black text-gray-900 tracking-wider">{order.phone}</span>
              <button onClick={() => copyText(order.phone, 'phone')}
                className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center transition-all active:scale-95">
                {copied
                  ? <CheckCircle className="w-5 h-5 text-green-500" />
                  : <Copy className="w-5 h-5 text-blue-600" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 p-3 bg-blue-50 rounded-xl">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-blue-600 text-xs font-medium">Enter this number on <span className="font-bold">{order.service}</span>, then tap Check SMS below</p>
            </div>
            {timeLeft <= 180 && timeLeft > 0 && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-red-600 text-xs font-bold">Number expires in {formatTime(timeLeft)}! Auto-refund if unused.</p>
              </div>
            )}
            {timeLeft <= 60 && timeLeft > 0 && (
              <div className="flex items-center gap-2 mt-2 p-3 bg-red-100 rounded-xl border border-red-200 animate-pulse">
                <span className="text-red-600 text-lg">🚨</span>
                <p className="text-red-700 text-xs font-black">Less than 1 minute left! Cancel now for instant refund.</p>
              </div>
            )}
          </div>

          {/* SMS result */}
          {order.sms ? (
            <div className="bg-white rounded-2xl shadow-md border border-green-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-sm font-bold text-green-700">OTP Received!</p>
              </div>
              <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-4 border border-green-100">
                <span className="text-3xl font-black text-green-700 tracking-widest">{order.sms}</span>
                <button onClick={() => copyText(order.sms!, 'sms')}
                  className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center active:scale-95">
                  {copiedSms
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <Copy className="w-5 h-5 text-green-600" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <div className="flex flex-col items-center py-4 gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-gray-500 text-sm text-center">No SMS received yet.<br/>After entering the number, tap Check SMS.</p>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}
          {success && !order.sms && (
            <div className="flex items-center gap-2 p-3.5 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Buttons */}
          <button onClick={() => handleCheckSMS()} disabled={checkingOrder}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95">
            <RefreshCw className={`w-5 h-5 ${checkingOrder ? 'animate-spin' : ''}`} />
            {checkingOrder ? 'Checking for SMS...' : 'Check SMS'}
          </button>

          <button onClick={handleCancel}
            className="w-full py-3.5 bg-white hover:bg-red-50 text-red-500 font-semibold rounded-2xl flex items-center justify-center gap-2 border border-red-100 transition-all active:scale-95">
            <X className="w-4 h-4" />
            Cancel & Refund
          </button>

        </div>
      </div>
    );
  }
// ── Service Picker View ───────────────────────────────────────────
  const categories = ['All', ...Object.keys(grouped)];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <BackButton />
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4 pt-10 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-black leading-tight">Virtual Numbers</h1>
              <p className="text-blue-200 text-xs font-medium">Instant OTP · No SIM needed</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 flex-1 text-center">
              <p className="text-white font-black text-lg">30+</p>
              <p className="text-blue-200 text-xs">Countries</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 flex-1 text-center">
              <p className="text-white font-black text-lg">500K+</p>
              <p className="text-blue-200 text-xs">Numbers</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2.5 flex-1 text-center">
              <p className="text-white font-black text-lg">Instant</p>
              <p className="text-blue-200 text-xs">Delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-14 space-y-3">

        <CountryDropdown countries={COUNTRY_LIST} selected={selectedCountry} onChange={(c) => setSelectedCountry(c)} />

        {/* Search */}
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-md border border-gray-100 px-4 py-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service (WhatsApp, Telegram...)"
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Trust bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3">
          <div className="grid grid-cols-4 gap-1">
            {[
              { icon: '🔒', title: 'Secure', sub: 'Data protected' },
              { icon: '⚡', title: 'Instant', sub: 'Get numbers fast' },
              { icon: '🌍', title: '30+ Countries', sub: 'Worldwide' },
              { icon: '🎧', title: '24/7 Support', sub: 'Always here' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-0.5">
                <span className="text-base">{item.icon}</span>
                <p className="text-[9px] font-black text-gray-700 leading-tight">{item.title}</p>
                <p className="text-[8px] text-gray-400 leading-tight">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-200 hover:text-blue-500'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        {/* Service list */}
        {loadingServices ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            <p className="text-gray-400 text-sm">Loading services...</p>
          </div>
        ) : Object.keys(filteredGrouped).length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <p className="text-gray-400 text-sm text-center">No services found.</p>
          </div>
        ) : (
          Object.entries(filteredGrouped).map(([cat, svcs]) => {
            const available = svcs.filter(s => s.available && s.count > 0);
            const outOfStock = svcs.filter(s => !s.available || s.count === 0);
            const sorted = [...available, ...outOfStock];
            return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-black text-gray-900">{cat}</p>
                <span className="text-xs text-blue-600 font-semibold">{available.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sorted.map((s) => {
                  const isSelected = selectedService?.slug === s.slug;
                  const isOut = !s.available || s.count === 0;
                  return (
                    <button key={s.slug} disabled={isOut}
                      onClick={() => setSelectedService(s)}
                      className={`relative flex flex-col items-start gap-2 p-3 rounded-2xl border transition-all text-left ${
                        isOut
                          ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100'
                          : isSelected
                            ? 'bg-blue-50 border-blue-300 shadow-md shadow-blue-100'
                            : 'bg-white border-gray-100 shadow-sm active:scale-95'
                      }`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        </div>
                      )}
                      <LogoBubble slug={s.slug} name={s.name} />
                      <div className="w-full">
                        <p className={`text-xs font-black leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                          {s.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {isOut ? 'Out of stock' : `${s.count.toLocaleString()} available`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        {isOut ? (
                          <span className="text-xs text-gray-300 font-medium">–</span>
                        ) : (
                          <span className={`text-sm font-black ${isSelected ? 'text-blue-600' : 'text-green-600'}`}>
                            ₦{s.price_ngn.toLocaleString()}
                          </span>
                        )}
                        {!isOut && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            ⚡ Instant
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Sticky buy bar */}
      {selectedService && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-md mx-auto bg-white border-t border-gray-100 px-4 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <LogoBubble slug={selectedService.slug} name={selectedService.name} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">Ready to activate</p>
                <p className="text-sm font-black text-gray-900 truncate">{selectedService.name}</p>
              </div>
              <div className="text-right mr-1">
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-sm font-black text-blue-600">₦{selectedService.price_ngn}</p>
              </div>
              <button onClick={handleBuyNumber} disabled={loading}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all shrink-0">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Get Number'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
