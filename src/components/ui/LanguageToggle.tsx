import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './Button';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLanguage);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'ar' ? 'English' : 'العربية';
  };

  const getCurrentLanguageCode = () => {
    return i18n.language === 'ar' ? 'English' : 'عربي';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
      aria-label={`Switch to ${getCurrentLanguageLabel()}`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {getCurrentLanguageCode()}
      </span>
    </Button>
  );
};