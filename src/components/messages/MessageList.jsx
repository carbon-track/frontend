import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDateSafe } from '../../lib/utils';
import { Mail, MailOpen, AlertCircle, CheckCircle, Clock, XCircle, Eye, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function MessageList({ messages, onRowClick, onMarkRead, onDelete }) {
  const { t } = useTranslation();

  const getStatusIcon = (status) => {
    if (status === 'read') {
      return <MailOpen className="h-4 w-4 text-gray-500" />;
    } else {
      return <Mail className="h-4 w-4 text-blue-500" />;
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
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t('messages.types.title')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t('messages.priority.title')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t('messages.subject')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t('messages.status')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t('messages.date')}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t('common.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {messages.map((message) => (
            <tr key={message.id} className={`hover:bg-gray-50 ${message.status === 'unread' ? 'bg-blue-50' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(message.status)}
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {t(`messages.types.${message.type}`, message.type)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getPriorityBadge(message.priority)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 line-clamp-1">
                  {message.subject}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {t(`messages.${message.status}`)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateSafe(message.created_at, 'yyyy-MM-dd HH:mm')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRowClick(message)}
                  className="mr-2"
                >
                  <Eye className="h-4 w-4 mr-1" /> {t('common.view')}
                </Button>
                {message.status === 'unread' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkRead(message.id)}
                    className="mr-2"
                  >
                    <MailOpen className="h-4 w-4 mr-1" /> {t('messages.markRead')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(message.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> {t('common.delete')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

