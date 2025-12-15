import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Bell, Lock, Eye, Globe } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useDirection } from '../hooks/useDirection';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    language: 'ar',
    theme: 'light',
  });

  const handleChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      console.log('Settings saved:', settings);
      // Save settings to API or local storage
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const settingsSections = [
    {
      title: t('common.loading'),
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      settings: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          type: 'toggle',
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          type: 'toggle',
        },
        {
          key: 'smsNotifications',
          label: 'SMS Notifications',
          type: 'toggle',
        },
        {
          key: 'marketingEmails',
          label: 'Marketing Emails',
          type: 'toggle',
        },
      ],
    },
    {
      title: 'Preferences',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      settings: [
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' },
          ],
        },
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('profile.accountSettings')}
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and notification settings
          </p>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`${section.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                    >
                      <label className="text-gray-700 font-medium">
                        {setting.label}
                      </label>
                      {setting.type === 'toggle' ? (
                        <button
                          onClick={() =>
                            handleChange(
                              setting.key,
                              !settings[setting.key as keyof typeof settings]
                            )
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[setting.key as keyof typeof settings]
                              ? 'bg-primary-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings[setting.key as keyof typeof settings]
                                ? isRTL
                                  ? 'translate-x-[-18px]'
                                  : 'translate-x-5'
                                : isRTL
                                ? 'translate-x-1'
                                : '-translate-x-0'
                            }`}
                          />
                        </button>
                      ) : setting.type === 'select' ? (
                        <select
                          value={settings[setting.key as keyof typeof settings]}
                          onChange={(e) =>
                            handleChange(setting.key, e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Privacy & Security
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your privacy is important to us. Visit your security settings to manage two-factor authentication and connected devices.
                </p>
                <a href="/security" className="text-primary-600 hover:text-primary-700 font-medium">
                  Go to Security Settings →
                </a>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              {t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
