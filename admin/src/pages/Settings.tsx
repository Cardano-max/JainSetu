import { useEffect, useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data.settings);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await api.put(`/admin/settings/${key}`, { value });
      toast.success('Setting updated');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage application settings</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-saffron-100 rounded-lg flex items-center justify-center">
            <Cog6ToothIcon className="w-5 h-5 text-saffron-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">General Settings</h2>
            <p className="text-sm text-gray-500">Configure basic app settings</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="label">App Name</label>
            <input
              type="text"
              value={settings.app_name || 'JainSetu'}
              className="input"
              disabled
            />
          </div>

          <div>
            <label className="label">App Version</label>
            <input
              type="text"
              value={settings.app_version || '1.0.0'}
              className="input"
              disabled
            />
          </div>

          <div>
            <label className="label">Support Email</label>
            <input
              type="email"
              value={settings.support_email || ''}
              className="input"
              placeholder="support@example.com"
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              onBlur={(e) => updateSetting('support_email', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Support Phone</label>
            <input
              type="tel"
              value={settings.support_phone || ''}
              className="input"
              placeholder="+91-9999999999"
              onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
              onBlur={(e) => updateSetting('support_phone', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Terms & Conditions URL</label>
            <input
              type="url"
              value={settings.terms_url || ''}
              className="input"
              placeholder="https://example.com/terms"
              onChange={(e) => setSettings({ ...settings, terms_url: e.target.value })}
              onBlur={(e) => updateSetting('terms_url', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Privacy Policy URL</label>
            <input
              type="url"
              value={settings.privacy_url || ''}
              className="input"
              placeholder="https://example.com/privacy"
              onChange={(e) => setSettings({ ...settings, privacy_url: e.target.value })}
              onBlur={(e) => updateSetting('privacy_url', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <div className="flex gap-3">
          <button className="btn-danger" disabled>
            Clear Cache
          </button>
          <button className="btn-danger" disabled>
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
}
