import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useDirection = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    
    // Set document direction
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
    
    // Add language-specific classes
    document.body.classList.remove('lang-ar', 'lang-en', 'rtl', 'ltr');
    document.body.classList.add(`lang-${i18n.language}`, direction);
    
    // Update meta tags
    const metaLang = document.querySelector('meta[name="language"]');
    if (metaLang) {
      metaLang.setAttribute('content', i18n.language);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'language';
      meta.content = i18n.language;
      document.head.appendChild(meta);
    }
    
  }, [i18n.language]);

  return {
    isRTL: i18n.language === 'ar',
    language: i18n.language,
    direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
  };
};