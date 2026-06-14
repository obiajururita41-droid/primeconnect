import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Copy, CheckCircle, RefreshCw, X, AlertCircle, Search, ArrowLeft, Phone, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const POPULAR_SERVICES = [
  { id: 'telegram',  name: 'Telegram',  color: 'bg-blue-400',  logo: 'TG' },
  { id: 'whatsapp',  name: 'WhatsApp',  color: 'bg-green-500', logo: 'WA' },
  { id: 'google',    name: 'Google',    color: 'bg-red-500',   logo: 'G'  },
  { id: 'facebook',  name: 'Facebook',  color: 'bg-blue-600',  logo: 'FB' },
  { id: 'twitter',   name: 'Twitter',   color: 'bg-black',     logo: 'X'  },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500',  logo: 'IG' },
  { id: 'tiktok',    name: 'TikTok',    color: 'bg-gray-900',  logo: 'TT' },
  { id: 'uber',      name: 'Uber',      color: 'bg-gray-800',  logo: 'UB' },
];

const COUNTRY_LIST = [
  { code: 'usa',         name: 'United States',  flag: '🇺🇸' },
  { code: 'england',     name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'russia',      name: 'Russia',         flag: '🇷🇺' },
  { code: 'ukraine',     name: 'Ukraine',        flag: '🇺🇦' },
  { code: 'china',       name: 'China',          flag: '🇨🇳' },
  { code: 'india',       name: 'India',          flag: '🇮🇳' },
  { code: 'indonesia',   name: 'Indonesia',      flag: '🇮🇩' },
  { code: 'brazil',      name: 'Brazil',         flag: '🇧🇷' },
  { code: 'france',      name: 'France',         flag: '🇫🇷' },
  { code: 'germany',     name: 'Germany',        flag: '🇩🇪' },
  { code: 'nigeria',     name: 'Nigeria',        flag: '🇳🇬' },
  { code: 'ghana',       name: 'Ghana',          flag: '🇬🇭' },
  { code: 'kenya',       name: 'Kenya',          flag: '🇰🇪' },
  { code: 'canada',      name: 'Canada',         flag: '🇨🇦' },
  { code: 'australia',   name: 'Australia',      flag: '🇦🇺' },
  { code: 'philippines', name: 'Philippines',    flag: '🇵🇭' },
  { code: 'mexico',      name: 'Mexico',         flag: '🇲🇽' },
  { code: 'vietnam',     name: 'Vietnam',        flag: '🇻🇳' },
  { code: 'pakistan',    name: 'Pakistan',       flag: '🇵🇰' },
];

interface Order {
  id: number;
  phone: string;
  country: string;
  service: string;
  price: number;
  sms?: string;
  status?: "active" | "expired";
  created_at?: string;
}

