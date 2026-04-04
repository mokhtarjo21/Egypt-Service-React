import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState, AppDispatch } from "../store/store";
import { fetchCategories, fetchFeaturedServices } from "../store/slices/servicesSlice";
import { useDirection } from "../hooks/useDirection";
import { Compass, Users, MapPin, Search, Star, Clock, Sparkles } from "lucide-react";

// The colors from the mockup:
// Background: #f7efe1 (light sand)
// Dark Blue: #192a46
// Yellow/Gold: #f6c065

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, featuredServices } = useSelector((state: RootState) => state.services);

  useEffect(() => {
    dispatch(fetchCategories() as any);
    dispatch(fetchFeaturedServices() as any);
  }, [dispatch]);

  const features = [
    {
      icon: Users,
      title: isRTL ? "خبراء موثوقون" : "Verified Experts",
      desc: isRTL ? "مقدمو خدمات محترفون ومعتمدون لضمان أعلى جودة" : "Professional providers ensuring highest quality",
    },
    {
      icon: MapPin,
      title: isRTL ? "تغطية شاملة" : "Wide Coverage",
      desc: isRTL ? "خدمات متوفرة في جميع أنحاء الجمهورية" : "Services available across the country",
    },
    {
      icon: Compass,
      title: isRTL ? "سهولة الوصول" : "Easy Access",
      desc: isRTL ? "واجهة بسيطة للبحث والتواصل والحجز" : "Simple interface to find, connect and book",
    },
    {
      icon: Star,
      title: isRTL ? "تقييم وشفافية" : "Transparent Ratings",
      desc: isRTL ? "اقرأ مراجعات حقيقية قبل اختيار الخدمة" : "Read real reviews before choosing",
    },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#f7efe1' }}>
      
      {/* 1) Hero Section */}
      <section className="relative px-4 sm:px-8 lg:px-16 pt-24 pb-16 overflow-hidden">
        {/* Sand dunes background decoration (SVG/CSS) */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-30">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="#e1cdab" fillOpacity="1" d="M0,224L48,202.7C96,181,192,139,288,133.3C384,128,480,160,576,170.7C672,181,768,171,864,138.7C960,107,1056,53,1152,48C1248,43,1344,85,1392,106.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Text Content */}
          <div className={`space-y-6 ${isRTL ? 'lg:pl-16' : 'lg:pr-16'}`}>
            <p className="text-[#192a46] text-xl font-medium tracking-wide">
              {isRTL ? "اكتشف أفضل الخدمات في مصر" : "The leading platform to find"}
            </p>
            <h1 className="text-5xl lg:text-7xl font-bold text-[#192a46] leading-tight">
              {isRTL ? "خدمات مصر" : "Egypt Services"}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              {isRTL 
                ? "ابدأ بتصفح منصتنا الموثوقة للتواصل مع محترفي الخدمات وتلبية كافة احتياجاتك بكل يسر وسهولة." 
                : "Start compiling the your acen ... Connect with trusted professionals for all your needs."}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/services">
                <button className="px-8 py-3.5 rounded-2xl bg-[#f6c065] text-[#192a46] font-bold shadow-md hover:bg-[#e6b15a] transition-colors flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isRTL ? "اكتشف المزيد" : "More Detail"}
                </button>
              </Link>
              <Link to="/register">
                <button className="px-8 py-3.5 rounded-2xl bg-white border-2 border-[#192a46] text-[#192a46] font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {isRTL ? "سجل الآن" : "Sign Up"}
                </button>
              </Link>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Some decorative background elements */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-[#f6c065] rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#192a46] rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10 w-full max-w-[450px]">
              {/* Tutankhamun / Egyptian Illustration Placeholder */}
              <img 
                src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=1000" 
                alt="Egypt Pyramids Pharaoh" 
                className="w-full h-auto object-cover rounded-t-[150px] rounded-b-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 2) Middle Section: Featured Categories / Banners */}
      <section className="px-4 sm:px-8 lg:px-16 pb-20 relative z-20">
        <div className="max-w-6xl mx-auto">
          {categories && categories.length >= 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner 1: Warm Golden Theme */}
              <Link to={`/services?category=${categories[0]?.slug}`}>
                <div className="group relative overflow-hidden rounded-3xl h-40 md:h-48 cursor-pointer flex items-center border border-[#e1cdab] shadow-sm hover:shadow-lg transition-all">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#e89d53] to-[#f6c065]"></div>
                  {/* Decorative sun pattern */}
                  <div className="absolute -left-10 -top-10 w-40 h-40 border-8 border-white/20 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                  <div className={`relative z-10 p-8 w-full flex justify-between items-center ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {isRTL ? categories[0]?.name_ar : categories[0]?.name_en}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {isRTL ? "تصفح أحدث الخدمات" : "Explore our top services"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-white">
                      <Search className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Banner 2: Night Blue Theme */}
              <Link to={`/services?category=${categories[1]?.slug}`}>
                <div className="group relative overflow-hidden rounded-3xl h-40 md:h-48 cursor-pointer flex items-center border border-[#192a46]/20 shadow-sm hover:shadow-lg transition-all">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#192a46] to-[#2c4770]"></div>
                  {/* Decorative moon pattern */}
                  <div className="absolute -right-5 bottom-0 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="absolute right-5 bottom-10 w-20 h-20 bg-transparent border-[10px] border-l-white/20 rounded-full transform rotate-45"></div>
                  
                  <div className={`relative z-10 p-8 w-full flex justify-between items-center ${isRTL ? 'text-left flex-row-reverse' : 'text-right flex-row-reverse'}`}>
                     <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm text-white">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {isRTL ? categories[1]?.name_ar : categories[1]?.name_en}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {isRTL ? "خدمات متميزة وموثوقة" : "Premium trusted services"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ) : (
             <div className="flex justify-center text-gray-500">جاري تحميل الفئات...</div>
          )}
        </div>
      </section>

      {/* 3) Features Arch Section */}
      {/* 
        This is the large dark blue semi-circle area at the bottom representing "Dellicles for portorent"
      */}
      <section className="bg-[#192a46] text-white pt-20 pb-32 px-4 sm:px-8 lg:px-16" style={{ borderTopLeftRadius: '100px', borderTopRightRadius: '100px' }}>
        <div className="max-w-6xl mx-auto relative">
          
          {/* Decorative Triangles */}
          <div className="absolute top-0 left-10 w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-transparent border-b-[#f6c065] transform -rotate-12"></div>
          <div className="absolute top-10 right-10 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-transparent border-b-[#f6c065] transform rotate-45 opacity-80"></div>

          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light tracking-wider text-gray-200">
              {isRTL ? "ميزات لمنفعتك" : "Features for your benefit"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex flex-col items-center group">
                  <div className="mb-6 w-16 h-16 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2">
                    <Icon className="w-10 h-10 text-[#f6c065]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 tracking-wide">{item.title}</h3>
                  <p className="text-[#8ba7c5] text-sm leading-relaxed max-w-[200px] mx-auto">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Subtle line separator at bottom matching the image */}
          <div className="mt-20 border-t border-[#2c4770] w-full max-w-4xl mx-auto rounded-full"></div>

        </div>
      </section>
      
    </div>
  );
};

export default HomePage;
