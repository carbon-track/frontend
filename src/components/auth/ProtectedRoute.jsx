import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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

  // 基于资料完整度的引导：如果需要认证且用户资料缺少学校或班级，则跳转到 /onboarding
    if (requireAuth && isAuthenticated) {
    const isVerificationRoute = location.pathname.startsWith('/auth/verify-email');
    if (!user?.email_verified_at && !isVerificationRoute) {
      const targetPath = `${location.pathname}${location.search || ''}`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('verification_return_path', targetPath);
        if (user?.email) {
          sessionStorage.setItem('pending_verification_email', user.email);
        }
      }
      const params = new URLSearchParams();
      params.set('return', targetPath);
      if (user?.email) {
        params.set('email', user.email);
      }
      return <Navigate to={`/auth/verify-email?${params.toString()}`} replace />;
    }
  const needsOnboarding = !user?.school_id; // class_name 不再作为必填条件
    // 允许本会话临时跳过引导（Onboarding页内点击“暂时跳过”设置的标记）
    const onboardingSkipped = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('onboarding_skipped') === '1';
    const currentPath = location.pathname;
    if (needsOnboarding && currentPath !== '/onboarding' && !onboardingSkipped) {
      // 避免在Onboarding页和登录等特殊页造成循环
      return <Navigate to="/onboarding" replace />;
    }
  }

  // 需要管理员权限但不是管理员
  if (requireAdmin && !user?.is_admin) {
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

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  requireAuth: PropTypes.bool,
  requireAdmin: PropTypes.bool,
  permission: PropTypes.string,
  fallback: PropTypes.node,
};

AdminRoute.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
};

PublicRoute.propTypes = {
  children: PropTypes.node,
};

