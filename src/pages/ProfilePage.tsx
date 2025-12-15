import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Shield,
  Users,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SentimentBar } from '../components/ui/SentimentBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import djangoProfileService from '../services/django/profileService';
import { fetchUserProfile } from '../store/slices/authSlice';

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://192.168.1.7:8000';

interface Badge {
  id: string;
  type: string;
  earned_at: string;
}

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  total?: number;
}

interface ProviderStats {
  services: number;
  rating: number;
  reviews: number;
  completion_rate: number;
}

interface Organization {
  id: string;
  name: string;
  description: string;
}

interface OrganizationMember {
  id: string;
  user?: { full_name: string };
  role: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // State for profile data
  const [badges, setBadges] = useState<Badge[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // State for forms
  const [editFormData, setEditFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');

  // Loading states
  const [loading, setLoading] = useState({
    initial: true,
    editSubmit: false,
    imageUpload: false,
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading((prev) => ({ ...prev, initial: true }));

        // Fetch badges
        try {
          const badgesRes = await fetch(`${API_BASE}/api/v1/trust/user-badges/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          });
          if (badgesRes.ok) {
            const badgesData = await badgesRes.json();
            setBadges(Array.isArray(badgesData) ? badgesData : badgesData.results || []);
          }
        } catch (error) {
          console.error('Failed to load badges:', error);
        }

        // Fetch sentiment (provider only)
        if (user?.user_type === 'provider' && user?.id) {
          try {
            const sentimentRes = await fetch(
              `${API_BASE}/api/v1/recommendations/sentiment/${user.id}/`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
              }
            );
            if (sentimentRes.ok) {
              const sentimentData = await sentimentRes.json();
              setSentiment({
                positive: sentimentData.positive || 0,
                neutral: sentimentData.neutral || 0,
                negative: sentimentData.negative || 0,
                total:
                  (sentimentData.positive || 0) +
                  (sentimentData.neutral || 0) +
                  (sentimentData.negative || 0),
              });
            }
          } catch (error) {
            console.error('Failed to load sentiment:', error);
          }
        }

        // Fetch provider analytics (provider only)
        if (user?.user_type === 'provider') {
          try {
            const analyticsRes = await fetch(`${API_BASE}/api/v1/analytics/provider/?days=30`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              },
            });
            if (analyticsRes.ok) {
              const analyticsData = await analyticsRes.json();
              setProviderStats({
                services: analyticsData.current_totals?.services_count || 0,
                rating: analyticsData.current_totals?.average_rating || 0,
                reviews: analyticsData.current_totals?.reviews_count || 0,
                completion_rate: analyticsData.current_totals?.completion_rate || 0,
              });
            }
          } catch (error) {
            console.error('Failed to load analytics:', error);
          }
        }

        // Fetch organizations
        try {
          const orgsRes = await fetch(`${API_BASE}/api/v1/teams/organizations/`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          });
          if (orgsRes.ok) {
            const orgsData = await orgsRes.json();
            const orgsArray = Array.isArray(orgsData) ? orgsData : orgsData.results || [];
            setOrganizations(orgsArray);

            // Fetch members for first organization
            if (orgsArray.length > 0) {
              try {
                const membersRes = await fetch(
                  `${API_BASE}/api/v1/teams/members/?organization=${orgsArray[0].id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                  }
                );
                if (membersRes.ok) {
                  const membersData = await membersRes.json();
                  setOrganizationMembers(
                    Array.isArray(membersData) ? membersData : membersData.results || []
                  );
                }
              } catch (error) {
                console.error('Failed to load organization members:', error);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load organizations:', error);
        }
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    };

    if (user) {
      loadProfileData();
    }
  }, [user?.id, user?.user_type]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setShowUploadModal(true);
    }
  };

  const handleImageUpload = async () => {
    if (!uploadedImage) return;

    setLoading((prev) => ({ ...prev, imageUpload: true }));
    try {
      const result = await djangoProfileService.uploadProfileImage(uploadedImage);
      if (result.data) {
        setUploadedImage(null);
        setUploadPreview('');
        setShowUploadModal(false);
        dispatch(fetchUserProfile() as any);
        toast.success('تم تحديث صورة الملف الشخصي بنجاح');
      }
    } catch (error) {
      toast.error('فشل في رفع الصورة');
    } finally {
      setLoading((prev) => ({ ...prev, imageUpload: false }));
    }
  };

  const handleEditSubmit = async () => {
    if (!editFormData.full_name || !editFormData.email) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading((prev) => ({ ...prev, editSubmit: true }));
    try {
      const result = await djangoProfileService.updateProfile({
        full_name: editFormData.full_name,
        email: editFormData.email,
        bio_ar: editFormData.bio,
      });

      if (result.data) {
        setShowEditModal(false);
        dispatch(fetchUserProfile() as any);
        toast.success('تم تحديث الملف الشخصي بنجاح');
      }
    } catch (error) {
      toast.error('فشل في تحديث الملف الشخصي');
    } finally {
      setLoading((prev) => ({ ...prev, editSubmit: false }));
    }
  };

  const handleVerifyEmail = () => {
    navigate('/verify-account');
  };

  const handleVerifyPhone = () => {
    navigate('/verify-account');
  };

