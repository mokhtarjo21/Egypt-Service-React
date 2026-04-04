import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Menu, X, Search, Bell, User, Settings, LogOut,
  Home, Briefcase, Plus, Shield, ChevronDown, MessageSquare,
  BookOpen, Layers, Info, Phone,
} from "lucide-react";

import { RootState, AppDispatch } from "../../store/store";
import { logoutUser } from "../../store/slices/authSlice";
import { setMobileMenuOpen } from "../../store/slices/uiSlice";
import { LanguageToggle } from "../ui/LanguageToggle";
import { useDirection } from "../../hooks/useDirection";
import logo from "../../assets/logo.jpeg";

/* ── Active nav link ─────────────────────── */
const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({
  to, children, onClick,
}) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors duration-200 pb-0.5 group ${
        active ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
      }`}
    >
      {children}
      <span className={`absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 origin-left ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`} />
    </Link>
  );
};

/* ── Mobile nav item ─────────────────────── */
const MobileNavItem: React.FC<{
  to: string; label: string; icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void; accent?: string;
}> = ({ to, label, icon: Icon, onClick, accent }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active
          ? `${accent || "bg-blue-50 text-blue-700"}`
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {Icon && <Icon className={`w-4 h-4 shrink-0 ${active ? "text-blue-600" : "text-gray-400"}`} />}
      {label}
    </Link>
  );
};

/* ════════════════════════════════════════ */
export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { mobileMenuOpen } = useSelector((s: RootState) => s.ui);

  const [showUserMenu, setShowUserMenu]     = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [scrolled, setScrolled]             = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── close mobile on route change ── */
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    setShowUserMenu(false);
  }, [location.pathname, dispatch]);

  /* ── close user menu on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── focus search input ── */
  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 80);
  }, [showSearch]);

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowSearch(false); dispatch(setMobileMenuOpen(false)); }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setShowSearch(v => !v); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch]);

  const handleLogout = async () => {
    try { await dispatch(logoutUser()).unwrap(); } catch {}
    navigate("/");
  };

  const u = user as any;
  const isAdmin = u?.role === "admin" || u?.user_type === "admin";
  const avatarUrl = u?.avatar?.startsWith("http") ? u.avatar : u?.avatar ? `http://localhost:8000${u.avatar}` : null;
  const initials  = (u?.full_name || "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const navLinks = [
    { to: "/",          label: t("navigation.home"),       icon: Home },
    { to: "/services",  label: t("navigation.services"),   icon: Briefcase },
    { to: "/categories",label: t("navigation.categories"), icon: Layers },
    { to: "/about",     label: t("navigation.about"),      icon: Info },
    { to: "/contact",   label: t("navigation.contact"),    icon: Phone },
  ];

  const userLinks = [
    { to: "/dashboard", label: t("navigation.dashboard"), icon: Home },
    { to: "/bookings",  label: t("navigation.bookings"),  icon: BookOpen },
    { to: "/profile",   label: t("navigation.profile"),   icon: User },
    { to: "/messages",  label: t("navigation.messages"),  icon: MessageSquare },
    { to: "/add-service", label: t("navbar.addService"),  icon: Plus },
    { to: "/settings",  label: t("navigation.settings"),  icon: Settings },
    ...(isAdmin ? [{ to: "/admin", label: t("navbar.adminPanel"), icon: Shield }] : []),
  ];

  /* ════════════ RENDER ════════════ */
  return (
    <>
      {/* ════ MAIN NAVBAR ════ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-100"
            : "bg-white border-b border-gray-100"
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="hidden sm:block font-bold text-gray-900 text-base leading-tight">
                {isRTL ? t("navbar.platformName") : t("navbar.platformNameEn")}
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-6 mx-6">
              {navLinks.map(({ to, label }) => (
                <NavLink key={to} to={to}>{label}</NavLink>
              ))}
            </nav>

            {/* ── Desktop Search ── */}
            <div className="hidden lg:flex flex-1 max-w-xs mx-4">
              <button
                onClick={() => setShowSearch(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-500 transition-colors"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-start">{t("hero.searchPlaceholder")}</span>
                <kbd className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono opacity-70">⌘K</kbd>
              </button>
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1.5">

              {/* search (mobile) */}
              <button
                onClick={() => setShowSearch(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* language */}
              <LanguageToggle />

              {isAuthenticated ? (
                <>
                  {/* notifications */}
                  <Link
                    to="/notifications"
                    className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Bell className="w-5 h-5" />
                  </Link>

                  {/* user menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(v => !v)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={u?.full_name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {initials}
                        </div>
                      )}
                      <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[100px] truncate">
                        {u?.full_name}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
                    </button>

                    {/* dropdown */}
                    {showUserMenu && (
                      <div className={`absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 ${isRTL ? "left-0" : "right-0"}`}>
                        {/* header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img src={avatarUrl} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-sm">{u?.full_name}</p>
                              <p className="text-xs text-gray-500 truncate">{u?.phone_number || u?.email}</p>
                              {u?.status === "verified" && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mt-0.5">
                                  ✓ {t("navbar.verifiedAccount")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* links */}
                        <div className="py-1">
                          {userLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                to === "/admin"
                                  ? "text-purple-700 hover:bg-purple-50"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
                              {label}
                            </Link>
                          ))}
                        </div>

                        {/* logout */}
                        <div className="border-t border-gray-100 pt-1 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            {t("navigation.logout")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {t("navigation.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm"
                  >
                    {t("navigation.register")}
                  </Link>
                </div>
              )}

              {/* hamburger – hidden on mobile, visible on tablet (md–lg) where bottom nav is not enough) */}
              <button
                className="hidden md:flex lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
                aria-label="menu"
              >
                <div className="relative w-5 h-5">
                  <Menu className={`absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`} />
                  <X    className={`absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ════ MOBILE DRAWER ════ */}
      {/* backdrop */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={() => dispatch(setMobileMenuOpen(false))}
      />

      {/* drawer panel */}
      <div
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} h-full w-[300px] bg-white z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        {/* drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={() => dispatch(setMobileMenuOpen(false))}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {isRTL ? t("navbar.platformName") : t("navbar.platformNameEn")}
            </span>
          </Link>
          <button
            onClick={() => dispatch(setMobileMenuOpen(false))}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* user card */}
        {isAuthenticated && u && (
          <div className="mx-4 mt-4 mb-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{u.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{u.phone_number || u.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2 mt-1">القائمة الرئيسية</p>
          {navLinks.map(({ to, label, icon }) => (
            <MobileNavItem
              key={to} to={to} label={label} icon={icon}
              onClick={() => dispatch(setMobileMenuOpen(false))}
            />
          ))}

          {isAuthenticated && (
            <>
              <div className="border-t border-gray-100 my-3" />
              <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">حسابي</p>
              {userLinks.map(({ to, label, icon }) => (
                <MobileNavItem
                  key={to} to={to} label={label} icon={icon}
                  accent={to === "/admin" ? "bg-purple-50 text-purple-700" : undefined}
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                />
              ))}
            </>
          )}
        </nav>

        {/* bottom actions */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <LanguageToggle />
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t("navigation.logout")}
              </button>
            )}
          </div>
          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="text-center text-sm font-medium border border-gray-300 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
              >
                {t("navigation.login")}
              </Link>
              <Link
                to="/register"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="text-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors"
              >
                {t("navigation.register")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ════ SEARCH SPOTLIGHT ════ */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${showSearch ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={() => setShowSearch(false)}
      >
        <div className="flex items-start justify-center pt-[15vh] px-4">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t("hero.searchPlaceholder")}
                className="flex-1 text-base outline-none text-gray-900 placeholder-gray-400"
                onKeyDown={e => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
                    setShowSearch(false);
                    setSearchQuery("");
                  }
                }}
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* quick links */}
            {!searchQuery && (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase">روابط سريعة</p>
                <div className="space-y-1">
                  {navLinks.slice(1).map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700"
                    >
                      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchQuery && (
              <div className="px-5 py-4 text-center text-sm text-gray-500">
                اضغط <kbd className="bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-xs">Enter</kbd> للبحث عن «{searchQuery}»
              </div>
            )}
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
              <span><kbd className="bg-white border border-gray-200 rounded px-1 font-mono">↵</kbd> للبحث</span>
              <span><kbd className="bg-white border border-gray-200 rounded px-1 font-mono">Esc</kbd> للإغلاق</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
