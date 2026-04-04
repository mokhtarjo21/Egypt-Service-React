import React, { useState ,useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, Phone, Eye, EyeOff, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

import { RootState } from "../../store/store";
import { registerUser, googleLoginUser } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { useDirection } from "../../hooks/useDirection";
import { GoogleLogin } from '@react-oauth/google';
const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:8000";

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
  const [countryCode, setCountryCode] = useState("+20");
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null);
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null);

  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [governorates, setGovernorates] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const getGovernorates = async () => {
    try {
      const response = await fetch(API_BASE + "/api/v1/health/geo/governorates/");
      const data = await response.json();
      setGovernorates(data.results);
    } catch (error) {
      console.error("Error fetching governorates:", error);
    }
  };

  const getCenters = async (governorateId: string) => {
    try {
      const response = await fetch(
        API_BASE + `/api/v1/health/geo/centers/?gov_id=${governorateId}`
      );
      const data = await response.json();
      
      setCenters(data.results);
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  useEffect(() => {
    getGovernorates();
  }, []);

  useEffect(() => {
   
      getCenters(selectedGovernorate);
    
  }, [selectedGovernorate]);
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formData = new FormData();
      formData.append("phone_number", `${countryCode}${data.phone_number}`);
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
        toast.success(t("auth.register.successMsg"));
        navigate("/verify-phone", {
          state: {
            phone_number: `${countryCode}${data.phone_number}`,
            user_id: result.user_id,
          },
        });
      } else {
        const errorData = await response.json();
        
        if (errorData.error) {
          toast.error(errorData.error);
        } else if (typeof errorData === 'object' && errorData !== null) {
          Object.values(errorData).forEach((errArray: any) => {
            if (Array.isArray(errArray)) {
              errArray.forEach((errMsg) => toast.error(errMsg));
            } else if (typeof errArray === 'string') {
               toast.error(errArray);
            }
          });
        } else {
          toast.error(t("auth.register.errorMsg"));
        }
      }
    } catch (err) {
      toast.error(t("auth.register.errorMsg"));
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["full_name", "phone_number", "email"]);
    } else if (step === 2) {
      isValid = await trigger(["password", "password_confirm", "governorate", "center"]);
    }
    if (isValid) {
      setStep(step + 1);
    }
  };
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
          {step === 1 && (
            <div className="mb-6">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      try {
                        const result = await dispatch(googleLoginUser({ idToken: credentialResponse.credential, role: 'user' }) as any);
                        if (googleLoginUser.fulfilled.match(result)) {
                          toast.success(t("auth.register.googleSuccess"));
                          navigate("/dashboard");
                        } else {
                          toast.error((result.payload as string) || t("auth.register.googleError"));
                        }
                      } catch (err) {
                        toast.error(t("auth.register.authError"));
                      }
                    }
                  }}
                  onError={() => {
                    toast.error(t("auth.register.googleFailed"));
                  }}
                  useOneTap
                />
              </div>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t("auth.register.orRegisterPhone")}</span>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <Input
                  label={t("auth.register.fullName")}
                  type="text"
                  leftIcon={<User className="w-5 h-5" />}
                  error={errors.full_name?.message}
                  {...register("full_name", {
                    required: t("auth.validation.fullNameRequired"),
                    minLength: {
                      value: 3,
                      message: t("auth.validation.fullNameMinLength"),
                    },
                  })}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.register.phone")}</label>
                  <div className="flex gap-2" dir="ltr">
                    <select
                      className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+20">+20</option>
                      {/* <option value="+966">+966</option>
                      <option value="+971">+971</option>
                      <option value="+965">+965</option>
                      <option value="+974">+974</option>
                      <option value="+973">+973</option>
                      <option value="+968">+968</option> */}
                    </select>
                    <div className="flex-1">
                      <Input
                        type="tel"
                        leftIcon={<Phone className="w-5 h-5" />}
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

                <Input
                  label={t("auth.register.emailOptional")}
                  type="email"
                  leftIcon={<Mail className="w-5 h-5" />}
                  error={errors.email?.message}
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("auth.validation.emailInvalid"),
                    },
                  })}
                />

                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full"
                  size="lg"
                >
                  {t("auth.register.next")}
                </Button>
              </>
            )}

            {/* Step 2: Password & Location */}
            {step === 2 && (
              <>
                <Input
                  label={t("auth.register.password")}
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
                      value: 8,
                      message: t("auth.validation.passwordMinLength"),
                    },
                    pattern: {
                      value: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                      message: t("auth.validation.passwordFormat"),
                    }
                  })}
                />

                <Input
                  label={t("auth.register.confirmPassword")}
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
                    required: t("auth.validation.passwordRequired"),
                    validate: (value) =>
                      value === password || t("auth.validation.passwordMismatch"),
                  })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                        errors.governorate ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("governorate", {
                        required: t("auth.validation.governorateRequired"),
                        onChange: (e) => setSelectedGovernorate(e.target.value)
                      })}
                    >
                      <option value="">{t("auth.register.selectGovernorate")}</option>
                      {governorates.map((gov: any) => (
                        <option key={gov.id} value={gov.id}>
                          {gov.name}
                        </option>
                      ))}
                    </select>
                    {errors.governorate && (
                      <p className="text-xs text-red-600">{errors.governorate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                        errors.center ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("center", { required: t("auth.validation.centerRequired") })}
                    >
                      <option value="">{t("auth.register.selectCenter")}</option>
                      {centers.map((center: any) => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                    {errors.center && (
                      <p className="text-xs text-red-600">{errors.center.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    {t("auth.register.previous")}
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1">
                    {t("auth.register.next")}
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: ID Documents */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("auth.register.idFront")}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {frontIdPreview ? (
                      <div className="relative inline-block">
                        <img src={frontIdPreview} alt="Front ID" className="max-h-48 object-contain rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setFrontIdPreview(null);
                            setValue("id_document", undefined as any);
                          }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label
                          htmlFor="id_document"
                          className="cursor-pointer text-primary-600 hover:text-primary-500"
                        >
                          {t("auth.register.chooseFile")}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("auth.register.fileFormat")}
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="id_document"
                      {...register("id_document", {
                        onChange: (e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            setFrontIdPreview(URL.createObjectURL(file));
                          } else {
                            setFrontIdPreview(null);
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("auth.register.idBackOptional")}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {backIdPreview ? (
                      <div className="relative inline-block">
                        <img src={backIdPreview} alt="Back ID" className="max-h-48 object-contain rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setBackIdPreview(null);
                            setValue("id_document_back", undefined as any);
                          }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label
                          htmlFor="id_document_back"
                          className="cursor-pointer text-primary-600 hover:text-primary-500"
                        >
                          {t("auth.register.chooseFile")}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("auth.register.fileFormat")}
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="id_document_back"
                      {...register("id_document_back", {
                        onChange: (e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith("image/")) {
                            setBackIdPreview(URL.createObjectURL(file));
                          } else {
                            setBackIdPreview(null);
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{t("auth.register.note")}</strong> {t("auth.register.reviewNote")}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    {t("auth.register.previous")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    {t("auth.register.registerButton")}
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
