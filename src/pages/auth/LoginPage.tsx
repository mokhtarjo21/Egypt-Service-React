import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { RootState } from "../../store/store";
import { loginUser } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import type { LoginCredentials } from "../../types/auth";
import logo from "../../assets/logo.jpeg";
const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await dispatch(loginUser(data) as any);
      if (loginUser.fulfilled.match(result)) {
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/dashboard");
      } else {
        toast.error((result.payload as string) || "حدث خطأ في تسجيل الدخول");
      }
    } catch (err) {
      toast.error("حدث خطأ في تسجيل الدخول");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-primary rounded-full overflow-hidden flex items-center justify-center mx-auto mb-6">
            <img src={logo} alt="Logo" className="w-full h-full object-fill" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("auth.login.title")}
          </h2>
          <p className="text-gray-600">{t("auth.login.subtitle")}</p>
        </div>

        {/* Form */}
        <Card className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Number */}
            <Input
              label={t("auth.login.phone")}
              type="tel"
              leftIcon={<Mail className="w-5 h-5" />} // يمكنك استبدال الأيقونة بأيقونة هاتف إذا أردت
              error={errors.phone_number?.message}
              {...register("phone_number", {
                required: "رقم الهاتف مطلوب",
                pattern: {
                  value: /^\+20[0-9]{10}$/, // تحقق من أن الرقم يبدأ بـ +20 ويليه 9 أرقام
                  message: "رقم الهاتف يجب أن يكون بصيغة +201234567890",
                },
              })}
            />

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
                required: "كلمة المرور مطلوبة",
                minLength: {
                  value: 6,
                  message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
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
