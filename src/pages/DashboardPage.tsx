import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Eye,
  BarChart3,
  MessageCircle,
  Calendar,
  TrendingUp,
  Star,
  Users,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

import { RootState } from "../store/store";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { apiClient } from "../services/api/client";
import { servicesApi } from "../services/api/servicesApi";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, servicesRes] = await Promise.all([
        apiClient.get(`/analytics/provider/?days=${days}`),
        servicesApi.getUserServices(),
      ]);

      setAnalytics(analyticsRes.data);
      setMyServices(Array.isArray(servicesRes) ? servicesRes : (servicesRes as any).results || []);

      if (user?.role === "admin") {
        try {
          const activityRes = await apiClient.get(`/moderation/dashboard/`);
          setActivity(activityRes.data);
        } catch (err) {
          console.error("Failed to load moderation activity:", err);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (slug: string) => {
    if (!confirm(t("dashboard.confirm_delete"))) return;
    setDeletingSlug(slug);
    try {
      await servicesApi.deleteService(slug);
      setMyServices((prev) => prev.filter((s) => s.slug !== slug));
      toast.success(t("dashboard.service_deleted"));
    } catch (err) {
      toast.error(t("dashboard.delete_failed"));
    } finally {
      setDeletingSlug(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("auth.login_required")}
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    { key: "total_profile_views", icon: Eye },
    { key: "total_service_views", icon: BarChart3 },
    { key: "total_messages", icon: MessageCircle },
    { key: "total_bookings", icon: Calendar },
    { key: "total_revenue", icon: TrendingUp },
    { key: "avg_rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {t("dashboard.welcome")}, {user.full_name}
            </h1>
            <p className="text-gray-500">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-md px-3 py-2"
          >
            <option value={7}>{t("dashboard.last_7_days")}</option>
            <option value={30}>{t("dashboard.last_30_days")}</option>
            <option value={90}>{t("dashboard.last_90_days")}</option>
          </select>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map(({ key, icon: Icon }) => (
            <Card key={key} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    {t(`dashboard.${key}`)}
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.current_totals[key] ?? 0}
                  </p>
                </div>
                <Icon className="w-6 h-6 text-primary" />
              </div>
            </Card>
          ))}
        </div>

        {/* Conversion + Response */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <p className="text-gray-500">{t("dashboard.conversion_rate")}</p>
            <p className="text-4xl font-bold text-green-600">
              {analytics.conversion_rate}%
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-gray-500">{t("dashboard.avg_response_time")}</p>
            <p className="text-4xl font-bold">
              {analytics.current_totals.avg_response_time ?? t("common.na")}
            </p>
          </Card>
        </div>

        {/* Daily Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            {t("dashboard.daily_performance")}
          </h3>

          {analytics.daily_data.length === 0 ? (
            <p className="text-center text-gray-500">
              {t("dashboard.no_data")}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.daily_data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="views" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Services */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            {t("dashboard.top_services")}
          </h3>

          <ul className="space-y-3">
            {analytics.top_services.map((service: any) => (
              <li
                key={service.slug}
                className="flex justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span>{service.title}</span>
                <span className="text-sm text-gray-500">
                  {service.views} {t("dashboard.views")}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* My Services */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              {t("dashboard.my_services")}
            </h3>
            <Link
              to="/add-service"
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              {t("dashboard.add_service")}
            </Link>
          </div>

          {myServices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {t("dashboard.no_services")}
            </p>
          ) : (
            <div className="space-y-3">
              {myServices.map((service: any) => (
                <div
                  key={service.slug}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {service.cover_image && (
                      <img
                        src={service.cover_image}
                        alt={service.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {service.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.price_display || service.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {service.is_active
                        ? t("dashboard.active")
                        : t("dashboard.inactive")}
                    </span>
                    <Link
                      to={`/add-service?edit=${service.slug}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title={t("common.edit")}
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteService(service.slug)}
                      disabled={deletingSlug === service.slug}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title={t("common.delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Admin Sections */}
        {user.role === "admin" && activity && (
          <>
            {/* Queue Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(activity.queue_stats).map(([key, value]) => (
                <Card key={key} className="p-4 text-center">
                  <p className="text-sm text-gray-500">
                    {t(`dashboard.${key}`)}
                  </p>
                  <p className="text-2xl font-bold">{value as number}</p>
                </Card>
              ))}
            </div>

            {/* Moderator Workload */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("dashboard.moderator_workload")}
              </h3>

              <ul className="space-y-3">
                {activity.moderator_workload.map((mod: any) => (
                  <li
                    key={mod.id}
                    className="flex justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{mod.full_name}</span>
                    <span className="text-sm text-gray-500">
                      {mod.active_reports} {t("dashboard.active_reports")}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
