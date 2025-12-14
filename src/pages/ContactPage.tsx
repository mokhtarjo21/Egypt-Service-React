import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success(t('contactPage.form.success'));
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      titleKey: 'contactPage.info.email.title',
      value: 'support@marketplace.eg',
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: Phone,
      titleKey: 'contactPage.info.phone.title',
      value: '+20 100 000 0000',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      icon: MapPin,
      titleKey: 'contactPage.info.address.title',
      valueKey: 'contactPage.info.address.value',
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      icon: Clock,
      titleKey: 'contactPage.info.hours.title',
      valueKey: 'contactPage.info.hours.value',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <MessageSquare className="w-16 h-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('contactPage.hero.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('contactPage.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="text-center">
                  <div className={`w-14 h-14 rounded-full ${info.bgColor} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-7 h-7 ${info.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t(info.titleKey)}
                  </h3>
                  <p className="text-gray-600">
                    {info.value || t(info.valueKey!)}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('contactPage.form.title')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contactPage.form.name')}
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.namePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contactPage.form.email')}
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contactPage.form.phone')}
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contactPage.form.subject')}
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">{t('contactPage.form.selectSubject')}</option>
                      <option value="general">{t('contactPage.form.subjects.general')}</option>
                      <option value="support">{t('contactPage.form.subjects.support')}</option>
                      <option value="billing">{t('contactPage.form.subjects.billing')}</option>
                      <option value="partnership">{t('contactPage.form.subjects.partnership')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contactPage.form.message')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder={t('contactPage.form.messagePlaceholder')}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('contactPage.form.sending')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      {t('contactPage.form.send')}
                    </span>
                  )}
                </Button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.123456789!2d31.2357!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzQwLjAiTiAzMcKwMTQnMDguNSJF!5e0!3m2!1sen!2seg!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
