import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { profileAPI, schoolAPI } from '../../lib/api';

const profileSchema = (t) => z.object({
  username: z.string().min(1, t('validation.required')).max(50, t('validation.maxLength', { max: 50 })),
  email: z.string().email(t('validation.email')),
  real_name: z.string().max(100, t('validation.maxLength', { max: 100 })).optional(),
  // 备注：学校/班级在此表单中改为使用独立的搜索与选择逻辑，提交时仅发送 school_id 与 class_name
  school: z.string().max(100, t('validation.maxLength', { max: 100 })).optional(),
  class_name: z.string().max(50, t('validation.maxLength', { max: 50 })).optional(),
});

export function ProfileForm({ user, onUpdateSuccess }) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 学校/班级对齐 Onboarding 的交互
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schoolQuery, setSchoolQuery] = useState(user?.school || '');
  const [classQuery, setClassQuery] = useState(user?.class_name || '');
  const [selectedSchoolId, setSelectedSchoolId] = useState(user?.school_id ? String(user.school_id) : '');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      real_name: user?.real_name || '',
      school: user?.school || '',
      class_name: user?.class_name || '',
    },
  });

  useEffect(() => {
    reset({
      username: user?.username || '',
      email: user?.email || '',
      real_name: user?.real_name || '',
      school: user?.school || '',
      class_name: user?.class_name || '',
    });
    setSchoolQuery(user?.school || '');
    setClassQuery(user?.class_name || '');
    setSelectedSchoolId(user?.school_id ? String(user.school_id) : '');
  }, [user, reset]);

  // 防抖
  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const loadSchools = async (search) => {
    try {
      const res = await schoolAPI.getSchools({ search, limit: 20, page: 1 });
      const list = res.data?.data?.schools || [];
      setSchools(list);
    } catch (e) {
      // 静默失败，避免打断表单
      console.error('Load schools failed:', e);
    }
  };

  const debouncedLoadSchools = useMemo(() => debounce(loadSchools, 300), []);

  useEffect(() => {
    debouncedLoadSchools((schoolQuery || '').trim());
  }, [schoolQuery, debouncedLoadSchools]);

  const loadClasses = async (sid, search = '') => {
    try {
      const res = await schoolAPI.getClasses(sid, { search, limit: 20, page: 1 });
      const list = res.data?.data?.classes || [];
      setClasses(list);
    } catch (e) {
      console.error('Load classes failed:', e);
    }
  };

  useEffect(() => {
    if (!selectedSchoolId) {
      setClasses([]);
      return;
    }
    loadClasses(selectedSchoolId, (classQuery || '').trim());
    // 仅在切换学校时刷新班级列表
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchoolId]);

  const debouncedLoadClasses = useMemo(() => debounce((q) => {
    if (selectedSchoolId) {
      loadClasses(selectedSchoolId, q);
    }
  }, 300), [selectedSchoolId]);

  useEffect(() => {
    debouncedLoadClasses((classQuery || '').trim());
  }, [classQuery, debouncedLoadClasses]);

  const ensureSchool = async (nameOrId) => {
    if (!nameOrId) return null;
    if (/^\d+$/.test(String(nameOrId))) return parseInt(String(nameOrId), 10);
    const res = await schoolAPI.createOrFetchSchool({ name: nameOrId });
    return res.data?.data?.school?.id || null;
  };

  const ensureClass = async (sid, name) => {
    if (!sid || !name) return null;
    const exists = classes.find(c => c.name.toLowerCase() === String(name).toLowerCase());
    if (exists) return exists.id;
    const res = await schoolAPI.createClass(sid, { name });
    return res.data?.data?.class?.id || null;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 组装 payload：用户名/实名 + 学校/班级（与 Onboarding 对齐）
      let schoolId = selectedSchoolId;
      if (!schoolId && schoolQuery) {
        schoolId = await ensureSchool(schoolQuery);
      }
      let className = (classQuery || '').trim();
      if (schoolId && className) {
        await ensureClass(schoolId, className);
      }

      const payload = {
        username: data.username,
        real_name: data.real_name || undefined,
      };
      if (schoolId) payload.school_id = parseInt(String(schoolId), 10);
      if (className) payload.class_name = className;

      await profileAPI.updateProfile(payload);
      toast.success(t('success.update'));
      onUpdateSuccess();
    } catch (err) {
      toast.error(t('errors.updateFailed'));
      console.error('Profile update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          {t('profile.username')}
        </label>
        <Input
          id="username"
          {...register('username')}
          className="mt-1 block w-full"
          disabled={isSubmitting}
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('profile.email')}
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full"
          disabled={true} // Email usually not editable directly
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="real_name" className="block text-sm font-medium text-gray-700">
          {t('profile.realName')}
        </label>
        <Input
          id="real_name"
          {...register('real_name')}
          className="mt-1 block w-full"
          disabled={isSubmitting}
        />
        {errors.real_name && <p className="mt-1 text-sm text-red-600">{errors.real_name.message}</p>}
      </div>

      <div>
        <label htmlFor="schoolSearch" className="block text-sm font-medium text-gray-700">
          {t('profile.school')}
        </label>
        <Input
          id="schoolSearch"
          placeholder={t('onboarding.schoolPlaceholder')}
          value={schoolQuery}
          onChange={(e) => {
            setSchoolQuery(e.target.value);
            if (!e.target.value) setSelectedSchoolId('');
          }}
          className="mt-1 block w-full"
          disabled={isSubmitting}
        />
        <div className="mt-2 max-h-40 overflow-auto border rounded">
          {schools.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${String(selectedSchoolId)===String(s.id)?'bg-green-50':''}`}
              onClick={() => {
                setSelectedSchoolId(String(s.id));
                setSchoolQuery(s.name);
              }}
            >
              {s.name}
            </button>
          ))}
          {schools.length === 0 && (
            <div className="px-3 py-2 text-gray-500">{t('onboarding.noSchoolMatches')}</div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="classSearch" className="block text-sm font-medium text-gray-700">
          {t('profile.className')}
        </label>
        <Input
          id="classSearch"
          placeholder={t('onboarding.classPlaceholder')}
          value={classQuery}
          onChange={(e) => setClassQuery(e.target.value)}
          disabled={isSubmitting || (!selectedSchoolId && !schoolQuery)}
          className="mt-1 block w-full"
        />
        {selectedSchoolId && (
          <div className="mt-2 max-h-40 overflow-auto border rounded">
            {classes.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                onClick={() => setClassQuery(c.name)}
              >
                {c.name}
              </button>
            ))}
            {classes.length === 0 && (
              <div className="px-3 py-2 text-gray-500">{t('onboarding.noClassMatches')}</div>
            )}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('common.saving') : t('common.save')}
      </Button>
    </form>
  );
}

