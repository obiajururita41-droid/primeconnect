import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Percent, Hash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface FinancialSettings {
  withdrawal_fee_type: 'percentage' | 'fixed';
  withdrawal_fee_value: number;
  min_withdrawal: number;
  max_withdrawal: number;
  withdrawal_processing_note: string;
  referral_bonus_amount: number;
  referral_bonus_type: 'fixed' | 'percentage';
  min_funding_for_referral: number;
  daily_transaction_limit: number;
  min_wallet_funding: number;
  max_wallet_funding: number;
}

const DEFAULTS: FinancialSettings = {
  withdrawal_fee_type: 'percentage',
  withdrawal_fee_value: 1.5,
  min_withdrawal: 1000,
  max_withdrawal: 500000,
  withdrawal_processing_note: 'Withdrawals are processed within 24 hours on business days.',
  referral_bonus_amount: 500,
  referral_bonus_type: 'fixed',
  min_funding_for_referral: 1000,
  daily_transaction_limit: 1000000,
  min_wallet_funding: 100,
  max_wallet_funding: 1000000,
};

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function FinancialSettingsTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FinancialSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      showToast('error', 'Failed to load settings: ' + error.message);
    } else if (data) {
      setSettings({
        withdrawal_fee_type: data.withdrawal_fee_type ?? DEFAULTS.withdrawal_fee_type,
        withdrawal_fee_value: Number(data.withdrawal_fee_value ?? DEFAULTS.withdrawal_fee_value),
        min_withdrawal: Number(data.min_withdrawal ?? DEFAULTS.min_withdrawal),
        max_withdrawal: Number(data.max_withdrawal ?? DEFAULTS.max_withdrawal),
        withdrawal_processing_note: data.withdrawal_processing_note ?? DEFAULTS.withdrawal_processing_note,
        referral_bonus_amount: Number(data.referral_bonus_amount ?? DEFAULTS.referral_bonus_amount),
        referral_bonus_type: data.referral_bonus_type ?? DEFAULTS.referral_bonus_type,
        min_funding_for_referral: Number(data.min_funding_for_referral ?? DEFAULTS.min_funding_for_referral),
        daily_transaction_limit: Number(data.daily_transaction_limit ?? DEFAULTS.daily_transaction_limit),
        min_wallet_funding: Number(data.min_wallet_funding ?? DEFAULTS.min_wallet_funding),
        max_wallet_funding: Number(data.max_wallet_funding ?? DEFAULTS.max_wallet_funding),
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // Validation
    if (settings.min_withdrawal <= 0 || settings.max_withdrawal <= 0) {
      showToast('error', 'Withdrawal limits must be greater than zero');
      return;
    }
    if (settings.min_withdrawal >= settings.max_withdrawal) {
      showToast('error', 'Minimum withdrawal must be less than maximum');
      return;
    }
    if (settings.withdrawal_fee_value < 0) {
      showToast('error', 'Withdrawal fee cannot be negative');
      return;
    }
    if (settings.withdrawal_fee_type === 'percentage' && settings.withdrawal_fee_value > 100) {
      showToast('error', 'Percentage fee cannot exceed 100%');
      return;
    }
    if (settings.referral_bonus_amount < 0) {
      showToast('error', 'Referral bonus cannot be negative');
      return;
    }
    if (settings.min_wallet_funding <= 0 || settings.max_wallet_funding <= 0) {
      showToast('error', 'Wallet funding limits must be greater than zero');
      return;
    }
    if (settings.min_wallet_funding >= settings.max_wallet_funding) {
      showToast('error', 'Minimum funding must be less than maximum');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('financial_settings')
        .update({
          ...settings,
          withdrawal_processing_note: settings.withdrawal_processing_note.trim(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id ?? null,
        })
        .eq('id', 1);

      if (error) throw error;
      showToast('success', 'Financial settings saved');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Withdrawal Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Withdrawal Settings</h2>
        <p className="text-sm text-gray-500 mb-4">Configure withdrawal fees and limits</p>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Withdrawal Fee</label>
        <div className="flex gap-2 mb-4">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
            <button
              onClick={() => setSettings({ ...settings, withdrawal_fee_type: 'percentage' })}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                settings.withdrawal_fee_type === 'percentage' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Percent className="w-3.5 h-3.5" /> %
            </button>
            <button
              onClick={() => setSettings({ ...settings, withdrawal_fee_type: 'fixed' })}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                settings.withdrawal_fee_type === 'fixed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Hash className="w-3.5 h-3.5" /> &#8358;
            </button>
          </div>
          <input
            type="number"
            min={0}
            step="0.01"
            value={settings.withdrawal_fee_value}
            onChange={(e) => setSettings({ ...settings, withdrawal_fee_value: Number(e.target.value) })}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={settings.withdrawal_fee_type === 'percentage' ? 'e.g. 1.5' : 'e.g. 50'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Withdrawal (&#8358;)</label>
            <input
              type="number"
              min={0}
              value={settings.min_withdrawal}
              onChange={(e) => setSettings({ ...settings, min_withdrawal: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Withdrawal (&#8358;)</label>
            <input
              type="number"
              min={0}
              value={settings.max_withdrawal}
              onChange={(e) => setSettings({ ...settings, max_withdrawal: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Processing Note (shown to users)</label>
        <textarea
          value={settings.withdrawal_processing_note}
          onChange={(e) => setSettings({ ...settings, withdrawal_processing_note: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Referral Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Referral Bonus Settings</h2>
        <p className="text-sm text-gray-500 mb-4">Configure how referral bonuses are calculated and triggered</p>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Referral Bonus</label>
        <div className="flex gap-2 mb-4">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden shrink-0">
            <button
              onClick={() => setSettings({ ...settings, referral_bonus_type: 'fixed' })}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                settings.referral_bonus_type === 'fixed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Hash className="w-3.5 h-3.5" /> &#8358;
            </button>
            <button
              onClick={() => setSettings({ ...settings, referral_bonus_type: 'percentage' })}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-l border-gray-200 ${
                settings.referral_bonus_type === 'percentage' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Percent className="w-3.5 h-3.5" /> %
            </button>
          </div>
          <input
            type="number"
            min={0}
            step="0.01"
            value={settings.referral_bonus_amount}
            onChange={(e) => setSettings({ ...settings, referral_bonus_amount: Number(e.target.value) })}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={settings.referral_bonus_type === 'percentage' ? 'e.g. 5' : 'e.g. 500'}
          />
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Funding to Trigger Bonus (&#8358;)</label>
        <input
          type="number"
          min={0}
          value={settings.min_funding_for_referral}
          onChange={(e) => setSettings({ ...settings, min_funding_for_referral: Number(e.target.value) })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1.5">Referred user must fund their wallet with at least this amount for the referrer to earn a bonus.</p>
      </div>

      {/* Transaction Limits */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Transaction Limits</h2>
        <p className="text-sm text-gray-500 mb-4">Platform-wide limits for wallet funding and daily activity</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Wallet Funding (&#8358;)</label>
            <input
              type="number"
              min={0}
              value={settings.min_wallet_funding}
              onChange={(e) => setSettings({ ...settings, min_wallet_funding: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Wallet Funding (&#8358;)</label>
            <input
              type="number"
              min={0}
              value={settings.max_wallet_funding}
              onChange={(e) => setSettings({ ...settings, max_wallet_funding: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Transaction Limit per User (&#8358;)</label>
        <input
          type="number"
          min={0}
          value={settings.daily_transaction_limit}
          onChange={(e) => setSettings({ ...settings, daily_transaction_limit: Number(e.target.value) })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
