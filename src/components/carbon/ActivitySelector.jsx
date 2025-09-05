import React, { useState, useEffect } from 'react';
import { Search, Filter, Leaf, Car, ShoppingBag, Recycle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { carbonAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const categoryIcons = {
  daily: Leaf,
  transport: Car,
  consumption: ShoppingBag,
  environmental: Recycle,
  lifestyle: Leaf,
  energy: Leaf,
  water: Leaf,
  waste: Recycle,
  travel: Car
};

export function ActivitySelector({ onActivitySelect, selectedActivity }) {
  const { t, currentLanguage } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取活动列表
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await carbonAPI.getActivities();
        
        if (response?.data?.success) {
          const payload = response?.data?.data;
          // 后端返回 { data: { activities: [], categories: [], total: number } }
          const activitiesData = Array.isArray(payload?.activities)
            ? payload.activities
            : Array.isArray(payload)
              ? payload
              : [];

          setActivities(activitiesData);
          setFilteredActivities(activitiesData);

          // 提取分类（优先使用后端 categories，否则从活动推导）
          const uniqueCategories = Array.isArray(payload?.categories)
            ? payload.categories
            : [...new Set(activitiesData.map((activity) => activity.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } else {
          setError(response?.data?.message || t('errors.loadFailed'));
        }
      } catch (err) {
        setError(err.message || t('errors.network'));
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [t]);

  // 筛选活动
  useEffect(() => {
    let filtered = activities;

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // 按搜索词筛选（字段容错处理）
    if (searchTerm) {
      const q = (searchTerm || '').toString().toLowerCase();
      const lower = (v) => (v ?? '').toString().toLowerCase();
      filtered = filtered.filter((activity) =>
        lower(activity.name_zh).includes(q) ||
        lower(activity.name_en).includes(q) ||
        lower(activity.description_zh).includes(q) ||
        lower(activity.description_en).includes(q)
      );
    }

    setFilteredActivities(filtered);
  }, [activities, selectedCategory, searchTerm]);

  const handleActivitySelect = (activity) => {
    onActivitySelect(activity);
  };

  const getCategoryName = (category) => {
    return t(`activities.categories.${category}`) || category;
  };

  const getActivityName = (activity) => {
    const isEn = (currentLanguage || '').toLowerCase().startsWith('en');
    return isEn
      ? (activity.name_en || activity.name_zh || activity.name)
      : (activity.name_zh || activity.name_en || activity.name);
  };

  const getActivityDescription = (activity) => {
    const isEn = (currentLanguage || '').toLowerCase().startsWith('en');
    return isEn
      ? (activity.description_en || activity.description_zh || activity.description)
      : (activity.description_zh || activity.description_en || activity.description);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('activities.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">{t('activities.categories.all')}</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryName(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((activity) => {
          const IconComponent = categoryIcons[activity.category] || Leaf;
          const selectedId = selectedActivity?.id || selectedActivity?.uuid;
          const activityId = activity.id || activity.uuid;
          const isSelected = selectedId && activityId && selectedId === activityId;
          
          return (
            <Card
              key={activityId}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleActivitySelect(activity)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-green-200' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-5 w-5 ${
                      isSelected ? 'text-green-700' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {getActivityName(activity)}
                    </CardTitle>
                    <div className="text-xs text-gray-500 mt-1">
                      {getCategoryName(activity.category)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-sm text-gray-600 mb-3">
                  {getActivityDescription(activity)}
                </CardDescription>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="text-gray-500">
                    {t('activities.unit')}: {t(`units.${activity.unit}`, activity.unit)}
                  </div>
                  <div className="text-green-600 font-medium">
                    {activity.carbon_factor} {t('activities.carbonFactor')}
                  </div>
                </div>
                
                {activity.points_per_unit && (
                  <div className="mt-2 text-xs text-blue-600">
                    {activity.points_per_unit} {t('activities.pointsPerUnit')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600">{t('activities.noActivitiesFound')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('activities.tryDifferentSearch')}
          </p>
        </div>
      )}
    </div>
  );
}

