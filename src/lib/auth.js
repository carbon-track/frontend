import api from './api';

// Token管理
export const tokenManager = {
  getToken() {
    return localStorage.getItem('auth_token');
  },

  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  removeToken() {
    localStorage.removeItem('auth_token');
  },

  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// 用户管理
export const userManager = {
  getUser() {
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user) {
    localStorage.setItem('user_info', JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem('user_info');
  },

  isAdmin() {
    const user = this.getUser();
    return user?.is_admin || false;
  }
};

// 认证API (注意：这些方法也在 api.js 中的 authAPI 对象中定义了，建议统一使用)
export const authAPI = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);

    // 后端实际返回：{ success, message, data: { token, user } }
    if (response.data?.success && response.data?.data?.token) {
      const { token, user } = response.data.data;
      tokenManager.setToken(token);
      if (user) {
        userManager.setUser(user);
      } else {
        // 兜底拉取用户信息
        await this.getCurrentUser();
      }
      return { success: true, data: { token, user: userManager.getUser() } };
    }

    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      tokenManager.removeToken();
      userManager.removeUser();
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/users/me');
      if (response.data.success) {
        const user = response.data.data;
        userManager.setUser(user);
        return user;
      }
    } catch (error) {
      console.error('Get current user failed:', error);
      this.logout();
    }
    return null;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password, confirmPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      confirm_password: confirmPassword
    });
    return response.data;
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  }
};

// 认证状态检查
export const checkAuthStatus = () => {
  const token = tokenManager.getToken();
  const user = userManager.getUser();
  
  // 需要 token 有效 且 本地有用户信息 才视为已登录
  if (!token || !tokenManager.isTokenValid()) {
    tokenManager.removeToken();
    userManager.removeUser();
    return { isAuthenticated: false, user: null };
  }
  if (!user) {
    return { isAuthenticated: false, user: null };
  }
  
  return { isAuthenticated: true, user };
};

// 登录重定向
export const redirectToLogin = (returnUrl = null) => {
  const url = returnUrl ? `/auth/login?return=${encodeURIComponent(returnUrl)}` : '/auth/login';
  window.location.href = url;
};

// 获取返回URL
export const getReturnUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('return') || '/dashboard';
};

// 权限检查
export const hasPermission = (permission) => {
  const user = userManager.getUser();
  if (!user) return false;
  
  // 管理员拥有所有权限
  if (user.is_admin) return true;
  
  // 基础权限检查
  const permissions = {
    'view_own_data': true,
    'edit_own_profile': true,
    'submit_carbon_record': true,
    'exchange_products': true,
    'view_messages': true
  };
  
  return permissions[permission] || false;
};

// 表单验证规则
export const validationRules = {
  usernameOrEmail: {
    required: '用户名或邮箱不能为空'
  },
  username: {
    required: '用户名不能为空',
    minLength: { value: 3, message: '用户名至少3个字符' },
    maxLength: { value: 20, message: '用户名最多20个字符' },
    pattern: {
      value: /^\w+$/,
      message: '用户名只能包含字母、数字和下划线'
    }
  },
  
  email: {
    required: '邮箱不能为空',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '请输入有效的邮箱地址'
    }
  },
  
  password: {
    required: '密码不能为空'
  },
  
  realName: {
    required: '真实姓名不能为空',
    minLength: { value: 2, message: '姓名至少2个字符' },
    maxLength: { value: 10, message: '姓名最多10个字符' }
  },
  
  className: {
    required: '班级不能为空',
    maxLength: { value: 20, message: '班级名称最多20个字符' }
  }
};

// 错误处理
export const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    tokenManager.removeToken();
    userManager.removeUser();
    redirectToLogin(window.location.pathname);
    return;
  }
  
  const message = error.response?.data?.message || error.message || '操作失败';
  throw new Error(message);
};

// 自动刷新token
export const setupTokenRefresh = () => {
  const refreshInterval = 30 * 60 * 1000; // 30分钟
  
  setInterval(async () => {
    const token = tokenManager.getToken();
    if (!token || !tokenManager.isTokenValid()) {
      return;
    }
    
    try {
      // 检查token是否即将过期（剩余时间少于10分钟）
      const payload = JSON.parse(atob(token.split('.')[1]));
      const remainingTime = payload.exp * 1000 - Date.now();
      
      if (remainingTime < 10 * 60 * 1000) {
        const user = await authAPI.getCurrentUser();
        if (!user) {
          authAPI.logout();
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      authAPI.logout();
    }
  }, refreshInterval);
};

// 初始化认证
export const initAuth = () => {
  // 设置API拦截器
  api.interceptors.request.use((config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authAPI.logout();
        redirectToLogin();
      }
      return Promise.reject(error instanceof Error ? error : new Error(error?.message || 'API response error'));
    }
  );

  // 启动token自动刷新
  setupTokenRefresh();
};

export default {
  tokenManager,
  userManager,
  authAPI,
  checkAuthStatus,
  redirectToLogin,
  getReturnUrl,
  hasPermission,
  validationRules,
  handleAuthError,
  initAuth
};

