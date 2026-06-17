import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, RefreshCw, X, Search, Phone } from 'lucide-react';
import { saveState, loadState, clearState } from '../../lib/sessionState';

interface Country { code: string; name: string; flag: string; }
interface Service { slug: string; name: string; logo: string; color: string; category: string; price_ngn: number; available: boolean; count: number; success_rate: number | null; is_high_risk?: boolean; }
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
  { code: 'cambodia', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'myanmar', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'southafrica', name: 'South Africa', flag: '🇿🇦' },
  { code: 'egypt', name: 'Egypt', flag: '🇪🇬' },
  { code: 'turkey', name: 'Turkey', flag: '🇹🇷' },
];

const CATEGORIES = ['All', 'Social Media', 'Email & Tech', 'Business', 'Shopping', 'Gaming'];

function generateRef() {
  return 'SMS-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

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
  whatsapp: '#25D366',
  facebook: '#1877F2',
  instagram: '#E1306C',
  telegram: '#2AABEE',
  twitter: '#1DA1F2',
  tiktok: '#010101',
  snapchat: '#FFFC00',
  google: '#4285F4',
  gmail: '#EA4335',
  youtube: '#FF0000',
  amazon: '#FF9900',
  netflix: '#E50914',
  uber: '#000000',
  linkedin: '#0A66C2',
  discord: '#5865F2',
  microsoft: '#00A4EF',
  apple: '#555555',
  paypal: '#003087',
  spotify: '#1DB954',
  binance: '#F3BA2F',
  steam: '#1B2838',
};

