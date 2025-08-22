import React from 'react';
import { X, Mail, MailOpen, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

export function MessageDetailModal({ message, isOpen, onClose, onMarkRead }) {
  const { t } = useTranslation();

  if (!isOpen || !message) return null;

  const getStatusBadge = (status) => {
    if (status === 'read') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <MailOpen className="h-3 w-3 mr-1" /> {t('messages.read')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Mail className="h-3 w-3 mr-1" /> {t('messages.unread')}
        </span>
      );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{t('messages.priority.low')}</span>;
      case 'normal':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{t('messages.priority.normal')}</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{t('messages.priority.high')}</span>;
      case 'urgent':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{t('messages.priority.urgent')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">{t('messages.detail.title')}</CardTitle>
              <CardDescription>{t('messages.detail.subtitle')}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('messages.type')}</p>
                <p className="text-lg font-semibold text-gray-900">{t(`messages.types.${message.type}`, message.type)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('messages.status')}</p>
                {getStatusBadge(message.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('messages.priority.title')}</p>
                {getPriorityBadge(message.priority)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('messages.date')}</p>
                <p className="text-gray-900">{format(new Date(message.created_at), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            </div>

            {/* 主题和内容 */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />{t('messages.subject')}
              </h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{message.subject}</p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2" />{t('messages.content')}
              </h4>
              <div className="text-gray-700 bg-gray-50 p-3 rounded-md" dangerouslySetInnerHTML={{ __html: message.content }}></div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end pt-4">
              {message.status === 'unread' && (
                <Button
                  variant="outline"
                  onClick={() => onMarkRead(message.id)}
                  className="mr-2"
                >
                  <MailOpen className="h-4 w-4 mr-1" /> {t('messages.markRead')}
                </Button>
              )}
              <Button onClick={onClose}>{t('common.close')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

