import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Phone, Wifi, Gift, MessageSquare, TrendingUp, Zap, Tv, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface ServiceSettings {
  airtime_enabled: boolean;
  data_enabled: boolean;
  giftcard_enabled: boolean;
  virtual_sms_enabled: boolean;
  bulk_sms_enabled: boolean;
  airtime_to_cash_enabled: boolean;
  betting_enabled: boolean;
  a2c_rate_mtn: number;
  a2c_rate_airtel: number;
  a2c_rate_glo: number;
  a2c_rate_9mobile: number;
  airtime_discount_mtn: number;
  airtime_discount_airtel: number;
  airtime_discount_glo: number;
  airtime_discount_9mobile: number;
  data_markup: number;
  virtual_sms_price: number;
  bulk_sms_price: number;
  betting_fee_percent: number;
  electricity_fee_percent: number;
  tv_fee_percent: number;
}

const DEFAULTS: ServiceSettings = {
  airtime_enabled: true,
  data_enabled: true,
  giftcard_enabled: true,
  virtual_sms_enabled: true,
  bulk_sms_enabled: true,
  airtime_to_cash_enabled: true,
  betting_enabled: true,
  a2c_rate_mtn: 0.75,
  a2c_rate_airtel: 0.73,
  a2c_rate_glo: 0.70,
  a2c_rate_9mobile: 0.68,
  airtime_discount_mtn: 0,
  airtime_discount_airtel: 0,
  airtime_discount_glo: 0,
  airtime_discount_9mobile: 0,
  data_markup: 0,
  virtual_sms_price: 282,
  bulk_sms_price: 4,
  betting_fee_percent: 0,
  electricity_fee_percent: 0,
  tv_fee_percent: 0,
};

interface Toast { type: 'success' | 'error'; message: string; }

