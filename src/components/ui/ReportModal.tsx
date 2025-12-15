import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Flag, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'service' | 'user' | 'message';
  targetId: string;
  targetTitle?: string;
}

interface ReportFormData {
  reason: string;
  description: string;
  evidence?: FileList;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>();

  const reasonOptions = [
    { value: 'spam', label: t('report.reasons.spam') },
    { value: 'inappropriate', label: t('report.reasons.inappropriate') },
    { value: 'fake', label: t('report.reasons.fake') },
    { value: 'fraud', label: t('report.reasons.fraud') },
    { value: 'harassment', label: t('report.reasons.harassment') },
    { value: 'copyright', label: t('report.reasons.copyright') },
    { value: 'pricing', label: t('report.reasons.pricing') },
    { value: 'location', label: t('report.reasons.location') },
    { value: 'quality', label: t('report.reasons.quality') },
    { value: 'other', label: t('report.reasons.other') },
  ];

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('target_type', targetType);
      formData.append('target_id', targetId);
      formData.append('reason', data.reason);
      formData.append('description', data.description);
      
      if (data.evidence?.[0]) {
        formData.append('evidence', data.evidence[0]);
      }

      const response = await fetch('/api/v1/moderation/reports/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success(t('report.submitSuccess'));
        reset();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('report.submitError'));
      }
    } catch (error) {
      toast.error(t('report.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('report.title')} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {targetTitle && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('report.reporting')}:</p>
            <p className="font-medium text-gray-900">{targetTitle}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('report.reason')} *
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('reason', { required: t('report.reasonRequired') })}
          >
            <option value="">{t('report.selectReason')}</option>
            {reasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('report.details')} *
          </label>
          <textarea
            rows={4}
            placeholder={t('report.detailsPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('description', {
              required: t('report.detailsRequired'),
              minLength: {
                value: 20,
                message: t('report.detailsMinLength'),
              },
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('report.evidence')}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              id="evidence"
              {...register('evidence')}
            />
            <label
              htmlFor="evidence"
              className="cursor-pointer text-primary-600 hover:text-primary-500"
            >
              {t('report.selectFile')}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {t('report.fileTypes')}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Flag className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">{t('report.importantNote')}</p>
              <p>
                {t('report.noteText')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 rtl:space-x-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            {t('report.cancel')}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="flex-1"
            leftIcon={<Flag className="w-4 h-4" />}
          >
            {t('report.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};