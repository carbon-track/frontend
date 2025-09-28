import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useTranslation } from '../hooks/useTranslation';
import { MessageFilters } from '../components/messages/MessageFilters';
import { MessageList } from '../components/messages/MessageList';
import { MessageDetailModal } from '../components/messages/MessageDetailModal';
import { Pagination } from '../components/ui/Pagination';
import { messageAPI } from '../lib/api';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { AlertCircle, Loader2, MailOpen, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function MessagesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    priority: '',
    sort: 'created_at_desc',
    page: 1,
    limit: 10
  });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data, isLoading, error, isFetching } = useQuery(
    ['messages', filters],
    () => messageAPI.getMessages(filters),
    { keepPreviousData: true }
  );

  const markReadMutation = useMutation(
    (messageId) => messageAPI.markAsRead(messageId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
        toast.success(t('messages.markReadSuccess'));
        if (selectedMessage) {
          // selectedMessage uses `is_read` boolean in API responses
          setSelectedMessage(prev => prev ? ({ ...prev, is_read: true }) : prev);
        }
      },
      onError: () => {
        toast.error(t('messages.markReadFailed'));
      }
    }
  );

  const deleteMutation = useMutation(
    (messageId) => messageAPI.deleteMessage(messageId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
        toast.success(t('messages.deleteSuccess'));
        setSelectedMessage(null);
      },
      onError: () => {
        toast.error(t('messages.deleteFailed'));
      }
    }
  );

  const markAllReadMutation = useMutation(
    () => messageAPI.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('messages');
        toast.success(t('messages.markAllReadSuccess'));
      },
      onError: () => {
        toast.error(t('messages.markAllReadFailed'));
      }
    }
  );

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRowClick = (message) => {
    setSelectedMessage(message);
    // backend message object uses `is_read` boolean
    if (!message.is_read) {
      markReadMutation.mutate(message.id);
    }
  };

  const closeModal = () => {
    setSelectedMessage(null);
  };

  const handleMarkRead = (messageId) => {
    markReadMutation.mutate(messageId);
  };

  const handleDelete = (messageId) => {
    if (window.confirm(t('messages.confirmDelete')))
    deleteMutation.mutate(messageId);
  };

  const handleMarkAllRead = () => {
    if (window.confirm(t('messages.confirmMarkAllRead')))
    markAllReadMutation.mutate();
  };

  const messages = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('messages.title')}</h1>
          <p className="text-muted-foreground">{t('messages.subtitle')}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isLoading || messages.filter(m => !m.is_read).length === 0}
          >
            <MailOpen className="h-4 w-4 mr-2" /> {t('messages.markAllRead')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm(t('messages.confirmDeleteAll')))
              // Implement delete all logic or call a new mutation
              toast.error(t('messages.deleteAllNotImplemented'));
            }}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" /> {t('messages.deleteAll')}
          </Button>
        </div>
      </div>

      <MessageFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isFetching}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('common.error')}</AlertTitle>
          <AlertDescription>{t('errors.loadFailed')}</AlertDescription>
        </Alert>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold">{t('messages.noMessagesFound')}</h3>
          <p className="text-muted-foreground mt-2">{t('messages.tryDifferentFilters')}</p>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            onRowClick={handleRowClick}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.per_page}
            totalItems={pagination.total_items}
          />
        </>
      )}

      <MessageDetailModal
        message={selectedMessage}
        isOpen={!!selectedMessage}
        onClose={closeModal}
        onMarkRead={handleMarkRead}
      />
    </div>
  );
}

