import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { RootState } from './store/store';
import { fetchUserProfile } from './store/slices/authSlice';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import AppRoutes from './routes/AppRoutes';
import { useDirection } from './hooks/useDirection';
import { authService } from './services/django';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, language } = useDirection();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <Helmet>
          <html lang={language} dir={isRTL ? 'rtl' : 'ltr'} />
          <title>{t('navigation.home')} - {t('meta.title')}</title>
          <meta name="description" content={t('meta.description')} />
          <meta name="keywords" content={t('meta.keywords')} />
          <meta property="og:title" content={t('meta.ogTitle')} />
          <meta property="og:description" content={t('meta.ogDescription')} />
          <meta property="og:type" content="website" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#3B82F6" />
        </Helmet>
        
        <div className="min-h-screen flex flex-col bg-transparent">
          <Navbar />
          <main className="flex-1 pb-16 lg:pb-0">
            <AppRoutes />
          </main>
          <Footer />
          <MobileBottomNav />
        </div>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;