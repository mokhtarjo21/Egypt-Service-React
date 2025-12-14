import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Get the appropriate locale based on current language
export const getDateLocale = (language: string) => {
  return language === 'ar' ? ar : enUS;
};

// Format date with localization
export const formatDate = (
  date: string | Date,
  formatString: string = 'PPP',
  language: string = 'ar'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const locale = getDateLocale(language);
  
  return format(dateObj, formatString, { locale });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (
  date: string | Date,
  language: string = 'ar'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const locale = getDateLocale(language);
  
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale 
  });
};

// Format time only
export const formatTime = (
  date: string | Date,
  language: string = 'ar'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const locale = getDateLocale(language);
  
  return format(dateObj, 'p', { locale });
};

// Format date for Arabic with proper RTL formatting
export const formatArabicDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Custom Arabic date formatting
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  return `${day} ${arabicMonths[month - 1]} ${year}`;
};

// Format numbers with proper Arabic numerals
export const formatArabicNumber = (number: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  return number.toString().replace(/\d/g, (digit) => {
    return arabicNumerals[parseInt(digit)];
  });
};

// Format currency for Egyptian Pound
export const formatCurrency = (
  amount: number,
  language: string = 'ar'
): string => {
  const formatter = new Intl.NumberFormat(
    language === 'ar' ? 'ar-EG' : 'en-EG',
    {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );
  
  return formatter.format(amount);
};

// Format large numbers with proper separators
export const formatNumber = (
  number: number,
  language: string = 'ar'
): string => {
  const formatter = new Intl.NumberFormat(
    language === 'ar' ? 'ar-EG' : 'en-EG'
  );
  
  return formatter.format(number);
};