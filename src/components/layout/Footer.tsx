import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useDirection } from "../../hooks/useDirection";
import logo from "../../assets/logo.jpeg";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://facebook.com",
      label: "Facebook",
      external: true,
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: "Twitter",
      external: true,
    },
    {
      icon: Instagram,
      href: "https://instagram.com",
      label: "Instagram",
      external: true,
    },
    {
      icon: Youtube,
      href: "https://youtube.com",
      label: "YouTube",
      external: true,
    },
  ];

  const quickLinks = [
    { href: "/", label: t("navigation.home") },
    { href: "/services", label: t("navigation.services") },
    { href: "/about", label: t("navigation.about") },
    { href: "/contact", label: t("navigation.contact") },
  ];

  const supportLinks = [
    { href: "/help", label: t("footer.helpCenter") },
    { href: "/contact", label: t("footer.contactUs") },
    { href: "/terms", label: t("footer.termsOfService") },
    { href: "/privacy", label: t("footer.privacyPolicy") },
  ];

  // دالة للتمرير لأعلى عند تغيير الصفحة
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Link
                to="/"
                className="flex items-center gap-3 hover:text-primary-500 transition-colors duration-200"
                onClick={scrollToTop}
              >
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center overflow-hidden hover:brightness-110 transition-all duration-200">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-fill"
                  />
                </div>
                <h2 className="text-xl font-bold">
                  {isRTL
                    ? t("navbar.platformName")
                    : t("navbar.platformNameEn")}
                </h2>
              </Link>
            </div>

            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              {t("footer.description")}
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                if (social.external) {
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 hover:text-white transition-colors duration-200" />
                    </a>
                  );
                }
                return (
                  <Link
                    key={social.label}
                    to={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 hover:text-white transition-colors duration-200" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-500 transition-colors duration-200"
                    onClick={scrollToTop}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.support")}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-primary-500 transition-colors duration-200"
                    onClick={scrollToTop}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 sm:mb-0">
              © {currentYear} {t("footer.allRightsReserved")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
