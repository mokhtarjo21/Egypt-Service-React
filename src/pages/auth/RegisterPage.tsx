import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Phone, Eye, EyeOff, Upload } from "lucide-react";
import toast from "react-hot-toast";

import { RootState } from "../../store/store";
import { registerUser } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { useDirection } from "../../hooks/useDirection";
const API_BASE = import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000";

interface RegisterFormData {
  phone_number: string;
  full_name: string;
  email?: string;
  password: string;
  password_confirm: string;
  governorate: string;
  center: string;
  id_document?: FileList;
  id_document_back?: FileList;
}

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formData = new FormData();
      formData.append("phone_number", data.phone_number);
      formData.append("full_name", data.full_name);
      formData.append("password", data.password);
      formData.append("password_confirm", data.password_confirm);

      if (data.email) formData.append("email", data.email);
      if (data.governorate) formData.append("governorate", data.governorate);
      if (data.center) formData.append("center", data.center);
      if (data.id_document?.[0])
        formData.append("id_document", data.id_document[0]);
      if (data.id_document_back?.[0])
        formData.append("id_document_back", data.id_document_back[0]);

      // Call registration API
      const response = await fetch(
        API_BASE + "/api/v1/accounts/auth/register/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success("تم إنشاء الحساب بنجاح. يرجى التحقق من رقم هاتفك.");
        navigate("/verify-phone", {
          state: {
            phone_number: data.phone_number,
            user_id: result.user_id,
          },
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "حدث خطأ في إنشاء الحساب");
      }
    } catch (err) {
      toast.error("حدث خطأ في إنشاء الحساب");
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">خ</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("auth.register.title")}
          </h2>
          <p className="text-gray-600">{t("auth.register.subtitle")}</p>

          {/* Step Indicator */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="flex space-x-2 rtl:space-x-reverse">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-3 h-3 rounded-full ${
                    stepNum <= step ? "bg-primary-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <Input
                  label="الاسم الكامل"
                  type="text"
                  leftIcon={<User className="w-5 h-5" />}
                  error={errors.full_name?.message}
                  {...register("full_name", {
                    required: "الاسم الكامل مطلوب",
                    minLength: {
                      value: 3,
                      message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                    },
                  })}
                />

                <Input
                  label="رقم الهاتف"
                  type="tel"
                  leftIcon={<Phone className="w-5 h-5" />}
                  placeholder="01012345678"
                  error={errors.phone_number?.message}
                  {...register("phone_number", {
                    required: "رقم الهاتف مطلوب",
                    pattern: {
                      value: /^(\+20|0)?1[0125]\d{8}$/,
                      message: "رقم الهاتف غير صحيح",
                    },
                  })}
                />

                <Input
                  label="البريد الإلكتروني (اختياري)"
                  type="email"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "البريد الإلكتروني غير صحيح",
                    },
                  })}
                />

                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full"
                  size="lg"
                >
                  التالي
                </Button>
              </>
            )}

            {/* Step 2: Password & Location */}
            {step === 2 && (
              <>
                <Input
                  label="كلمة المرور"
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
                      value: 8,
                      message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
                    },
                  })}
                />

                <Input
                  label="تأكيد كلمة المرور"
                  type={showConfirmPassword ? "text" : "password"}
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  error={errors.password_confirm?.message}
                  {...register("password_confirm", {
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: (value) =>
                      value === password || "كلمات المرور غير متطابقة",
                  })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    {...register("governorate", {
                      required: "المحافظة مطلوبة",
                    })}
                  >
                    <option value="">اختر المحافظة</option>
                    <option value="1">القاهرة</option>
                    <option value="2">الإسكندرية</option>
                    <option value="3">الجيزة</option>
                  </select>

                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    {...register("center", { required: "المركز مطلوب" })}
                  >
                    <option value="">اختر المركز</option>
                    <option value="1">وسط البلد</option>
                    <option value="2">مدينة نصر</option>
                    <option value="3">الزمالك</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1">
                    التالي
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: ID Documents */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة البطاقة الشخصية (الوجه الأمامي)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="id_document"
                      {...register("id_document")}
                    />
                    <label
                      htmlFor="id_document"
                      className="cursor-pointer text-primary-600 hover:text-primary-500"
                    >
                      اختر ملف أو اسحبه هنا
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, PDF حتى 10MB
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة البطاقة الشخصية (الوجه الخلفي) - اختياري
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="id_document_back"
                      {...register("id_document_back")}
                    />
                    <label
                      htmlFor="id_document_back"
                      className="cursor-pointer text-primary-600 hover:text-primary-500"
                    >
                      اختر ملف أو اسحبه هنا
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, PDF حتى 10MB
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ملاحظة:</strong> ستتم مراجعة المستندات من قبل فريقنا
                    خلال 24-48 ساعة. ستحصل على إشعار عند الموافقة على حسابك.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    إنشاء الحساب
                  </Button>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-600 text-sm">{error}</div>
            )}
          </form>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-600">
            {t("auth.register.hasAccount")}{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t("auth.register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