const LogoBubble = ({ slug, name }: { slug: string; name: string }) => {
  const logoUrl = SERVICE_LOGOS[slug] || SERVICE_LOGOS[slug?.split('_')[0]];
  const color = SERVICE_COLORS[slug] || SERVICE_COLORS[slug?.split('_')[0]] || '#6366F1';
  const isLight = ['#FFFC00','#F3BA2F','#FF9900'].includes(color);
  if (logoUrl) {
    return (
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 2px 8px ${color}55`, padding: 8 }}>
        <img src={logoUrl} alt={name} style={{ width: 24, height: 24, filter: isLight ? 'invert(0)' : 'invert(1)', objectFit: 'contain' }} />
      </div>
    );
  }
  return (
    <div style={{ width: 40, height: 40, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: isLight ? '#111' : '#fff', flexShrink: 0, boxShadow: `0 2px 8px ${color}55` }}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  );
};

const SkeletonCard = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', marginBottom: 8 }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E2E8F0' }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: '55%', height: 13, borderRadius: 4, background: '#E2E8F0', marginBottom: 6 }} />
      <div style={{ width: '35%', height: 11, borderRadius: 4, background: '#E2E8F0' }} />
    </div>
    <div style={{ width: 55, height: 22, borderRadius: 20, background: '#E2E8F0' }} />
  </div>
);

const StatusBadge = ({ available, count }: { available: boolean; count: number }) => {
  if (!available || count === 0) return <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>Sold Out</span>;
  if (count < 10) return <span style={{ background: '#FEF9C3', color: '#CA8A04', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>Limited</span>;
  return <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>Available</span>;
};
export default function VirtualSMSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const autoCheckRef = useRef<any>(null);
  useEffect(() => { if (order) saveState('sms_order', order); else clearState('sms_order'); }, [order]);

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRY_LIST[0]);
  const [services, setServices] = useState<Service[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Service[]>>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [order, setOrder] = useState<Order | null>(() => loadState<Order>('sms_order'));
  const [myNumbers, setMyNumbers] = useState<Order[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchService, setSearchService] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [countryOpen, setCountryOpen] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

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
      if (!text || text.trim() === '') return { error: 'Empty response from server' };
      if (text.includes('no free phones') || text.includes('no free activation')) return { error: 'no_numbers' };
      if (text.startsWith('bad_') || text === 'banned') return { error: 'provider_error' };
      try { return JSON.parse(text); } catch { return { error: 'Invalid response from provider' }; }
    } catch (err: any) {
      return { error: 'Network error. Check your connection.' };
    }
  }

  useEffect(() => { fetchServices(); }, [selectedCountry]);

  async function fetchServices() {
    setLoadingServices(true);
    setSelectedService(null);
    setError('');
    const data = await callFunction('get-services', { country: selectedCountry.code });
    if (data?.services) {
      setServices(data.services);
      setGrouped(data.grouped || {});
    } else {
      setError('Could not load services. Please try again.');
    }
    setLoadingServices(false);
  }

  const filteredGrouped = Object.entries(grouped).reduce((acc, [cat, svcs]) => {
    const catMatch = activeCategory === 'All' || cat === activeCategory;
    if (!catMatch) return acc;
    const filtered = svcs.filter(s => !searchService || s.name.toLowerCase().includes(searchService.toLowerCase()));
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
      setMyNumbers(prev => [newOrder, ...prev]);
      await supabase.rpc('debit_wallet', { p_user_id: user?.id, p_amount: price, p_reference: reference });
      await supabase.from('transactions').update({ status: 'success' }).eq('reference', reference);
      setSuccess('Number activated! Use it on ' + selectedService.name + ' then click Check SMS');
      autoCheckRef.current = setInterval(() => handleCheckSMS(newOrder), 8000);
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      const msg = data?.error === 'no_numbers' ? 'No numbers available right now. Try another country.' : data?.error || 'Failed to get number. Try again.';
      setError(msg);
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
    clearInterval(autoCheckRef.current);
    setMyNumbers(prev => prev.map(n => n.id === order.id ? { ...n, status: 'expired' as const } : n));
    setOrder(null); setSuccess('Order cancelled.');
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  function toggleCategory(cat: string) {
    setCollapsedCats(prev => { const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next; });
  }
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: '#F8FAFC', minHeight: '100vh', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)', padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Virtual SMS</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Receive OTPs from 200+ services worldwide</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, letterSpacing: 1 }}>5SIM</div>
      </div>

      <div style={{ margin: '16px 16px 0' }}>

        {/* Error/Success */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div style={{ flex: 1, fontSize: 13, color: '#991B1B', fontWeight: 600 }}>{error}</div>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontSize: 20 }}>×</button>
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <div style={{ flex: 1, fontSize: 13, color: '#065F46', fontWeight: 600 }}>{success}</div>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontSize: 20 }}>×</button>
          </div>
        )}

        {/* Country Selector */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 1.2, marginBottom: 8 }}>SELECT COUNTRY</div>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} onClick={() => setCountryOpen(o => !o)}>
            <span style={{ fontSize: 24 }}>{selectedCountry.flag}</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{selectedCountry.name}</span>
            <span style={{ marginLeft: 'auto', color: '#94A3B8' }}>{countryOpen ? '▲' : '▼'}</span>
          </button>
          {countryOpen && (
            <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 260, overflowY: 'auto' }}>
              {COUNTRY_LIST.map(c => (
                <button key={c.code} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', cursor: 'pointer', background: c.code === selectedCountry.code ? '#EFF6FF' : 'transparent', fontWeight: c.code === selectedCountry.code ? 700 : 400, textAlign: 'left' }}
                  onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}>
                  <span style={{ fontSize: 20 }}>{c.flag}</span>
                  <span style={{ fontSize: 14 }}>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 1.2, marginBottom: 8 }}>SELECT SERVICE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <span style={{ color: '#94A3B8' }}>🔍</span>
          <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#111827' }} placeholder="Search services..." value={searchService} onChange={e => setSearchService(e.target.value)} />
          {searchService && <button onClick={() => setSearchService('')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 18 }}>×</button>}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, cursor: 'pointer', background: activeCategory === cat ? '#2563EB' : '#F1F5F9', color: activeCategory === cat ? '#fff' : '#64748B', fontWeight: activeCategory === cat ? 700 : 500 }}
              onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        {/* Service List */}
        {loadingServices ? (
          <div>{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : Object.keys(filteredGrouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontWeight: 600, color: '#374151' }}>No services found</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Try a different search or country</div>
          </div>
        ) : (
          Object.entries(filteredGrouped).map(([cat, svcs]) => (
            <div key={cat}>
              <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px 6px', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => toggleCategory(cat)}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', letterSpacing: 1.5 }}>{cat.toUpperCase()}</span>
                <span style={{ color: '#94A3B8', fontSize: 12 }}>{collapsedCats.has(cat) ? '▼' : '▲'}</span>
              </button>
              {!collapsedCats.has(cat) && svcs.map(svc => (
                <button key={svc.slug} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: selectedService?.slug === svc.slug ? '2px solid #2563EB' : '1.5px solid #E5E7EB', background: selectedService?.slug === svc.slug ? '#EFF6FF' : '#fff' }}
                  onClick={() => { setSelectedService(svc); setError(''); setSuccess(''); }}>
                  <LogoBubble slug={svc.slug} name={svc.name} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{svc.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {svc.count > 0 ? `${svc.count.toLocaleString()} available` : 'Check another country'}
                      {svc.success_rate != null && ` · ${svc.success_rate}% success`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge available={svc.available} count={svc.count} />
                    {svc.price_ngn > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>₦{svc.price_ngn}</span>}
                  </div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
      {/* Purchase Card */}
      {selectedService && !order && (
        <div style={{ margin: '16px 16px 0', background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <LogoBubble slug={selectedService.slug} name={selectedService.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{selectedService.name}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 1 }}>{selectedCountry.flag} {selectedCountry.name}</div>
            </div>
            {selectedService.is_high_risk && <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>High Demand</span>}
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: '10px 0', textAlign: 'center', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>₦{selectedService.price_ngn}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>PRICE</div>
            </div>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: '10px 0', textAlign: 'center', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{selectedService.count.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>AVAILABLE</div>
            </div>
            <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: '10px 0', textAlign: 'center', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{selectedService.success_rate != null ? `${selectedService.success_rate}%` : '—'}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, marginTop: 2 }}>SUCCESS</div>
            </div>
          </div>

          <button
            style={{ width: '100%', padding: '15px', background: selectedService.available && selectedService.count > 0 ? 'linear-gradient(135deg, #1E40AF, #2563EB)' : '#E5E7EB', color: selectedService.available && selectedService.count > 0 ? '#fff' : '#9CA3AF', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: selectedService.available && selectedService.count > 0 ? 'pointer' : 'not-allowed', boxShadow: selectedService.available && selectedService.count > 0 ? '0 4px 16px rgba(37,99,235,0.4)' : 'none' }}
            disabled={!selectedService.available || selectedService.count === 0 || loading}
            onClick={handleBuyNumber}>
            {loading ? '⏳ Getting Number...' : !selectedService.available || selectedService.count === 0 ? '📵 No Numbers Available' : `📱 Get Number — ₦${selectedService.price_ngn}`}
          </button>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>🔒 Secured by 5SIM</div>
        </div>
      )}

      {/* Active Order Card */}
      {order && (
        <div style={{ margin: '16px 16px 0', background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #E5E7EB' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#2563EB', letterSpacing: 1.5, marginBottom: 8 }}>ACTIVE NUMBER</div>
          <div style={{ background: order.sms ? '#ECFDF5' : '#EFF6FF', border: `1.5px solid ${order.sms ? '#6EE7B7' : '#BFDBFE'}`, borderRadius: 14, padding: '16px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: order.sms ? '#065F46' : '#1E40AF', letterSpacing: 2, marginBottom: 6 }}>{order.phone}</div>
            <button onClick={() => copyText(order.phone)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
              {copied ? '✅ Copied!' : '📋 Copy Number'}
            </button>
          </div>

          {order.sms ? (
            <div style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: 14, padding: '14px 16px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: 1.5, marginBottom: 6 }}>SMS RECEIVED ✓</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#065F46', letterSpacing: 6 }}>{order.sms}</div>
              <button onClick={() => copyText(order.sms!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', fontSize: 13, fontWeight: 600, marginTop: 6 }}>
                {copied ? '✅ Copied!' : '📋 Copy Code'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', fontSize: 13, marginBottom: 14 }}>⏳ Waiting for SMS... Use the number on {order.service} now</div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleCheckSMS()} disabled={checkingOrder}
              style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg, #1E40AF, #2563EB)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: checkingOrder ? 0.7 : 1 }}>
              {checkingOrder ? '⏳ Checking...' : '🔄 Check SMS'}
            </button>
            <button onClick={handleCancel}
              style={{ padding: '13px 16px', background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              ✕ Cancel
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>🔒 Secured by 5SIM</div>
        </div>
      )}
    </div>
  );
}
