import { useState, useEffect } from 'react';
import { Save, Loader2, Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface PlatformSettings {
  app_name: string;
  logo_url: string | null;
  support_email: string | null;
  support_phone: string | null;
  maintenance_mode: boolean;
  maintenance_message: string;
  banner_text: string | null;
  banner_active: boolean;
}

const DEFAULTS: PlatformSettings = {
  app_name: 'PrimeConnect',
  logo_url: null,
  support_email: '',
  support_phone: '',
  maintenance_mode: false,
  maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
  banner_text: '',
  banner_active: false,
};

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function PlatformSettingsTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      showToast('error', 'Failed to load settings: ' + error.message);
    } else if (data) {
      setSettings({
        app_name: data.app_name ?? DEFAULTS.app_name,
        logo_url: data.logo_url,
        support_email: data.support_email ?? '',
        support_phone: data.support_phone ?? '',
        maintenance_mode: !!data.maintenance_mode,
        maintenance_message: data.maintenance_message ?? DEFAULTS.maintenance_message,
        banner_text: data.banner_text ?? '',
        banner_active: !!data.banner_active,
      });
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      showToast('error', 'Logo must be under 1MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('platform-assets')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('platform-assets').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      setSettings((s) => ({ ...s, logo_url: publicUrl }));
      showToast('success', 'Logo uploaded — remember to Save Changes');
    } catch (err: any) {
      showToast('error', err.message ?? 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.app_name.trim()) {
      showToast('error', 'App name is required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .update({
          app_name: settings.app_name.trim(),
          logo_url: settings.logo_url,
          support_email: settings.support_email?.trim() || null,
          support_phone: settings.support_phone?.trim() || null,
          maintenance_mode: settings.maintenance_mode,
          maintenance_message: settings.maintenance_message.trim(),
          banner_text: settings.banner_text?.trim() || null,
          banner_active: settings.banner_active,
          updated_at: new Date().toISOString(),
          updated_by: user?.id ?? null,
        })
        .eq('id', 1);

      if (error) throw error;
      showToast('success', 'Platform settings saved');
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
      {/* General */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">General</h2>
        <p className="text-sm text-gray-500 mb-4">Basic platform identity and branding</p>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-300" />
            )}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm font-medium text-gray-700 px-4 py-2 rounded-xl cursor-pointer transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-gray-400 mt-1">PNG or SVG, max 1MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">App Name</label>
            <input
              type="text"
              value={settings.app_name}
              onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PrimeConnect"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
            <input
              type="email"
              value={settings.support_email ?? ''}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="support@primeconnect.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Phone</label>
            <input
              type="tel"
              value={settings.support_phone ?? ''}
              onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+234 800 000 0000"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Maintenance Mode</h2>
        <p className="text-sm text-gray-500 mb-4">Temporarily restrict access to the platform during updates</p>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Enable Maintenance Mode</p>
            <p className="text-xs text-gray-500 mt-0.5">Non-admin users will see the maintenance message below</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${settings.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.maintenance_mode ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {settings.maintenance_mode && (
          <div className="mb-1 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">Maintenance mode is active. Make sure your app checks this flag before rendering pages for non-admin users.</p>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Maintenance Message</label>
        <textarea
          value={settings.maintenance_message}
          onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Site Banner</h2>
        <p className="text-sm text-gray-500 mb-4">Show an announcement banner across the platform</p>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Show Banner</p>
            <p className="text-xs text-gray-500 mt-0.5">Display the banner message to all users</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, banner_active: !settings.banner_active })}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${settings.banner_active ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.banner_active ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Text</label>
        <input
          type="text"
          value={settings.banner_text ?? ''}
          onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. New: Bulk SMS now available!"
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
