import React, { useState, useEffect, useRef } from 'react';
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
  isSubmitting 
}) {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showCalculation, setShowCalculation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      activity_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const watchedData = watch('data');

  // 避免在开发模式 StrictMode 下的双调用，以及快速输入引发的请求风暴：
  // - 使用 debounce（300ms）
  // - 使用 lastCalcKeyRef 记录上次计算的 key（activityId+data），相同时不重复调用
  const lastCalcKeyRef = useRef('');
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    const activityId = activity?.id || activity?.uuid || '';
    const val = watchedData;

    // 清理上一次的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // 输入为空或非正数时隐藏计算结果
    const parsed = parseFloat(val);
    if (!activityId || !val || isNaN(parsed) || parsed <= 0) {
      setShowCalculation(false);
      return;
    }

    // 设置防抖
    debounceTimerRef.current = setTimeout(() => {
      const key = `${activityId}::${parsed}`;
      if (lastCalcKeyRef.current === key) {
        // 与上次相同参数，避免重复调用
        setShowCalculation(true);
        return;
      }
      lastCalcKeyRef.current = key;
      onCalculate(parsed);
      setShowCalculation(true);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
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

  // 处理文件组件上传成功后的回调（方案B：预上传，拿URL再提交）
  const handleUploadSuccess = (result) => {
    try {
      // 兼容多文件与单文件两种返回结构
      // 多文件：{ success, message, data: { results: [{ public_url, file_path, ... }], ... } }
      // 单文件：{ success, message, data: { public_url, file_path, ... } }
      // 也兼容直接返回 data 层被透传的情况
      let urls = [];

      if (result?.data?.results && Array.isArray(result.data.results)) {
        urls = result.data.results
          .map(r => r.public_url || (r.file_path ? `/${r.file_path}` : null))
          .filter(Boolean);
      } else if (result?.data?.public_url) {
        urls = [result.data.public_url];
      } else if (result?.public_url) {
        urls = [result.public_url];
      } else if (result?.data?.file_path) {
        urls = [`/${result.data.file_path}`];
      }

      setUploadedFiles(urls);
    } catch (e) {
      // 静默回退，不影响主流程
      console.warn('Handle upload success parse failed:', e);
    }
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

  const calculationCard = (showCalculation && calculationResult) ? (
    <Card className="bg-green-50 border-green-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-green-800">
          {t('activities.form.calculationResult')}
        </CardTitle>
        <CardDescription className="text-xs">
          {t('activities.form.previewAutoUpdate') || '实时预览'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-xs text-gray-500 mb-1">{t('activities.carbonSaved')} (kg CO₂)</div>
            <div className="text-2xl font-bold text-green-600 leading-none">
              {(() => { const v = calculationResult.carbon_saved; const num = typeof v === 'number' ? v : Number(v); return Number.isFinite(num) ? num.toFixed(2) : '0.00'; })()}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-xs text-gray-500 mb-1">{t('activities.form.expectedPoints')}</div>
            <div className="text-2xl font-bold text-blue-600 leading-none">
              {calculationResult.points_earned ?? 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : null;

  return (
    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6">
      {/* 主列 */}
      <div className="md:col-span-8 space-y-6">
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
              <div className="font-medium">{t(`units.${activity.unit}`, activity.unit)}</div>
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

        {/* 移动端显示预览（在表单上方） */}
        <div className="md:hidden">
          {calculationCard}
        </div>

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
                  {t('activities.form.dataValue')} ({t(`units.${activity.unit}`, activity.unit)})
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
            {/* 文件上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                {t('activities.form.uploadImage')}
              </label>
              <FileUpload
                multiple
                directory="activities"
                entityType="carbon_record"
                accept="image/*"
                maxFiles={3}
                maxSize={5 * 1024 * 1024}
                onUploadSuccess={handleUploadSuccess}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('activities.form.uploadHint')}
              </p>
            </div>


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
    </div>{/* END 主列 */}

    {/* 侧栏：桌面端悬浮计算结果 */}
    <div className="hidden md:block md:col-span-4">
      <div className="sticky top-20 space-y-4">
        {calculationCard || (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">
                {t('activities.form.calculationResult')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('activities.form.enterDataToPreview') || '输入数值后出现'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-gray-400">
              {t('activities.form.previewPlaceholder') || '填写数据以查看实时计算'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  </div>  /* END grid container */
  );
}

