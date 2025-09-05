import { useQuery } from 'react-query';
import { messageAPI } from '../lib/api';
import { checkAuthStatus } from '../lib/auth';

/**
 * 获取未读站内信数量的 React Query Hook
 * - 会在登录状态下启用
 * - 默认每 60s 轮询一次，窗口聚焦时自动重刷
 * - 返回 { count, isLoading, error, refetch }
 */
export function useUnreadMessagesCount(options = {}) {
  const { isAuthenticated } = checkAuthStatus();

  const query = useQuery(
    ['unreadCount'],
    async () => {
      const res = await messageAPI.getUnreadCount();
      // 后端响应结构: { success: true, data: { total_unread: number, ... } }
      return res?.data?.data?.total_unread ?? 0;
    },
    {
      enabled: !!isAuthenticated,
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
      refetchOnWindowFocus: true,
      ...options,
    }
  );

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
