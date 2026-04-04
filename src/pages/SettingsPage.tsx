import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Eye, Globe } from 'lucide-react';

import { Card } from '../components/ui/Card';
import { useDirection } from '../hooks/useDirection';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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
    // Update local settings state
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Apply immediate effects
      if (key === 'language') {
        i18n.changeLanguage(value as string);
        document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
      }
      
      if (key === 'theme') {
        const root = document.documentElement;
        if (value === 'dark') {
          root.classList.add('dark');
        } else if (value === 'light') {
          root.classList.remove('dark');
        } else {
          // Auto (system preference)
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      }

      // Auto-save to localStorage
      try {
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      
      return newSettings;
    });
  };

  React.useEffect(() => {
    // Load initial settings
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const settingsSections = [
    {
      title: t('common.loading'),
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      settings: [
        {
          key: 'emailNotifications',
          label: t('settings.emailNotifications'),
          type: 'toggle',
        },
        {
          key: 'pushNotifications',
          label: t('settings.pushNotifications'),
          type: 'toggle',
        },
        {
          key: 'smsNotifications',
          label: t('settings.smsNotifications'),
          type: 'toggle',
        },
        {
          key: 'marketingEmails',
          label: t('settings.marketingEmails'),
          type: 'toggle',
        },
      ],
    },
    {
      title: t('settings.preferences'),
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      settings: [
        {
          key: 'language',
          label: t('settings.language'),
          type: 'select',
          options: [
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' },
          ],
        },
        {
          key: 'theme',
          label: t('settings.theme'),
          type: 'select',
          options: [
            { value: 'light', label: t('settings.light') },
            { value: 'dark', label: t('settings.dark') },
            { value: 'auto', label: t('settings.auto') },
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="p-6 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`${section.bgColor} dark:bg-opacity-20 p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${section.color} dark:text-opacity-90`} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <label className="text-gray-700 dark:text-gray-300 font-medium">
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
                              ? 'bg-primary-600 dark:bg-primary-500'
                              : 'bg-gray-300 dark:bg-gray-600'
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
                          value={String(settings[setting.key as keyof typeof settings])}
                          onChange={(e) =>
                            handleChange(setting.key, e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white transition-colors duration-200"
                        >
                          {(setting as any).options?.map((option: any) => (
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

          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 transition-colors duration-200">
            <div className="flex items-start gap-4">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('settings.privacyAndSecurity')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {t('settings.privacyDescription')}
                </p>
                <a href="/security" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                  {t('settings.goToSecurity')}
                </a>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
