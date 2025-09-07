import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Calculator, Award, Users, TrendingUp, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { checkAuthStatus } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

export default function HomePage() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Leaf className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('home.hero.goToDashboard')}
                  </Button>
                </Link>
                <Link to="/calculate">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t('home.hero.recordActivity')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('home.hero.getStarted')}
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t('home.hero.signIn')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
              <div className="text-gray-600">{t('home.stats.users')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">{t('home.stats.activities')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1,000t</div>
              <div className="text-gray-600">{t('home.stats.carbonSaved')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">200+</div>
              <div className="text-gray-600">{t('home.stats.rewards')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Calculator className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>{t('home.features.calculate.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  {t('home.features.calculate.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>{t('home.features.rewards.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  {t('home.features.rewards.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>{t('home.features.tracking.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  {t('home.features.tracking.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>{t('home.features.community.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">
                  {t('home.features.community.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-gray-600">{t('home.howItWorks.step1.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-gray-600">{t('home.howItWorks.step2.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-gray-600">{t('home.howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {t('home.cta.subtitle')}
          </p>
          
          {!isAuthenticated && (
            <Link to="/auth/register">
              <Button size="lg" variant="secondary">
                {t('home.cta.joinNow')}
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Trust Section */}
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
    </div>
  );
}