function generateRef() {
  return "PC-SMS-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

export default function VirtualSMSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"buy" | "my">("buy");
  const [myNumbersTab, setMyNumbersTab] = useState<"active" | "expired">("active");
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_LIST[0]);
  const [selectedService, setSelectedService] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [myNumbers, setMyNumbers] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingOrder, setCheckingOrder] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [viewingSMS, setViewingSMS] = useState<Order | null>(null);
  const autoCheckRef = useRef<any>(null);

  useEffect(() => {
    if (order && !order.sms) {
      autoCheckRef.current = setInterval(() => {
        handleCheckSMS();
      }, 30000);
    }
    return () => clearInterval(autoCheckRef.current);
  }, [order]);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const FUNCTION_URL = SUPABASE_URL + "/functions/v1/virtual-sms";

  async function callFunction(body: Record<string, any>) {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SUPABASE_ANON_KEY },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  useEffect(() => {
    if (!selectedCountry.code || !selectedService) return;
    callFunction({ action: "get_prices", country: selectedCountry.code, service: selectedService })
      .then((data) => {
        const serviceData = data?.[selectedCountry.code]?.[selectedService];
        if (serviceData) {
          const variants = Object.values(serviceData) as any[];
          setPrice(variants[0]?.cost ?? variants[0]?.Price ?? 0);
        } else { setPrice(null); }
      });
  }, [selectedCountry, selectedService]);

  const handleBuyNumber = async () => {
    setError(""); setSuccess("");
    if (!selectedService) return setError("Select a service first");
    if (!price) return setError("Price not available");
    const { data: wallet } = await supabase.from("wallets").select("id, balance").eq("user_id", user?.id).eq("is_active", true).single();
    const priceInNaira = price * 1600 * 1.3;
    if (!wallet || wallet.balance < priceInNaira) { setError("Insufficient balance. Need N" + priceInNaira.toFixed(2)); return; }
    setLoading(true);
    const reference = generateRef();
    await supabase.from("transactions").insert({
      user_id: user?.id, wallet_id: wallet.id, type: "debit", status: "pending",
      amount: priceInNaira, description: "Virtual SMS - " + selectedService + " (" + selectedCountry.name + ")",
      reference, metadata: { service: selectedService, country: selectedCountry.code },
    });
    const data = await callFunction({ action: "buy_number", country: selectedCountry.code, service: selectedService });
    if (data?.phone) {
      const newOrder: Order = { ...data, country: selectedCountry.name, service: selectedService, price: priceInNaira, status: "active", created_at: new Date().toISOString() };
      setOrder(newOrder);
      setMyNumbers(prev => [newOrder, ...prev]);
      await supabase.rpc("debit_wallet", { p_user_id: user?.id, p_amount: priceInNaira, p_reference: reference });
      setSuccess("Number activated! Waiting for SMS...");
    } else {
      await supabase.from("transactions").update({ status: "failed" }).eq("reference", reference);
      setError(data?.message || "No numbers available for this country. Please try another country.");
    }
    setLoading(false);
  };

  const handleCheckSMS = async (targetOrder?: Order) => {
    const o = targetOrder || order;
    if (!o?.id) return;
    setCheckingOrder(true);
    const data = await callFunction({ action: "check_sms", orderId: o.id });
    if (data?.sms?.length > 0) {
      const smsCode = data.sms[0]?.code ?? data.sms[0]?.text;
      const updated = { ...o, sms: smsCode };
      setOrder(updated);
      setMyNumbers(prev => prev.map(n => n.id === o.id ? updated : n));
      setSuccess("SMS received!");
    } else { setSuccess("No SMS yet. Try again in a moment."); }
    setCheckingOrder(false);
  };

  const handleCancel = async () => {
    if (!order?.id) return;
    await callFunction({ action: "cancel_order", orderId: order.id });
    setMyNumbers(prev => prev.map(n => n.id === order.id ? { ...n, status: "expired" as const } : n));
    setOrder(null); setSuccess("Order cancelled.");
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const filteredCountries = COUNTRY_LIST.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()));
  const activeNumbers = myNumbers.filter(n => n.status === "active");
  const expiredNumbers = myNumbers.filter(n => n.status === "expired");
  const priceInNaira = price ? price * 1600 * 1.3 : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">

        <div className="bg-white px-4 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Virtual SMS</h1>
            <p className="text-xs text-gray-400">International numbers for OTP verification</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
            <button onClick={() => setTab("buy")} className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 " + (tab === "buy" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500")}>
              <Phone className="w-4 h-4" /> Buy Number
            </button>
            <button onClick={() => setTab("my")} className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 " + (tab === "my" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500")}>
              <MessageSquare className="w-4 h-4" /> My Numbers
              {myNumbers.length > 0 && <span className="w-4 h-4 bg-blue-600 text-white text-[9px] rounded-full flex items-center justify-center">{myNumbers.length}</span>}
            </button>
          </div>

          {tab === "buy" && (
            <div className="space-y-4">
              {order && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-blue-800">Number Active</p>
                    <button onClick={handleCancel} className="text-xs text-red-500 font-semibold">Cancel</button>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-3">
                    <p className="text-lg font-black text-gray-900 tracking-wider">{order.phone}</p>
                    <button onClick={() => copyText(order.phone)} className="active:scale-95 transition-transform">
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {order.sms ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs text-green-600 font-bold mb-1">SMS CODE RECEIVED</p>
                      <p className="text-2xl font-black text-green-700 tracking-widest">{order.sms}</p>
                    </div>
                  ) : (
                    <button onClick={() => handleCheckSMS()} disabled={checkingOrder} className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      {checkingOrder ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</> : <><RefreshCw className="w-4 h-4" />Check for SMS</>}
                    </button>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-3">Select Service</p>
                <div className="grid grid-cols-4 gap-2">
                  {POPULAR_SERVICES.map((s) => (
                    <button key={s.id} onClick={() => setSelectedService(s.id)}
                      className={"flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all active:scale-95 " + (selectedService === s.id ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-gray-50")}>
                      <div className={"w-9 h-9 rounded-xl " + s.color + " flex items-center justify-center text-white text-xs font-black shadow-sm"}>{s.logo}</div>
                      <span className="text-[9px] text-gray-500 font-semibold">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-3">Select Country</p>
                <button onClick={() => setShowCountryPicker(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 active:scale-95 transition-transform">
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <span className="text-sm font-semibold text-gray-800 flex-1 text-left">{selectedCountry.name}</span>
                  <span className="text-gray-400 text-xs">Change ›</span>
                </button>
              </div>

              {selectedService && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Estimated Price</p>
                      <p className="text-2xl font-black text-gray-900">{priceInNaira ? "N" + priceInNaira.toFixed(2) : "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Service</p>
                      <p className="text-sm font-bold text-blue-600 capitalize">{selectedService}</p>
                    </div>
                  </div>
                  {error && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-3"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-xs text-red-600 font-medium">{error}</p></div>}
                  {success && <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl mb-3"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /><p className="text-xs text-green-600 font-medium">{success}</p></div>}
                  <button onClick={handleBuyNumber} disabled={loading || !priceInNaira}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200 disabled:bg-blue-200 disabled:text-blue-400">
                    {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Getting Number...</> : <><Phone className="w-4 h-4" />Get Number {priceInNaira ? "- N" + priceInNaira.toFixed(0) : ""}</>}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Secured by SMS-Activate</p>
                </div>
              )}
            </div>
          )}

          {tab === "my" && (
            <div>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
                <button onClick={() => setMyNumbersTab("active")} className={"flex-1 py-2 rounded-lg text-xs font-bold transition-all " + (myNumbersTab === "active" ? "bg-white text-green-600 shadow-sm" : "text-gray-500")}>
                  Active ({activeNumbers.length})
                </button>
                <button onClick={() => setMyNumbersTab("expired")} className={"flex-1 py-2 rounded-lg text-xs font-bold transition-all " + (myNumbersTab === "expired" ? "bg-white text-gray-600 shadow-sm" : "text-gray-500")}>
                  Expired ({expiredNumbers.length})
                </button>
              </div>

              {(myNumbersTab === "active" ? activeNumbers : expiredNumbers).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-500 font-semibold text-sm mb-1">{myNumbersTab === "active" ? "No active numbers" : "No expired numbers"}</p>
                  <p className="text-gray-300 text-xs mb-4">{myNumbersTab === "active" ? "Buy a number to get started" : "Expired numbers will appear here"}</p>
                  {myNumbersTab === "active" && (
                    <button onClick={() => setTab("buy")} className="bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-xl active:scale-95 transition-transform">+ Buy Number</button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {(myNumbersTab === "active" ? activeNumbers : expiredNumbers).map((num) => (
                    <div key={num.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full " + (num.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
                              {num.status === "active" ? "Active" : "Expired"}
                            </span>
                            <span className="text-[10px] text-gray-400 capitalize">{num.service}</span>
                          </div>
                          <p className="text-lg font-black text-gray-900 tracking-wider">{num.phone}</p>
                          <p className="text-xs text-gray-400">{num.country}</p>
                        </div>
                        <button onClick={() => copyText(num.phone)} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center active:scale-95 transition-transform">
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                      {num.sms && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-3">
                          <p className="text-[10px] text-green-600 font-bold mb-1">SMS CODE</p>
                          <p className="text-xl font-black text-green-700 tracking-widest">{num.sms}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {num.status === "active" && !num.sms && (
                          <button onClick={() => handleCheckSMS(num)} disabled={checkingOrder}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                            <RefreshCw className="w-3.5 h-3.5" /> Check SMS
                          </button>
                        )}
                        {num.sms && (
                          <button onClick={() => setViewingSMS(num)}
                            className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                            <Eye className="w-3.5 h-3.5" /> View SMS
                          </button>
                        )}
                        {num.status === "expired" && (
                          <button onClick={() => { setSelectedService(num.service); setTab("buy"); }}
                            className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                            <RefreshCw className="w-3.5 h-3.5" /> Renew
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showCountryPicker && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div className="bg-white rounded-t-3xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
              <div className="pt-3 pb-1 flex justify-center"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Select Country</h2>
                <button onClick={() => setShowCountryPicker(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search country..." value={countrySearch} onChange={e => setCountrySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 px-4 pb-6">
                {filteredCountries.map((c) => (
                  <button key={c.code} onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); setCountrySearch(""); }}
                    className={"w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all active:scale-95 " + (selectedCountry.code === c.code ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50")}>
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-sm font-semibold text-gray-800">{c.name}</span>
                    {selectedCountry.code === c.code && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewingSMS && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">SMS Code</h2>
                <button onClick={() => setViewingSMS(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center mb-4">
                <p className="text-xs text-green-600 font-medium mb-2 capitalize">{viewingSMS.service} Verification Code</p>
                <p className="text-3xl font-black text-green-700 tracking-widest mb-2">{viewingSMS.sms}</p>
                <p className="text-xs text-gray-400">{viewingSMS.phone}</p>
              </div>
              <button onClick={() => { copyText(viewingSMS.sms ?? ""); setViewingSMS(null); }}
                className="w-full bg-green-600 text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Copy className="w-4 h-4" /> Copy Code
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
