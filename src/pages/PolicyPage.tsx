import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Calendar, User, CheckCircle } from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDirection } from '../hooks/useDirection';

interface PolicyVersion {
  id: string;
  policy_type: string;
  version: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  effective_date: string;
  created_by: {
    full_name: string;
  };
  change_summary: string;
}

const PolicyPage: React.FC = () => {
  const { policyType } = useParams<{ policyType: string }>();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const [policy, setPolicy] = useState<PolicyVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, [policyType]);

  const loadPolicy = async () => {
    try {
      const response = await fetch('/api/v1/moderation/policies/current/');
      if (response.ok) {
        const data = await response.json();
        if (policyType && data[policyType]) {
          setPolicy(data[policyType]);
        }
      }
    } catch (error) {
      console.error('Failed to load policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgePolicy = async () => {
    if (!policy) return;
    
    try {
      const response = await fetch('/api/v1/moderation/policies/acknowledge/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          policy_version_id: policy.id,
        }),
      });

      if (response.ok) {
        setHasAcknowledged(true);
      }
    } catch (error) {
      console.error('Failed to acknowledge policy:', error);
    }
  };

  const policyTitles = {
    terms: { ar: 'شروط الخدمة', en: 'Terms of Service' },
    privacy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    community: { ar: 'إرشادات المجتمع', en: 'Community Guidelines' },
    safety: { ar: 'إرشادات الأمان', en: 'Safety Guidelines' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">السياسة غير موجودة</h2>
          <p className="text-gray-600">السياسة المطلوبة غير متاحة</p>
        </div>
      </div>
    );
  }

  const title = isRTL ? policy.title_ar : policy.title_en;
  const content = isRTL ? policy.content_ar : policy.content_en;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  نافذ من: {new Date(policy.effective_date).toLocaleDateString('ar-EG')}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  الإصدار: {policy.version}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  بواسطة: {policy.created_by.full_name}
                </div>
              </div>
            </div>
            
            {!hasAcknowledged && (
              <Button onClick={acknowledgePolicy} leftIcon={<CheckCircle className="w-4 h-4" />}>
                أوافق على السياسة
              </Button>
            )}
          </div>

          {policy.change_summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">ملخص التغييرات</h3>
              <p className="text-sm text-blue-800">{policy.change_summary}</p>
            </div>
          )}
        </Card>

        {/* Policy Content */}
        <Card>
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Card>

        {/* Acknowledgment Status */}
        {hasAcknowledged && (
          <Card className="mt-8 bg-green-50 border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-medium text-green-900">تم الإقرار بالسياسة</h3>
                <p className="text-sm text-green-700">
                  لقد أقررت بقراءة وفهم هذه السياسة في {new Date().toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PolicyPage;