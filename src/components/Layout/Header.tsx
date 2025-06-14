import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { currentUser,logout,refresh} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
  },[currentUser]);
  refresh();

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

          <nav className="hidden md:flex items-center space-x-reverse space-x-6">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}
            >
              الرئيسية
            </Link>
            <Link 
              to="/services" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/services')}`}
            >
              الخدمات
            </Link>
            {currentUser && (
              <>
                <Link 
                  to="/add-service" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/add-service')}`}
                >
                  أضف خدمة
                </Link>
                <Link 
                  to="/profile" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/profile')}`}
                >
                  حسابي
                </Link>
                {currentUser.isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')}`}
                  >
                    <Settings className="inline w-4 h-4 ml-1" />
                    لوحة الإدارة
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-reverse space-x-4">
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