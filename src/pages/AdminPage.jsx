import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { UserManagement } from '../components/admin/UserManagement';
import { ActivityReview } from '../components/admin/ActivityReview';
import { ProductManagement } from '../components/admin/ProductManagement';
import { ExchangeManagement } from '../components/admin/ExchangeManagement';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

export default function AdminPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{t('admin.title')}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">{t('admin.tabs.dashboard')}</TabsTrigger>
          <TabsTrigger value="users">{t('admin.tabs.users')}</TabsTrigger>
          <TabsTrigger value="activities">{t('admin.tabs.activities')}</TabsTrigger>
          <TabsTrigger value="products">{t('admin.tabs.products')}</TabsTrigger>
          <TabsTrigger value="exchanges">{t('admin.tabs.exchanges')}</TabsTrigger>
          {/* Add more admin tabs here */}
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboard.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t('admin.dashboard.description')}</p>
              {/* Admin dashboard content goes here */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <Card className="p-4">
                  <h3 className="font-semibold">{t('admin.dashboard.totalUsers')}</h3>
                  <p className="text-2xl font-bold">1,234</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold">{t('admin.dashboard.pendingActivities')}</h3>
                  <p className="text-2xl font-bold">56</p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold">{t('admin.dashboard.pendingExchanges')}</h3>
                  <p className="text-2xl font-bold">12</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
        <TabsContent value="activities" className="mt-6">
          <ActivityReview />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductManagement />
        </TabsContent>
        <TabsContent value="exchanges" className="mt-6">
          <ExchangeManagement />
        </TabsContent>
        {/* Add more admin tab contents here */}
      </Tabs>
    </div>
  );
}

