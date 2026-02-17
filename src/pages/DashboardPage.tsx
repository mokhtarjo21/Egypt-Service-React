import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { RootState } from "../store/store";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [analytics, setAnalytics] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/analytics/provider/?days=${days}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
        fetch(`${API_BASE}/api/v1/moderation/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }),
      ]);

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }

      if (activityRes.ok) {
        setActivity(await activityRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("auth.login_required")}
      </div>
    );
  }

  if (loading || !analytics || !activity) {
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

      </div>
    </div>
  );
};

export default DashboardPage;
