import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from '../../hooks/useTranslation';
import { formatNumber, formatDateSafe } from '../../lib/utils';
import { adminAPI } from '../../lib/api';
import { Loader2, CheckCircle, XCircle, Eye, Search, Filter, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertTitle, AlertDescription } from '../ui/Alert';
import { Pagination } from '../ui/Pagination';
import { ActivityDetailModal } from '../activities/ActivityDetailModal';
import { toast } from 'react-hot-toast';
// merged into utils import above

export function ActivityReview() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending', // Default to pending activities
    page: 1,
    limit: 10,
    sort: 'created_at_asc' // Oldest first for review
  });
  const [selectedActivity, setSelectedActivity] = useState(null);

  const { data, isLoading, error, isFetching } = useQuery(
    ['adminActivities', filters],
    () => adminAPI.getActivities(filters),
    { keepPreviousData: true }
  );

  const reviewActivityMutation = useMutation(
    ({ id, status, admin_notes }) => adminAPI.reviewActivity(id, { status, admin_notes }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminActivities');
        queryClient.invalidateQueries('activities'); // Invalidate user's activities as well
        toast.success(t('admin.activities.reviewSuccess'));
        setSelectedActivity(null);
      },
      onError: (err) => {
        toast.error(t('admin.activities.reviewFailed'));
        console.error('Activity review failed:', err);
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
  };

  const handleApprove = (activityId) => {
    if (window.confirm(t('admin.activities.confirmApprove')))
    reviewActivityMutation.mutate({ id: activityId, status: 'approved' });
  };

  const handleReject = (activityId) => {
    const reason = prompt(t('admin.activities.promptRejectionReason'));
    if (reason) {
      reviewActivityMutation.mutate({ id: activityId, status: 'rejected', admin_notes: reason });
    }
  };

  const activities = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('admin.activities.title')}</h2>
      <p className="text-muted-foreground">{t('admin.activities.description')}</p>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={t('admin.activities.searchPlaceholder')}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.activities.status')}</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">{t('common.all')}</option>
              <option value="pending">{t('activities.status.pending')}</option>
              <option value="approved">{t('activities.status.approved')}</option>
              <option value="rejected">{t('activities.status.rejected')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.sort.sortBy')}</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="created_at_asc">{t('common.sort.oldest')}</option>
              <option value="created_at_desc">{t('common.sort.newest')}</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{t('errors.loadFailed')}</AlertDescription>
        </Alert>
      ) : activities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold">{t('admin.activities.noActivitiesFound')}</h3>
          <p className="text-muted-foreground mt-2">{t('admin.activities.tryDifferentFilters')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.user')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.activity')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.data')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.carbonSaved')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.points')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.activities.table.date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.user_username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.activity_name}</div>
                      <div className="text-sm text-gray-500">{t(`activities.categories.${activity.activity_category}`, activity.activity_category)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(activity.data_value)} {t(`units.${activity.activity_unit}`, activity.activity_unit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(activity.carbon_saved)} kg CO2e</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">+{formatNumber(activity.points_earned)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.status === 'pending' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="h-3 w-3 mr-1" /> {t('activities.status.pending')}
                        </span>
                      )}
                      {activity.status === 'approved' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" /> {t('activities.status.approved')}
                        </span>
                      )}
                      {activity.status === 'rejected' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" /> {t('activities.status.rejected')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateSafe(activity.created_at, 'yyyy-MM-dd')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(activity)} className="mr-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {activity.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(activity.id)} className="mr-2 text-green-600 hover:text-green-800">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReject(activity.id)} className="text-red-600 hover:text-red-800">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.per_page}
            totalItems={pagination.total_items}
          />
        </>
      )}

      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}