export default function ServicesSettingsTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ServiceSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeSection, setActiveSection] = useState<'toggles' | 'airtime' | 'data' | 'a2c' | 'other'>('toggles');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('service_settings').select('*').eq('id', 1).maybeSingle();
    if (error) {
      showToast('error', 'Failed to load: ' + error.message);
    } else if (data) {
      setSettings({
        airtime_enabled: data.airtime_enabled ?? true,
        data_enabled: data.data_enabled ?? true,
        giftcard_enabled: data.giftcard_enabled ?? true,
        virtual_sms_enabled: data.virtual_sms_enabled ?? true,
        bulk_sms_enabled: data.bulk_sms_enabled ?? true,
        airtime_to_cash_enabled: data.airtime_to_cash_enabled ?? true,
        betting_enabled: data.betting_enabled ?? true,
        a2c_rate_mtn: Number(data.a2c_rate_mtn ?? 0.75),
        a2c_rate_airtel: Number(data.a2c_rate_airtel ?? 0.73),
        a2c_rate_glo: Number(data.a2c_rate_glo ?? 0.70),
        a2c_rate_9mobile: Number(data.a2c_rate_9mobile ?? 0.68),
        airtime_discount_mtn: Number(data.airtime_discount_mtn ?? 0),
        airtime_discount_airtel: Number(data.airtime_discount_airtel ?? 0),
        airtime_discount_glo: Number(data.airtime_discount_glo ?? 0),
        airtime_discount_9mobile: Number(data.airtime_discount_9mobile ?? 0),
        data_markup: Number(data.data_markup ?? 0),
        virtual_sms_price: Number(data.virtual_sms_price ?? 282),
        bulk_sms_price: Number(data.bulk_sms_price ?? 4),
        betting_fee_percent: Number(data.betting_fee_percent ?? 0),
        electricity_fee_percent: Number(data.electricity_fee_percent ?? 0),
        tv_fee_percent: Number(data.tv_fee_percent ?? 0),
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('service_settings')
        .update({ ...settings, updated_at: new Date().toISOString(), updated_by: user?.id ?? null })
        .eq('id', 1);
      if (error) throw error;
      showToast('success', 'Service settings saved successfully!');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  const RateInput = ({ label, value, onChange, min = 0, max = 100, step = 0.01, suffix = '' }: any) => (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className="text-xs font-black text-blue-600">{suffix ? `${value}${suffix}` : `₦${value}`}</span>
      </div>
      <input type="number" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:bg-white bg-white transition-all" />
    </div>
  );

  const services = [
    { key: 'airtime_enabled' as const,         label: 'Airtime',         icon: <Phone className="w-4 h-4" />,         color: 'bg-blue-100 text-blue-600' },
    { key: 'data_enabled' as const,            label: 'Data',            icon: <Wifi className="w-4 h-4" />,          color: 'bg-blue-100 text-blue-600' },
    { key: 'giftcard_enabled' as const,        label: 'Gift Cards',      icon: <Gift className="w-4 h-4" />,          color: 'bg-blue-100 text-blue-600' },
    { key: 'virtual_sms_enabled' as const,     label: 'Virtual SMS',     icon: <MessageSquare className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
    { key: 'bulk_sms_enabled' as const,        label: 'Bulk SMS',        icon: <MessageSquare className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
    { key: 'airtime_to_cash_enabled' as const, label: 'Airtime to Cash', icon: <TrendingUp className="w-4 h-4" />,    color: 'bg-blue-100 text-blue-600' },
    { key: 'betting_enabled' as const,         label: 'Bet Funding',     icon: <Zap className="w-4 h-4" />,          color: 'bg-blue-100 text-blue-600' },
  ];

  const sections = [
    { key: 'toggles', label: '🔌 Services' },
    { key: 'airtime', label: '📱 Airtime' },
    { key: 'data',    label: '📶 Data' },
    { key: 'a2c',     label: '💸 A2C' },
    { key: 'other',   label: '⚡ Other' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key as any)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSection === s.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Service Toggles */}
      {activeSection === 'toggles' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-black text-gray-900 mb-1">Service Availability</h2>
          <p className="text-xs text-gray-400 mb-4">Enable or disable services platform-wide</p>
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                    {s.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black ${settings[s.key] ? 'text-green-600' : 'text-red-500'}`}>
                    {settings[s.key] ? 'ON' : 'OFF'}
                  </span>
                  <Toggle value={settings[s.key]} onChange={(v) => setSettings({ ...settings, [s.key]: v })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Airtime Discount Rates */}
      {activeSection === 'airtime' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-black text-gray-900 mb-1">Airtime Discount Rates</h2>
          <p className="text-xs text-gray-400 mb-4">Discount % given to users per network (e.g. 2 = 2% off)</p>
          <div className="grid grid-cols-2 gap-3">
            <RateInput label="MTN" value={settings.airtime_discount_mtn} suffix="%" min={0} max={20} step={0.5}
              onChange={(v: number) => setSettings({ ...settings, airtime_discount_mtn: v })} />
            <RateInput label="Airtel" value={settings.airtime_discount_airtel} suffix="%" min={0} max={20} step={0.5}
              onChange={(v: number) => setSettings({ ...settings, airtime_discount_airtel: v })} />
            <RateInput label="Glo" value={settings.airtime_discount_glo} suffix="%" min={0} max={20} step={0.5}
              onChange={(v: number) => setSettings({ ...settings, airtime_discount_glo: v })} />
            <RateInput label="9mobile" value={settings.airtime_discount_9mobile} suffix="%" min={0} max={20} step={0.5}
              onChange={(v: number) => setSettings({ ...settings, airtime_discount_9mobile: v })} />
          </div>
        </div>
      )}

      {/* Data Markup */}
      {activeSection === 'data' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-black text-gray-900 mb-1">Data Plan Markup</h2>
          <p className="text-xs text-gray-400 mb-4">Markup % added on top of data plan cost</p>
          <div className="grid grid-cols-1 gap-3">
            <RateInput label="Data Markup %" value={settings.data_markup} suffix="%" min={0} max={50} step={0.5}
              onChange={(v: number) => setSettings({ ...settings, data_markup: v })} />
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-700 font-semibold">💡 Example: If data plan costs ₦1,000 and markup is 5%, user pays ₦1,050</p>
            </div>
          </div>
        </div>
      )}

      {/* Airtime to Cash Rates */}
      {activeSection === 'a2c' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-black text-gray-900 mb-1">Airtime to Cash Rates</h2>
          <p className="text-xs text-gray-400 mb-4">Conversion rate per network (e.g. 0.75 = 75%)</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'a2c_rate_mtn' as const,     label: 'MTN',     dot: 'bg-yellow-400' },
              { key: 'a2c_rate_airtel' as const,  label: 'Airtel',  dot: 'bg-red-500' },
              { key: 'a2c_rate_glo' as const,     label: 'Glo',     dot: 'bg-green-600' },
              { key: 'a2c_rate_9mobile' as const, label: '9mobile', dot: 'bg-green-800' },
            ].map(n => (
              <div key={n.key} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${n.dot}`} />
                  <span className="text-sm font-bold text-gray-700">{n.label}</span>
                  <span className="text-xs text-blue-600 font-black ml-auto">{(settings[n.key] * 100).toFixed(0)}%</span>
                </div>
                <input type="number" min={0.01} max={1} step={0.01} value={settings[n.key]}
                  onChange={e => setSettings({ ...settings, [n.key]: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-white" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Service Rates */}
      {activeSection === 'other' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-black text-gray-900 mb-1">Virtual SMS Price</h2>
            <p className="text-xs text-gray-400 mb-4">Price charged per virtual number purchase</p>
            <RateInput label="Price per Number (₦)" value={settings.virtual_sms_price} min={0} max={10000} step={10}
              onChange={(v: number) => setSettings({ ...settings, virtual_sms_price: v })} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-black text-gray-900 mb-1">Bulk SMS Price</h2>
            <p className="text-xs text-gray-400 mb-4">Price per SMS unit</p>
            <RateInput label="Price per SMS (₦)" value={settings.bulk_sms_price} min={0} max={100} step={0.5}
              onChange={(v: number) => setSettings({ ...settings, bulk_sms_price: v })} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-black text-gray-900 mb-1">Fee Percentages</h2>
            <p className="text-xs text-gray-400 mb-4">Service fee % added to transactions</p>
            <div className="grid grid-cols-1 gap-3">
              <RateInput label="Bet Funding Fee %" value={settings.betting_fee_percent} suffix="%" min={0} max={20} step={0.5}
                onChange={(v: number) => setSettings({ ...settings, betting_fee_percent: v })} />
              <RateInput label="Electricity Fee %" value={settings.electricity_fee_percent} suffix="%" min={0} max={20} step={0.5}
                onChange={(v: number) => setSettings({ ...settings, electricity_fee_percent: v })} />
              <RateInput label="TV Subscription Fee %" value={settings.tv_fee_percent} suffix="%" min={0} max={20} step={0.5}
                onChange={(v: number) => setSettings({ ...settings, tv_fee_percent: v })} />
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-4 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save All Settings</>}
      </button>
    </div>
  );
}
