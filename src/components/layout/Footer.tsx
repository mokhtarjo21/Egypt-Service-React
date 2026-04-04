import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Facebook, Twitter, Instagram, Youtube,
  Mail, Phone, MapPin, ChevronUp,
  Shield, Star, Users, ArrowLeft,
} from "lucide-react";
import { useDirection } from "../../hooks/useDirection";
import logo from "../../assets/logo.jpeg";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

/* ── link item ─────────────────────────── */
const FooterLink: React.FC<{ to: string; label: string; external?: boolean }> = ({ to, label, external }) => {
  const cls = "flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors duration-200 group";
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        <span className="w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        {label}
      </a>
    );
  }
  return (
    <Link to={to} onClick={scrollToTop} className={cls}>
      <span className="w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      {label}
    </Link>
  );
};

/* ── social button ─────────────────────── */
const SocialBtn: React.FC<{ icon: React.ComponentType<{ className?: string }>; href: string; label: string; color: string }> = ({
  icon: Icon, href, label, color,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 transition-all duration-200 hover:scale-110 hover:border-white/30 group`}
    title={label}
  >
    <Icon className={`w-4 h-4 text-gray-400 group-hover:${color} transition-colors`} />
  </a>
);

/* ════════════════════════════════════════ */
export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  };

  const quickLinks = [
    { to: "/",          label: t("navigation.home") },
    { to: "/services",  label: t("navigation.services") },
    { to: "/categories",label: t("navigation.categories") },
    { to: "/about",     label: t("navigation.about") },
    { to: "/contact",   label: t("navigation.contact") },
  ];

  const supportLinks = [
    { to: "/help",    label: t("footer.helpCenter") },
    { to: "/contact", label: t("footer.contactUs") },
    { to: "/terms",   label: t("footer.termsOfService") },
    { to: "/privacy", label: t("footer.privacyPolicy") },
    { to: "/faq",     label: "الأسئلة الشائعة" },
  ];

  const socials = [
    { icon: Facebook,  href: "https://facebook.com",  label: "Facebook",  color: "text-blue-400"  },
    { icon: Twitter,   href: "https://twitter.com",   label: "Twitter",   color: "text-sky-400"   },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "text-pink-400"  },
    { icon: Youtube,   href: "https://youtube.com",   label: "YouTube",   color: "text-red-400"   },
  ];

  const trustBadges = [
    { icon: Shield, text: "منصة موثوقة ومرخصة" },
    { icon: Star,   text: "تقييم 4.8 / 5" },
    { icon: Users,  text: "+10,000 مستخدم نشط" },
  ];

  return (
    <footer className="hidden lg:block bg-gray-950 text-white" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Newsletter strip ── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">ابق على اطلاع!</h3>
              <p className="text-blue-100 text-sm">اشترك في نشرتنا البريدية لآخر الأخبار والعروض</p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
                ✓ تم الاشتراك بنجاح!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 sm:w-60 px-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/25 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors shrink-0"
                >
                  اشتراك <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              onClick={scrollToTop}
              className="flex items-center gap-3 mb-5 group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-white text-lg">
                {isRTL ? t("navbar.platformName") : t("navbar.platformNameEn")}
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t("footer.description")}
            </p>

            {/* Social links */}
            <div className="flex gap-2 flex-wrap mb-6">
              {socials.map(s => (
                <SocialBtn key={s.label} {...s} />
              ))}
            </div>

            {/* Contact hints */}
            <div className="space-y-2">
              <a href="tel:+201122411136" className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                +2 01122411136
              </a>
              <a href="mailto:support@egyptservice.com" className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                support@egyptservice.com
              </a>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                القاهرة، جمهورية مصر العربية
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(l => (
                <li key={l.to}><FooterLink to={l.to} label={l.label} /></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3">
              {supportLinks.map(l => (
                <li key={l.to}><FooterLink to={l.to} label={l.label} /></li>
              ))}
            </ul>
          </div>

          {/* Trust badges */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              لماذا نحن؟
            </h4>
            <div className="space-y-3">
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs text-center sm:text-start">
            © {year} {isRTL ? t("navbar.platformName") : t("navbar.platformNameEn")} — {t("footer.allRightsReserved")}
          </p>

          <div className="flex items-center gap-4">
            <Link to="/terms"   className="text-gray-500 hover:text-gray-300 text-xs transition-colors">{t("footer.termsOfService")}</Link>
            <span className="text-gray-700">·</span>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">{t("footer.privacyPolicy")}</Link>
          </div>
        </div>
      </div>

      {/* ── Scroll-to-top ── */}
      <button
        onClick={scrollToTop}
        className="hidden lg:flex fixed bottom-6 left-6 z-40 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="العودة للأعلى"
        title="العودة للأعلى"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </footer>
  );
};
