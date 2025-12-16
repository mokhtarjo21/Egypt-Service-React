import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  Briefcase,
  Plus,
  Shield,
} from "lucide-react";

import { RootState } from "../../store/store";
import { logoutUser } from "../../store/slices/authSlice";
import { setMobileMenuOpen } from "../../store/slices/uiSlice";
import { Button } from "../ui/Button";
import { LanguageToggle } from "../ui/LanguageToggle";
import { useDirection } from "../../hooks/useDirection";
import logo from "../../assets/logo.jpeg";
export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { mobileMenuOpen } = useSelector((state: RootState) => state.ui);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
  }, [navigate, dispatch]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const toggleMobileMenu = () => {
    dispatch(setMobileMenuOpen(!mobileMenuOpen));
  };

  const navigationItems = [
    { href: "/", label: t("navigation.home"), icon: Home },
    { href: "/services", label: t("navigation.services"), icon: Briefcase },
    { href: "/categories", label: t("navigation.categories"), icon: Briefcase },
    { href: "/about", label: t("navigation.about"), icon: null },
    { href: "/contact", label: t("navigation.contact"), icon: null },
  ];

  const userMenuItems = isAuthenticated
    ? [
        { href: "/dashboard", label: t("navigation.dashboard"), icon: Home },
        { href: "/profile", label: t("navigation.profile"), icon: User },
        { href: "/add-service", label: t("navbar.addService"), icon: Plus },
        { href: "/messages", label: t("navigation.messages"), icon: null },
        {
          href: "/notifications",
          label: t("navigation.notifications"),
          icon: Bell,
        },
        { href: "/settings", label: t("navigation.settings"), icon: Settings },
        ...(user?.role === "admin"
          ? [{ href: "/admin", label: t("navbar.adminPanel"), icon: Shield }]
          : []),
      ]
    : [];

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link
              to="/"
              className="flex items-center gap-2 pl-4"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-fill"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  {isRTL
                    ? t("navbar.platformName")
                    : t("navbar.platformNameEn")}
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 p-4 md:pl-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
                />
                <input
                  type="text"
                  placeholder={t("hero.searchPlaceholder")}
                  className={`w-full ${isRTL ? "pr-8" : "pl-10 pr-4"} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  onClick={() => setShowSearchModal(true)}
                  readOnly
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button (Mobile) */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSearchModal(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Language Toggle */}
              <LanguageToggle />

              {/* Notifications (Authenticated) */}
              {isAuthenticated && (
                <Link to="/notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              {/* User Menu or Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden md:block font-medium text-gray-900">
                      {user?.full_name}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div
                      className={`absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${isRTL ? "left-0" : "right-0"}`}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">
                          {user?.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.phone_number}
                        </p>
                        {user?.is_verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            {t("navbar.verifiedAccount")}
                          </span>
                        )}
                      </div>

                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            {Icon && (
                              <Icon
                                className={`w-4 h-4 ${isRTL ? "ml-3" : "mr-3"}`}
                              />
                            )}
                            {item.label}
                          </Link>
                        );
                      })}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut
                            className={`w-4 h-4 ${isRTL ? "ml-3" : "mr-3"}`}
                          />
                          {t("navigation.logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      {t("navigation.login")}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">{t("navigation.register")}</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={toggleMobileMenu}
                aria-label={t("navigation.menu")}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => dispatch(setMobileMenuOpen(false))}
          />

          {/* Sidebar */}
          <div
            className={`fixed h-full w-80 bg-white shadow-xl transform transition-transform`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-fill"
                  />
                </div>
                <span className="font-bold text-gray-900">
                  {isRTL
                    ? t("navbar.platformName")
                    : t("navbar.platformNameEn")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setMobileMenuOpen(false))}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.phone_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 px-6 py-6">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                    >
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 ${isRTL ? "ml-3" : "mr-3"}`}
                        />
                      )}
                      {item.label}
                    </Link>
                  );
                })}

                {/* User Menu Items (Mobile) */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={() => dispatch(setMobileMenuOpen(false))}
                        >
                          {Icon && (
                            <Icon
                              className={`w-5 h-5 ${isRTL ? "ml-3" : "mr-3"}`}
                            />
                          )}
                          {item.label}
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-3">
                <LanguageToggle />

                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    {t("navigation.logout")}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                    >
                      <Button variant="outline" className="w-full">
                        {t("navigation.login")}
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => dispatch(setMobileMenuOpen(false))}
                    >
                      <Button className="w-full">
                        {t("navigation.register")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center p-4 pt-16">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowSearchModal(false)}
            />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Search
                    className={`w-6 h-6 text-gray-400 ${isRTL ? "order-last" : ""}`}
                  />
                  <input
                    type="text"
                    placeholder={t("hero.searchPlaceholder")}
                    className="flex-1 text-lg border-none outline-none"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearchModal(false)}
                    className={isRTL ? "order-first" : ""}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t("navbar.startTyping")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
