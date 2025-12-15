import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Filter,
  Download,
  Users,
  FileText,
  Gavel,
  TrendingUp
} from 'lucide-react';

import { RootState } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface QueueStats {
  pending_reports: number;
  assigned_reports: number;
  overdue_reports: number;
  pending_appeals: number;
  overdue_appeals: number;
}

interface Report {
  id: string;
  reporter: {
    full_name: string;
    phone_number: string;
  };
  reason: string;
  description: string;
  severity: string;
  status: string;
  assigned_to?: {
    full_name: string;
  };
  sla_due_at: string;
  is_overdue: boolean;
  created_at: string;
}

interface ModerationAction {
  id: string;
  action_type: string;
  reason_code: string;
  reason_text: string;
  moderator: {
    full_name: string;
  };
  target_user?: {
    full_name: string;
  };
  created_at: string;
}

interface Appeal {
  id: string;
  appellant: {
    full_name: string;
  };
  appeal_text: string;
  status: string;
  is_overdue: boolean;
  created_at: string;
}

const SafetyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'appeals' | 'policies'>('overview');
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Check admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة الأمان</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'appeals') loadAppeals();
  }, [activeTab, filterStatus, filterSeverity]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/moderation/dashboard/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueueStats(data.queue_stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      
      const response = await fetch(`/api/v1/moderation/reports/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.results || data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppeals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/moderation/appeals/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppeals(data.results || data);
      }
    } catch (error) {
      console.error('Failed to load appeals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, actionType: string, reasonCode: string, reasonText: string) => {
    try {
      const response = await fetch(`/api/v1/moderation/reports/${reportId}/resolve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          action_type: actionType,
          reason_code: reasonCode,
          reason_text: reasonText,
        }),
      });

      if (response.ok) {
        loadReports();
        setShowReportModal(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const handleAppealDecision = async (appealId: string, decision: string, notes: string) => {
    try {
      const response = await fetch(`/api/v1/moderation/appeals/${appealId}/review/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          decision,
          notes,
        }),
      });

      if (response.ok) {
        loadAppeals();
        setShowAppealModal(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to review appeal:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      critical: { color: 'bg-red-100 text-red-800', label: t('admin.severity.critical') },
      high: { color: 'bg-orange-100 text-orange-800', label: t('admin.severity.high') },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: t('admin.severity.medium') },
      low: { color: 'bg-green-100 text-green-800', label: t('admin.severity.low') },
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: t('admin.reportStatus.pending') },
      assigned: { color: 'bg-blue-100 text-blue-800', label: t('admin.reportStatus.assigned') },
      investigating: { color: 'bg-purple-100 text-purple-800', label: t('admin.reportStatus.investigating') },
      resolved: { color: 'bg-green-100 text-green-800', label: t('admin.reportStatus.resolved') },
      dismissed: { color: 'bg-gray-100 text-gray-800', label: t('admin.reportStatus.dismissed') },
      escalated: { color: 'bg-red-100 text-red-800', label: t('admin.reportStatus.escalated') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: t('admin.tabs.overview'), icon: TrendingUp },
    { id: 'reports', label: t('admin.tabs.reports'), icon: AlertTriangle },
    { id: 'appeals', label: t('admin.tabs.appeals'), icon: Gavel },
    { id: 'policies', label: t('admin.tabs.policies'), icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            لوحة الأمان والثقة
          </h1>
          <p className="text-gray-600">
            إدارة البلاغات والسياسات وإجراءات الإشراف
          </p>
        </div>
        <Button leftIcon={<Download className="w-4 h-4" />}>
          تصدير التقارير
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && queueStats && (
        <div className="space-y-8">
          {/* Queue Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-yellow-100">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">بلاغات معلقة</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStats.pending_reports}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">بلاغات مُعينة</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStats.assigned_reports}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">متأخرة عن SLA</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStats.overdue_reports}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Gavel className="w-6 h-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">استئنافات معلقة</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStats.pending_appeals}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">استئنافات متأخرة</p>
                  <p className="text-2xl font-bold text-gray-900">{queueStats.overdue_appeals}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              إجراءات سريعة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setActiveTab('reports')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                مراجعة البلاغات
                {queueStats.pending_reports > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mr-2">
                    {queueStats.pending_reports}
                  </span>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setActiveTab('appeals')}
              >
                <Gavel className="w-4 h-4 mr-2" />
                مراجعة الاستئنافات
                {queueStats.pending_appeals > 0 && (
                  <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 mr-2">
                    {queueStats.pending_appeals}
                  </span>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setActiveTab('policies')}
              >
                <FileText className="w-4 h-4 mr-2" />
                إدارة السياسات
              </Button>
              
              <Button
                variant="outline"
                className="justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                تقارير الأمان
              </Button>
            </div>
          </Card>

          {/* SLA Performance */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              أداء SLA (آخر 30 يوم)
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">94%</div>
                <div className="text-sm text-gray-600">البلاغات في الوقت المحدد</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2.4h</div>
                <div className="text-sm text-gray-600">متوسط وقت الاستجابة</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-600">الاستئنافات في الوقت المحدد</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              إدارة البلاغات
            </h2>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">معلق</option>
                <option value="assigned">مُعين</option>
                <option value="investigating">قيد التحقيق</option>
                <option value="resolved">محلول</option>
              </select>
              
              <select 
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">جميع الأولويات</option>
                <option value="critical">حرج</option>
                <option value="high">عالي</option>
                <option value="medium">متوسط</option>
                <option value="low">منخفض</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        البلاغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الأولوية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        المُعين إليه
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        SLA
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className={`hover:bg-gray-50 ${report.is_overdue ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {report.reason} - {report.reporter.full_name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {report.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSeverityBadge(report.severity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.assigned_to?.full_name || 'غير مُعين'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${report.is_overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {report.is_overdue ? 'متأخر' : new Date(report.sla_due_at).toLocaleDateString('ar-EG')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportModal(true);
                            }}
                            leftIcon={<Eye className="w-4 h-4" />}
                          >
                            مراجعة
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Appeals Tab */}
      {activeTab === 'appeals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              إدارة الاستئنافات
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <Card key={appeal.id} className={appeal.is_overdue ? 'border-red-200 bg-red-50' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">
                          استئناف من {appeal.appellant.full_name}
                        </h4>
                        {getStatusBadge(appeal.status)}
                        {appeal.is_overdue && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            متأخر
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {appeal.appeal_text.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        تم الإرسال: {new Date(appeal.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAppeal(appeal);
                        setShowAppealModal(true);
                      }}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      مراجعة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Detail Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="مراجعة البلاغ"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">تفاصيل البلاغ</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>المُبلغ:</strong> {selectedReport.reporter.full_name}</p>
                  <p><strong>السبب:</strong> {selectedReport.reason}</p>
                  <p><strong>الأولوية:</strong> {getSeverityBadge(selectedReport.severity)}</p>
                  <p><strong>الحالة:</strong> {getStatusBadge(selectedReport.status)}</p>
                  <p><strong>تاريخ الإنشاء:</strong> {new Date(selectedReport.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">الوصف</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedReport.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">إجراءات الإشراف</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportAction(selectedReport.id, 'warn', 'OTHE_001', 'تحذير عام')}
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                >
                  تحذير
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportAction(selectedReport.id, 'hide_content', 'INAP_001', 'محتوى غير مناسب')}
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  إخفاء المحتوى
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportAction(selectedReport.id, 'suspend_user', 'HARA_001', 'تعليق مؤقت')}
                  leftIcon={<Clock className="w-4 h-4" />}
                >
                  تعليق مؤقت
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReportAction(selectedReport.id, 'block_user', 'FRAU_001', 'حظر دائم')}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  حظر دائم
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => handleReportAction(selectedReport.id, 'dismiss', 'OTHE_001', 'لا يوجد انتهاك')}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                استبعاد البلاغ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Appeal Detail Modal */}
      <Modal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        title="مراجعة الاستئناف"
        size="lg"
      >
        {selectedAppeal && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">تفاصيل الاستئناف</h4>
              <div className="space-y-2 text-sm">
                <p><strong>المُستأنف:</strong> {selectedAppeal.appellant.full_name}</p>
                <p><strong>الحالة:</strong> {getStatusBadge(selectedAppeal.status)}</p>
                <p><strong>تاريخ الإرسال:</strong> {new Date(selectedAppeal.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">نص الاستئناف</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{selectedAppeal.appeal_text}</p>
              </div>
            </div>

            <div className="flex space-x-4 rtl:space-x-reverse">
              <Button
                onClick={() => handleAppealDecision(selectedAppeal.id, 'approved', 'تم قبول الاستئناف')}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                قبول الاستئناف
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAppealDecision(selectedAppeal.id, 'denied', 'تم رفض الاستئناف')}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                رفض الاستئناف
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SafetyDashboard;