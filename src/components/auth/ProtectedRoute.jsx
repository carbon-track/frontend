import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuthStatus, hasPermission } from '../../lib/auth';

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  permission = null,
  fallback = null 
}) {
  const location = useLocation();
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const { isAuthenticated, user } = checkAuthStatus();
    setAuthState({ isAuthenticated, user });
  }, []);

  // 加载状态
  if (authState === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const { isAuthenticated, user } = authState;

  // 需要认证但未登录
  if (requireAuth && !isAuthenticated) {
    // 新版登录页路由在 /auth/login，这里兼容 redirect
    const target = `/auth/login?return=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={target} replace />;
  }

  // 不需要认证但已登录（如登录页面）
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 需要管理员权限但不是管理员
  if (requireAdmin && (!user || !user.is_admin)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问被拒绝</h1>
          <p className="text-gray-600 mb-4">您没有权限访问此页面</p>
          <button
            onClick={() => window.history.back()}
            className="text-green-600 hover:text-green-500"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  // 需要特定权限但没有权限
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h1>
          <p className="text-gray-600 mb-4">您没有执行此操作的权限</p>
          <button
            onClick={() => window.history.back()}
            className="text-green-600 hover:text-green-500"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return children;
}

// 管理员路由组件
export function AdminRoute({ children, fallback = null }) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// 公开路由组件（已登录用户会被重定向）
export function PublicRoute({ children }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
}

