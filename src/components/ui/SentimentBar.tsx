import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  className?: string;
}

export const SentimentBar: React.FC<SentimentBarProps> = ({
  positive,
  neutral,
  negative,
  total,
  className,
}) => {
  const { t } = useTranslation();

  if (total === 0) {
    return (
      <div className={clsx('text-center text-gray-500 text-sm', className)}>
        {t('sentimentBar.no_ratings')}
      </div>
    );
  }

  const positivePercent = (positive / total) * 100;
  const neutralPercent = (neutral / total) * 100;
  const negativePercent = (negative / total) * 100;

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{t('sentimentBar.sentiment_analysis')}</span>
        <span className="text-gray-500">{t('sentimentBar.ratings_count', { count: total })}</span>
      </div>
      
      <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="bg-green-500 transition-all duration-300"
          style={{ width: `${positivePercent}%` }}
        />
        <div
          className="bg-yellow-500 transition-all duration-300"
          style={{ width: `${neutralPercent}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${negativePercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span>{t('sentimentBar.positive')} {Math.round(positivePercent)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          <span>{t('sentimentBar.neutral')} {Math.round(neutralPercent)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
          <span>{t('sentimentBar.negative')} {Math.round(negativePercent)}%</span>
        </div>
      </div>
    </div>
  );
};