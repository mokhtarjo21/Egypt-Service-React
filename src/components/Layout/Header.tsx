import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            منصة الخدمات المصرية
          </Link>

          {/* زر القائمة للموبايل */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* قائمة روابط */}
          <nav
            className={`${
              menuOpen ? 'block' : 'hidden'
            } absolute top-16 right-0 w-full z-50 bg-blue-600 text-white md:static md:flex md:items-center md:space-x-reverse md:space-x-6`}
          >
            <Link
              to="/"
              className={`block px-4 py-2 md:px-3 md:py-2 text-sm font-medium transition-colors ${isActive('/')}`}
              onClick={() => setMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link
              to="/services"
              className={`block px-4 py-2 md:px-3 md:py-2 text-sm font-medium transition-colors ${isActive('/services')}`}
              onClick={() => setMenuOpen(false)}
            >
              الخدمات
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/add-service"
                  className={`block px-4 py-2 md:px-3 md:py-2 text-sm font-medium transition-colors ${isActive('/add-service')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  أضف خدمة
                </Link>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 md:px-3 md:py-2 text-sm font-medium transition-colors ${isActive('/profile')}`}
                  onClick={() => setMenuOpen(false)}
                >
                  حسابي
                </Link>
                {currentUser.isAdmin && (
                  <Link
                    to="/admin"
                    className={`block px-4 py-2 md:px-3 md:py-2 text-sm font-medium transition-colors ${isActive('/admin')}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="inline w-4 h-4 ml-1" />
                    لوحة الإدارة
                  </Link>
                )}
              </>
            )}
            <div className="block md:hidden border-t border-white my-2"></div>
            {/* روابط تسجيل الدخول/الخروج للموبايل */}
            <div className="md:hidden px-4 pb-4">
              {currentUser ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block text-center bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    دخول
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md text-sm transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    تسجيل
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* روابط تسجيل الدخول/الخروج للديسكتوب */}
          <div className="hidden md:flex items-center space-x-reverse space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-reverse space-x-4">
                <div className="flex items-center space-x-reverse space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{currentUser.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-reverse space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-reverse space-x-2">
                <Link
                  to="/login"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm transition-colors"
                >
                  دخول
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md text-sm transition-colors"
                >
                  تسجيل
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
