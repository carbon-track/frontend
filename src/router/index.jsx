import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout, SimpleLayout, AuthLayout } from '../components/layout/Layout';
import { ProtectedRoute, PublicRoute, AdminRoute } from '../components/auth/ProtectedRoute';

// 页面组件（懒加载）
const HomePage = React.lazy(() => import('../pages/HomePage'));
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const CalculatePage = React.lazy(() => import('../pages/CalculatePage'));
const ActivitiesPage = React.lazy(() => import('../pages/ActivitiesPage'));
const StorePage = React.lazy(() => import('../pages/StorePage'));
const MessagesPage = React.lazy(() => import('../pages/MessagesPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const AdminPage = React.lazy(() => import('../pages/AdminPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));

// 加载组件
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
  </div>
);

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </React.Suspense>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireAuth={true}>
            <React.Suspense fallback={<LoadingSpinner />}>
              <DashboardPage />
            </React.Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'calculate',
        element: (
          <ProtectedRoute requireAuth={true}>
            <React.Suspense fallback={<LoadingSpinner />}>
              <CalculatePage />
            </React.Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'activities',
        element: (
          <ProtectedRoute requireAuth={true}>
            <React.Suspense fallback={<LoadingSpinner />}>
              <ActivitiesPage />
            </React.Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'store',
        element: (
          <ProtectedRoute requireAuth={true}>
            <React.Suspense fallback={<LoadingSpinner />}>
              <StorePage />
            </React.Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute requireAuth={true}>
            <React.Suspense fallback={<LoadingSpinner />}>
              <MessagesPage />
            </React.Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute requireAuth={true}>
            <React.Suspense fallback={<LoadingSpinner />}>
              <ProfilePage />
            </React.Suspense>
          </ProtectedRoute>
        )
      }
    ]
  },
  
  // 认证页面路由
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <React.Suspense fallback={<LoadingSpinner />}>
              <LoginPage />
            </React.Suspense>
          </PublicRoute>
        )
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <React.Suspense fallback={<LoadingSpinner />}>
              <RegisterPage />
            </React.Suspense>
          </PublicRoute>
        )
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <React.Suspense fallback={<LoadingSpinner />}>
              <ForgotPasswordPage />
            </React.Suspense>
          </PublicRoute>
        )
      }
    ]
  },
  
  // 兼容旧路由
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: '/register',
    element: <Navigate to="/auth/register" replace />
  },
  {
    path: '/forgot-password',
    element: <Navigate to="/auth/forgot-password" replace />
  },
  
  // 管理员路由
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <SimpleLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <AdminPage />
          </React.Suspense>
        )
      },
      {
        path: 'users',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <div>用户管理页面</div>
          </React.Suspense>
        )
      },
      {
        path: 'activities',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <div>活动管理页面</div>
          </React.Suspense>
        )
      },
      {
        path: 'products',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <div>商品管理页面</div>
          </React.Suspense>
        )
      },
      {
        path: 'reviews',
        element: (
          <React.Suspense fallback={<LoadingSpinner />}>
            <div>审核管理页面</div>
          </React.Suspense>
        )
      }
    ]
  },
  
  // 404 页面
  {
    path: '*',
    element: (
      <React.Suspense fallback={<LoadingSpinner />}>
        <NotFoundPage />
      </React.Suspense>
    )
  }
]);

export default router;

