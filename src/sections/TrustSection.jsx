import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Shield, Award, Users } from 'lucide-react';

export default function TrustSection(){
  const { t } = useTranslation();
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Shield className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('home.trust.secure')}</h3>
            <p className="text-gray-600">{t('home.trust.secureDescription')}</p>
          </div>
          <div className="flex flex-col items-center">
            <Award className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('home.trust.verified')}</h3>
            <p className="text-gray-600">{t('home.trust.verifiedDescription')}</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('home.trust.community')}</h3>
            <p className="text-gray-600">{t('home.trust.communityDescription')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
