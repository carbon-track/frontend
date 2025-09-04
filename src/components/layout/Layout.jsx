import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout({ showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

// 简化布局（不显示页脚）
export function SimpleLayout() {
  return <Layout showFooter={false} />;
}

// 认证页面布局
export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

