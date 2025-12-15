import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowRight } from 'lucide-react';

import { Button } from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('notFound.title')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('notFound.description')}
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full" leftIcon={<Home className="w-5 h-5" />}>
              {t('notFound.backHome')}
            </Button>
          </Link>
          
          <Link to="/services">
            <Button 
              variant="outline" 
              className="w-full" 
              leftIcon={<ArrowRight className="w-5 h-5" />}
            >
              {t('notFound.browseServices')}
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            {t('notFound.errorMessage')}{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-500">
              {t('notFound.contactUs')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;