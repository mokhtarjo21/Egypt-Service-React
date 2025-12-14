import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { RootState } from './store/store';
import { fetchUserProfile } from './store/slices/authSlice';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';
import { useDirection } from './hooks/useDirection';
import { authService } from './services/django';

const App: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, language } = useDirection();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const { session } = await authService.getSession();
      if (session) {
        dispatch(fetchUserProfile() as any);
      }
    };

    initAuth();

    const authStateListener = authService.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(fetchUserProfile() as any);
      }
    });

    return () => {
      if (authStateListener?.data?.subscription) {
        authStateListener.data.subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Helmet>
        <html lang={language} dir={isRTL ? 'rtl' : 'ltr'} />
        <title>{t('navigation.home')} - منصة الخدمات المصرية</title>
        <meta name="description" content="منصة الخدمات المصرية الموثوقة - ابحث عن أفضل مقدمي الخدمات في جميع أنحاء مصر" />
        <meta name="keywords" content="خدمات مصر، منصة خدمات، مقدمي خدمات، Egypt services" />
        <meta property="og:title" content="منصة الخدمات المصرية" />
        <meta property="og:description" content="ابحث عن أفضل مقدمي الخدمات الموثوقين في جميع أنحاء مصر" />
        <meta property="og:type" content="website" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;