  const handleChangePassword = () => {
    navigate('/security');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول لعرض الملف الشخصي</p>
      </div>
    );
  }

  if (loading.initial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="mb-6 relative group">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}

                {/* Image Upload Button (Hidden input) */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="avatar-input"
                />
                <label
                  htmlFor="avatar-input"
                  className="absolute bottom-0 right-1/2 transform translate-x-1/2 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </label>

                <h2 className="text-2xl font-bold text-gray-900 mb-2 mt-4">
                  {user.full_name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {user.user_type === 'provider' ? 'مقدم خدمة' : 'عميل'}
                </p>

                {/* User Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {badges && badges.length > 0 ? (
                    badges.slice(0, 3).map((badge) => (
                      <Badge key={badge.id} type={badge.type} size="sm" />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">لا توجد شارات حتى الآن</p>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => {
                  setEditFormData({
                    full_name: user.full_name,
                    email: user.email,
                    bio: user.bio || '',
                  });
                  setShowEditModal(true);
                }}
              >
                تعديل الملف الشخصي
              </Button>
            </Card>

            {/* Quick Stats */}
            {user.user_type === 'provider' && providerStats && (
              <Card className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  إحصائيات سريعة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخدمات</span>
                    <span className="font-medium">{providerStats.services}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التقييم</span>
                    <span className="font-medium">{providerStats.rating.toFixed(1)} ⭐</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المراجعات</span>
                    <span className="font-medium">{providerStats.reviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الإنجاز</span>
                    <span className="font-medium">{Math.round(providerStats.completion_rate)}%</span>
                  </div>
                </div>

                {/* Sentiment Analysis */}
                {sentiment && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <SentimentBar
                      positive={sentiment.positive}
                      neutral={sentiment.neutral}
                      negative={sentiment.negative}
                      total={sentiment.total || 0}
                    />
                  </div>
                )}
              </Card>
            )}

            {/* Organization Membership */}
            {organizations.length > 0 && (
              <Card className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    الفريق
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setShowTeamModal(true)}>
                    <Users className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">المؤسسة</span>
                    <span className="font-medium text-sm">{organizations[0]?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">أعضاء الفريق</span>
                    <span className="font-medium">{organizationMembers.length}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={() => setShowTeamModal(true)}>
                  إدارة الفريق
                </Button>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  المعلومات الشخصية
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={() => {
                    setEditFormData({
                      full_name: user.full_name,
                      email: user.email,
                      bio: user.bio || '',
                    });
                    setShowEditModal(true);
                  }}
                >
                  تعديل
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="font-medium text-gray-900">{user.phone_number}</p>
                  </div>
                </div>

                {user.province && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">الموقع</p>
                      <p className="font-medium text-gray-900">
                        {user.city?.name_ar}, {user.province.name_ar}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الانضمام</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.date_joined).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">نبذة شخصية</p>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
            </Card>

            {/* Account Security */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                أمان الحساب
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">التحقق من البريد الإلكتروني</p>
                    <p className="text-sm text-gray-600">
                      {user.email_verified ? 'تم التحقق' : 'لم يتم التحقق'}
                    </p>
                  </div>
                  {!user.email_verified && (
                    <Button variant="outline" size="sm" onClick={handleVerifyEmail}>
                      تحقق الآن
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">التحقق من رقم الهاتف</p>
                    <p className="text-sm text-gray-600">
                      {user.phone_verified ? 'تم التحقق' : 'لم يتم التحقق'}
                    </p>
                  </div>
                  {!user.phone_verified && (
                    <Button variant="outline" size="sm" onClick={handleVerifyPhone}>
                      تحقق الآن
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">كلمة المرور</p>
                    <p className="text-sm text-gray-600">آخر تحديث منذ فترة</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleChangePassword}>
                    تغيير
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="تعديل الملف الشخصي"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <Input
              type="text"
              value={editFormData.full_name}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="الاسم الكامل"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="البريد الإلكتروني"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نبذة شخصية
            </label>
            <textarea
              value={editFormData.bio}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="نبذة شخصية اختيارية"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleEditSubmit}
              isLoading={loading.editSubmit}
              className="flex-1"
            >
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </Modal>

      {/* Team Management Modal */}
      <Modal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        title="إدارة الفريق"
        size="md"
      >
        <div className="space-y-4">
          {organizations.length > 0 && (
            <>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {organizations[0]?.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {organizations[0]?.description}
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">أعضاء الفريق</h5>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {organizationMembers.length > 0 ? (
                    organizationMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user?.full_name || 'عضو غير معروف'}
                          </p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">لا يوجد أعضاء في الفريق</p>
                  )}
                </div>
              </div>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => setShowTeamModal(false)}
            className="w-full"
          >
            إغلاق
          </Button>
        </div>
      </Modal>

      {/* Image Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadedImage(null);
          setUploadPreview('');
        }}
        title="تحديث صورة الملف الشخصي"
        size="md"
      >
        <div className="space-y-4">
          {uploadPreview && (
            <div className="flex justify-center">
              <img
                src={uploadPreview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}

          <p className="text-sm text-gray-600 text-center">
            تأكد من أن الصورة واضحة ومناسبة
          </p>

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setUploadedImage(null);
                setUploadPreview('');
              }}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleImageUpload}
              isLoading={loading.imageUpload}
              className="flex-1"
            >
              تحديث الصورة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
