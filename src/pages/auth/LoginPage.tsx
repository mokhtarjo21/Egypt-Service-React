import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import toast from "react-hot-toast";

import { RootState } from "../../store/store";
import { googleLoginUser, setUser } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import type { LoginCredentials } from "../../types/auth";
import { authService } from "../../services/django";
import { GoogleLogin } from '@react-oauth/google';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+20");
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);

  const { error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${data.phone_number}`;
      const result = await authService.signIn(fullPhone, data.password);
      if (result.error) {
        toast.error(result.error.message || t("auth.login.error"));
        return;
      }
      if (result.data?.requires_2fa) {
        setTempToken(result.data.temp_token);
        setRequires2FA(true);
        return;
      }
      if (result.data?.user) {
        dispatch(setUser(result.data.user) as any);
        toast.success(t("auth.login.success"));
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(t("auth.login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const on2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      toast.error("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }
    setIs2FALoading(true);
    try {
      const result = await authService.verify2FALogin(tempToken, totpCode);
      if (result.error) {
        toast.error(result.error.message);
      } else if (result.data?.user) {
        dispatch(setUser(result.data.user) as any);
        toast.success(t("auth.login.success"));
        navigate("/dashboard");
      }
    } finally {
      setIs2FALoading(false);
    }
  };

  // ── 2FA challenge step ──────────────────────────────────────────────
  if (requires2FA) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">التحقق الثنائي</h2>
            <p className="text-gray-600">أدخل الرمز من تطبيق المصادقة الخاص بك</p>
          </div>
          <Card className="mt-6 p-6">
            <form onSubmit={on2FASubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز التحقق (6 أرقام)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={is2FALoading}>
                تحقق من الرمز
              </Button>
              <button
                type="button"
                onClick={() => { setRequires2FA(false); setTotpCode(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
              >
                ← العودة لتسجيل الدخول
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // ── Normal login step ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("auth.login.title")}
          </h2>
          <p className="text-gray-600">{t("auth.login.subtitle")}</p>
        </div>

        {/* Form */}
        <Card className="mt-8">
          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    const result = await dispatch(googleLoginUser({ idToken: credentialResponse.credential, role: 'user' }) as any);
                    if (googleLoginUser.fulfilled.match(result)) {
                      toast.success(t("auth.login.googleSuccess"));
                      navigate("/dashboard");
                    } else {
                      toast.error((result.payload as string) || t("auth.login.error"));
                    }
                  } catch (err) {
                    toast.error(t("auth.login.error"));
                  }
                }
              }}
              onError={() => {
                toast.error(t("auth.login.googleError"));
              }}
              useOneTap
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t("auth.login.or")}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.login.phone")}</label>
              <div className="flex gap-2" dir="ltr">
                <select
                  className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+20">+20</option>
                </select>
                <div className="flex-1">
                  <Input
                    type="tel"
                    leftIcon={<Mail className="w-5 h-5" />}
                    placeholder="1012345678"
                    error={errors.phone_number?.message}
                    {...register("phone_number", {
                      required: t("auth.validation.phoneRequired"),
                      pattern: {
                        value: /^\d{8,15}$/,
                        message: t("auth.validation.phoneInvalid"),
                      },
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <Input
              label={t("auth.login.password")}
              type={showPassword ? "text" : "password"}
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              }
              error={errors.password?.message}
              {...register("password", {
                required: t("auth.validation.passwordRequired"),
                minLength: {
                  value: 6,
                  message: t("auth.validation.passwordMinLength"),
                },
              })}
            />

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {t("auth.login.loginButton")}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-600 text-sm">{error}</div>
            )}
          </form>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600">
            {t("auth.login.noAccount")}{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t("auth.login.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
