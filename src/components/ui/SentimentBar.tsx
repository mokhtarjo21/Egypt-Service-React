import React from 'react';
import { clsx } from 'clsx';

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
  if (total === 0) {
    return (
      <div className={clsx('text-center text-gray-500 text-sm', className)}>
        لا توجد تقييمات بعد
      </div>
    );
  }

  const positivePercent = (positive / total) * 100;
  const neutralPercent = (neutral / total) * 100;
  const negativePercent = (negative / total) * 100;

  return (
    <div className={clsx('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">تحليل المشاعر (آخر 90 يوم)</span>
        <span className="text-gray-500">{total} تقييم</span>
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
          <span>إيجابي {Math.round(positivePercent)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          <span>محايد {Math.round(neutralPercent)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
          <span>سلبي {Math.round(negativePercent)}%</span>
        </div>
      </div>
    </div>
  );
};