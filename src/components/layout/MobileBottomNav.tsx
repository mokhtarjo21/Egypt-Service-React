import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Home,
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  User,
  Layers,
  Phone,
  LogIn,
} from "lucide-react";
import { RootState } from "../../store/store";

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const guestItems: NavItem[] = [
    { to: "/",           labelKey: "navigation.home",       icon: Home },
    { to: "/services",   labelKey: "navigation.services",   icon: Briefcase },
    { to: "/categories", labelKey: "navigation.categories", icon: Layers },
    { to: "/contact",    labelKey: "navigation.contact",    icon: Phone },
    { to: "/login",      labelKey: "navigation.login",      icon: LogIn },
  ];

  const authItems: NavItem[] = [
    { to: "/",          labelKey: "navigation.home",      icon: Home },
    { to: "/services",  labelKey: "navigation.services",  icon: Briefcase },
    { to: "/dashboard", labelKey: "navigation.dashboard", icon: LayoutDashboard },
    { to: "/messages",  labelKey: "navigation.messages",  icon: MessageSquare },
    { to: "/profile",   labelKey: "navigation.profile",   icon: User },
  ];

  const items = isAuthenticated ? authItems : guestItems;

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-50
        lg:hidden
        bg-white/95 backdrop-blur-xl
        border-t border-gray-200/80
        safe-bottom
      "
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch h-[60px]">
        {items.map(({ to, labelKey, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`
                relative flex flex-col items-center justify-center flex-1 gap-0.5
                transition-all duration-200 select-none
                ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}
              `}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-8 rounded-xl bg-blue-50 -z-10" />
              )}

              <Icon
                className={`
                  w-[22px] h-[22px] transition-transform duration-200
                  ${active ? "scale-110" : "scale-100"}
                `}
              />
              <span
                className={`
                  text-[10px] font-medium leading-none transition-all duration-200
                  ${active ? "opacity-100" : "opacity-70"}
                `}
              >
                {t(labelKey)}
              </span>

              {/* Active dot indicator */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
