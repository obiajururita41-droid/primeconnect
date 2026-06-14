import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Phone, Wifi, Gift, MessageSquare, TrendingUp, Zap } from 'lucide-react';
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
};

interface Toast { type: 'success' | 'error'; message: string; }

export default function ServicesSettingsTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ServiceSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('service_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
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
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const rates = [settings.a2c_rate_mtn, settings.a2c_rate_airtel, settings.a2c_rate_glo, settings.a2c_rate_9mobile];
    if (rates.some(r => r <= 0 || r > 1)) {
      showToast('error', 'A2C rates must be between 0.01 and 1.00 (e.g. 0.75 = 75%)');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('service_settings')
        .update({ ...settings, updated_at: new Date().toISOString(), updated_by: user?.id ?? null })
        .eq('id', 1);
      if (error) throw error;
      showToast('success', 'Service settings saved!');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  const services = [
    { key: 'airtime_enabled' as const,         label: 'Airtime',         icon: <Phone className="w-4 h-4" />,         color: 'bg-yellow-100 text-yellow-600' },
    { key: 'data_enabled' as const,            label: 'Data',            icon: <Wifi className="w-4 h-4" />,          color: 'bg-blue-100 text-blue-600' },
    { key: 'giftcard_enabled' as const,        label: 'Gift Cards',      icon: <Gift className="w-4 h-4" />,          color: 'bg-pink-100 text-pink-600' },
    { key: 'virtual_sms_enabled' as const,     label: 'Virtual SMS',     icon: <MessageSquare className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600' },
    { key: 'bulk_sms_enabled' as const,        label: 'Bulk SMS',        icon: <MessageSquare className="w-4 h-4" />, color: 'bg-teal-100 text-teal-600' },
    { key: 'airtime_to_cash_enabled' as const, label: 'Airtime to Cash', icon: <TrendingUp className="w-4 h-4" />,    color: 'bg-green-100 text-green-600' },
    { key: 'betting_enabled' as const,         label: 'Bet Funding',     icon: <Zap className="w-4 h-4" />,          color: 'bg-orange-100 text-orange-600' },
  ];

  const a2cRates = [
    { key: 'a2c_rate_mtn' as const,     label: 'MTN',     color: 'bg-yellow-400' },
    { key: 'a2c_rate_airtel' as const,  label: 'Airtel',  color: 'bg-red-500' },
    { key: 'a2c_rate_glo' as const,     label: 'Glo',     color: 'bg-green-600' },
    { key: 'a2c_rate_9mobile' as const, label: '9mobile', color: 'bg-green-800' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Service Toggles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Service Availability</h2>
        <p className="text-sm text-gray-500 mb-4">Enable or disable services platform-wide</p>
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <span className="text-sm font-semibold text-gray-800">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${settings[s.key] ? 'text-green-600' : 'text-red-500'}`}>
                  {settings[s.key] ? 'ON' : 'OFF'}
                </span>
                <Toggle value={settings[s.key]} onChange={(v) => setSettings({ ...settings, [s.key]: v })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Airtime to Cash Rates */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Airtime to Cash Rates</h2>
        <p className="text-sm text-gray-500 mb-4">Set conversion rate per network (e.g. 0.75 = 75%)</p>
        <div className="grid grid-cols-2 gap-3">
          {a2cRates.map((n) => (
            <div key={n.key} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${n.color}`} />
                <span className="text-sm font-bold text-gray-700">{n.label}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {(settings[n.key] * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="number"
                min={0.01}
                max={1}
                step={0.01}
                value={settings[n.key]}
                onChange={(e) => setSettings({ ...settings, [n.key]: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Service Settings</>}
      </button>
    </div>
  );
}
