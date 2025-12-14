import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Check, 
  X, 
  MessageCircle, 
  Star, 
  CreditCard,
  Shield,
  Settings
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface Notification {
  id: string;
  type: 'message' | 'booking' | 'review' | 'payment' | 'service_approved' | 'service_rejected' | 'system';
  title_ar: string;
  message_ar: string;
  is_read: boolean;
  created_at: string;
  related_object?: {
    type: string;
    id: string;
    title?: string;
  };
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock data - replace with actual API call
      setNotifications([
        {
          id: '1',
          type: 'service_approved',
          title_ar: 'تم الموافقة على خدمتك',
          message_ar: 'تم الموافقة على خدمة "صيانة أجهزة كهربائية" وهي الآن متاحة للعملاء',
          is_read: false,
          created_at: '2024-01-20T14:30:00Z',
          related_object: {
            type: 'service',
            id: '1',
            title: 'صيانة أجهزة كهربائية',
          },
        },
        {
          id: '2',
          type: 'message',
          title_ar: 'رسالة جديدة',
          message_ar: 'لديك رسالة جديدة من أحمد محمد حول خدمة الصيانة',
          is_read: false,
          created_at: '2024-01-20T13:15:00Z',
          related_object: {
            type: 'conversation',
            id: '1',
          },
        },
        {
          id: '3',
          type: 'review',
          title_ar: 'تقييم جديد',
          message_ar: 'حصلت على تقييم 5 نجوم من فاطمة علي',
          is_read: true,
          created_at: '2024-01-19T16:45:00Z',
          related_object: {
            type: 'review',
            id: '1',
          },
        },
        {
          id: '4',
          type: 'payment',
          title_ar: 'تم استلام الدفعة',
          message_ar: 'تم استلام دفعة بقيمة 200 ج.م من عميل',
          is_read: true,
          created_at: '2024-01-18T11:20:00Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/v1/notifications/notifications/${notificationId}/mark_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/v1/notifications/notifications/mark_all_read/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      message: MessageCircle,
      booking: Bell,
      review: Star,
      payment: CreditCard,
      service_approved: Shield,
      service_rejected: X,
      system: Settings,
    };

    const Icon = iconMap[type as keyof typeof iconMap] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      message: 'text-blue-600 bg-blue-100',
      booking: 'text-green-600 bg-green-100',
      review: 'text-yellow-600 bg-yellow-100',
      payment: 'text-purple-600 bg-purple-100',
      service_approved: 'text-green-600 bg-green-100',
      service_rejected: 'text-red-600 bg-red-100',
      system: 'text-gray-600 bg-gray-100',
    };

    return colorMap[type as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
  };

  const filteredNotifications = notifications.filter(notif =>
    filter === 'all' || (filter === 'unread' && !notif.is_read)
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('notifications.title')}
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
            </p>
          </div>
          
          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              {t('notifications.markAllRead')}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 rtl:space-x-reverse">
              <button
                onClick={() => setFilter('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                جميع الإشعارات ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === 'unread'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                غير مقروءة ({unreadCount})
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('notifications.noNotifications')}
              </h3>
              <p className="text-gray-500">
                ستظهر الإشعارات هنا عند وصولها
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 ${
                  !notification.is_read ? 'border-primary-200 bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title_ar}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message_ar}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="!p-2"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <div className={`w-2 h-2 rounded-full ${!notification.is_read ? 'bg-primary-600' : 'bg-transparent'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;