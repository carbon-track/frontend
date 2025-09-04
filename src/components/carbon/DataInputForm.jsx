import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calculator, Calendar, FileText, Upload, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import FileUpload from '../FileUpload';

export function DataInputForm({ 
  activity, 
  onCalculate, 
  onSubmit, 
  calculationResult, 
  isCalculating, 
  isSubmitting 
}) {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCalculation, setShowCalculation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      activity_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const watchedData = watch('data');

  // 当输入数据变化时自动计算
  useEffect(() => {
    if (activity && watchedData && parseFloat(watchedData) > 0) {
      const numericData = parseFloat(watchedData);
      if (!isNaN(numericData)) {
        onCalculate(numericData);
        setShowCalculation(true);
      }
    } else {
      setShowCalculation(false);
    }
  }, [activity, watchedData, onCalculate]);

  const onFormSubmit = (data) => {
    const formData = {
      activity_id: activity.id || activity.uuid,
      data: parseFloat(data.data),
      activity_date: data.activity_date,
      notes: data.notes,
      uploaded_files: uploadedFiles
    };
    
    onSubmit(formData);
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  if (!activity) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('activities.selectActivityFirst')}</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityName = (activity) => {
    return activity.name_zh || activity.name_en || activity.name;
  };

  const getActivityDescription = (activity) => {
    return activity.description_zh || activity.description_en || activity.description;
  };

  return (
    <div className="space-y-6">
      {/* 选中的活动信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            {getActivityName(activity)}
          </CardTitle>
          <CardDescription>
            {getActivityDescription(activity)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t('activities.category')}:</span>
              <div className="font-medium">
                {t(`activities.categories.${activity.category}`)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">{t('activities.unit')}:</span>
              <div className="font-medium">{activity.unit}</div>
            </div>
            <div>
              <span className="text-gray-500">{t('activities.carbonFactor')}:</span>
              <div className="font-medium text-green-600">
                {activity.carbon_factor}
              </div>
            </div>
            {activity.points_per_unit && (
              <div>
                <span className="text-gray-500">{t('activities.pointsPerUnit')}:</span>
                <div className="font-medium text-blue-600">
                  {activity.points_per_unit}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 数据输入表单 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('activities.form.dataInput')}</CardTitle>
          <CardDescription>
            {t('activities.form.inputDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* 数据输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('activities.form.dataValue')} ({activity.unit})
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('activities.form.dataPlaceholder')}
                error={errors.data}
                {...register('data', {
                  required: t('activities.form.dataRequired'),
                  min: { value: 0.01, message: t('activities.form.dataMinimum') }
                })}
              />
              {errors.data && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.data.message}
                </p>
              )}
            </div>

            {/* 活动日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {t('activities.form.activityDate')}
              </label>
              <Input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                error={errors.activity_date}
                {...register('activity_date', {
                  required: t('activities.form.dateRequired')
                })}
              />
              {errors.activity_date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.activity_date.message}
                </p>
              )}
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                {t('activities.form.notes')}
              </label>
              <textarea
                rows={3}
                placeholder={t('activities.form.notesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                {...register('notes')}
              />
            </div>

            {/* 文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                {t('activities.form.uploadImage')}
              </label>
              <FileUpload
                accept="image/*"
                maxFiles={3}
                maxSize={5 * 1024 * 1024}
                onUpload={handleFileUpload}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('activities.form.uploadHint')}
              </p>
            </div>

            {/* 计算结果 */}
            {showCalculation && calculationResult && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                      {t('activities.form.calculationResult')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {calculationResult.carbon_saved?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t('activities.carbonSaved')} (kg CO₂)
                        </div>
                      </div>
                      
                      {calculationResult.points_earned && (
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {calculationResult.points_earned}
                          </div>
                          <div className="text-sm text-gray-600">
                            {t('activities.form.expectedPoints')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                loading={isSubmitting}
                disabled={isSubmitting || !showCalculation}
              >
                {isSubmitting ? t('activities.form.submitting') : t('activities.form.submit')}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t('common.reset')}
              </Button>
            </div>

            {/* 提示信息 */}
            <Alert variant="info">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('activities.form.submitHint')}
              </AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

