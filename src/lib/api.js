import axios from 'axios';

// API base URL - 可以通过环境变量配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 为敏感操作添加幂等性key
    const sensitiveRoutes = ['/carbon-track/record', '/exchange', '/auth/register', '/messages'];
    const isSensitive = sensitiveRoutes.some(route => config.url?.includes(route));
    
    if (isSensitive && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      // 生成UUID作为幂等性key
      const requestId = crypto.randomUUID();
      config.headers['X-Request-ID'] = requestId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      // 统一跳到新版登录页路径
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  }
);

// API方法封装
export const authAPI = {
  // 用户注册
  register: (data) => api.post('/auth/register', data),
  
  // 用户登录
  login: (data) => api.post('/auth/login', data),
  
  // 用户登出
  logout: () => api.post('/auth/logout'),
  
  // 发送验证码
  sendVerificationCode: (data) => api.post('/auth/send-verification-code', data),
  
  // 重置密码
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // 验证邮箱
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  
  // 忘记密码 (发送重置邮件)
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // 修改密码
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const userAPI = {
  // 获取当前用户信息
  getCurrentUser: () => api.get('/users/me'),
  
  // 更新当前用户信息
  updateCurrentUser: (data) => api.put('/users/me', data),
  
  // 获取用户信息
  getUser: (id) => api.get(`/users/${id}`),
  
  // 更新用户信息
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const carbonAPI = {
  // 获取碳减排活动列表
  getActivities: (params = {}) => api.get('/carbon-activities', { params }),
  
  // 获取单个活动详情
  getActivity: (id) => api.get(`/carbon-activities/${id}`),
  
  // 计算碳减排（不创建记录）
  calculate: (data) => api.post('/carbon-track/calculate', data),
  
  // 记录碳减排活动
  recordActivity: (data) => api.post('/carbon-track/record', data),
  
  // 获取用户的碳减排交易记录
  getTransactions: (params = {}) => api.get('/carbon-track/transactions', { params }),
  
  // 获取单个交易记录
  getTransaction: (id) => api.get(`/carbon-track/transactions/${id}`),
  
  // 审核交易记录（管理员）
  reviewTransaction: (id, data) => api.put(`/carbon-track/transactions/${id}`, data),
  
  // 获取碳因子配置
  getFactors: () => api.get('/carbon-track/factors'),
  
  // 获取用户碳统计
  getStats: () => api.get('/carbon-track/stats'),
  
  // 获取用户统计信息（需要在后端实现）
  getUserStats: () => api.get('/users/me/stats'),
  
  // 获取用户积分历史
  getPointsHistory: (params = {}) => api.get('/users/me/points-history', { params }),
  
  // 获取图表数据
  getChartData: () => api.get('/users/me/chart-data'),
  
  // 获取最近活动
  getRecentActivities: () => api.get('/users/me/activities'),
};

export const productAPI = {
  // 获取产品列表
  getProducts: (params = {}) => api.get('/products', { params }),
  
  // 获取单个产品详情
  getProduct: (id) => api.get(`/products/${id}`),
  
  // 获取产品分类
  getCategories: () => api.get('/products/categories'),
  
  // 兑换产品
  exchangeProduct: (data) => api.post('/exchange', data),
  
  // 获取兑换交易记录
  getExchangeTransactions: (params = {}) => api.get('/exchange/transactions', { params }),
  
  // 获取单个兑换交易
  getExchangeTransaction: (id) => api.get(`/exchange/transactions/${id}`),
};

export const messageAPI = {
  // 获取消息列表
  getMessages: (params = {}) => api.get('/messages', { params }),
  
  // 获取单个消息
  getMessage: (id) => api.get(`/messages/${id}`),
  
  // 标记消息为已读
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  
  // 删除消息
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  
  // 获取未读消息数量
  getUnreadCount: () => api.get('/messages/unread-count'),
  
  // 批量标记所有消息为已读
  markAllAsRead: () => api.put('/messages/mark-all-read'),
};

export const schoolAPI = {
  // 获取学校列表
  getSchools: () => api.get('/schools'),
};

export const fileAPI = {
  // 上传单个文件
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // 上传多个文件
  uploadMultipleFiles: (formData) => api.post('/files/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // 删除文件
  deleteFile: (filePath) => {
    const encodedPath = encodeURIComponent(filePath);
    return api.delete(`/files/${encodedPath}`);
  },
  
  // 获取文件信息
  getFileInfo: (filePath) => {
    const encodedPath = encodeURIComponent(filePath);
    return api.get(`/files/${encodedPath}/info`);
  },
  
  // 获取预签名URL
  getPresignedUrl: (filePath, expiresIn) => {
    const encodedPath = encodeURIComponent(filePath);
    return api.get(`/files/${encodedPath}/presigned-url`, { 
      params: { expires_in: expiresIn } 
    });
  },
  
  // 管理员文件管理
  getAdminFiles: (params = {}) => api.get('/admin/files', { params }),
  getAdminFileStats: () => api.get('/admin/files/stats'),
  cleanupFiles: (data) => api.post('/admin/files/cleanup', data),
};

export const avatarAPI = {
  // 获取头像列表
  getAvatars: (params = {}) => api.get('/avatars', { params }),
  
  // 获取头像分类
  getCategories: () => api.get('/avatars/categories'),
  
  // 选择头像
  selectAvatar: (avatarId) => api.put('/users/me/avatar', { avatar_id: avatarId }),
  
  // 管理员头像管理
  getAdminAvatars: (params = {}) => api.get('/admin/avatars', { params }),
  createAvatar: (data) => api.post('/admin/avatars', data),
  getAvatar: (id) => api.get(`/admin/avatars/${id}`),
  updateAvatar: (id, data) => api.put(`/admin/avatars/${id}`, data),
  deleteAvatar: (id) => api.delete(`/admin/avatars/${id}`),
  updateAvatarSortOrders: (data) => api.put('/admin/avatars/sort-orders', data),
  getAvatarUsageStats: () => api.get('/admin/avatars/usage-stats'),
  uploadAvatar: (formData) => api.post('/admin/avatars/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  restoreAvatar: (id) => api.post(`/admin/avatars/${id}/restore`),
  setDefaultAvatar: (id) => api.put(`/admin/avatars/${id}/set-default`),
};

export const profileAPI = {
  // 更新用户资料
  updateProfile: (data) => api.put('/users/me/profile', data),
};

export const adminAPI = {
  // 用户列表和管理
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  
  // 获取待审核交易
  getPendingTransactions: (params = {}) => api.get('/admin/transactions/pending', { params }),
  
  // 获取统计信息
  getStats: () => api.get('/admin/stats'),
  
  // 获取日志
  getLogs: (params = {}) => api.get('/admin/logs', { params }),
  
  // 碳减排活动管理
  getActivitiesForAdmin: (params = {}) => api.get('/admin/carbon-activities', { params }),
  createActivity: (data) => api.post('/admin/carbon-activities', data),
  updateActivity: (id, data) => api.put(`/admin/carbon-activities/${id}`, data),
  deleteActivity: (id) => api.delete(`/admin/carbon-activities/${id}`),
  restoreActivity: (id) => api.post(`/admin/carbon-activities/${id}/restore`),
  getActivityStatistics: (id = null) => {
    const url = id ? `/admin/carbon-activities/${id}/statistics` : '/admin/carbon-activities/statistics';
    return api.get(url);
  },
  updateSortOrders: (data) => api.put('/admin/carbon-activities/sort-orders', data),
  
  // 活动审核（别名路径）
  getActivities: (params = {}) => api.get('/admin/activities', { params }),
  reviewActivity: (id, data) => api.put(`/admin/activities/${id}/review`, data),
  
  // 产品管理
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  
  // 学校管理
  createSchool: (data) => api.post('/admin/schools', data),
  updateSchool: (id, data) => api.put(`/admin/schools/${id}`, data),
  deleteSchool: (id) => api.delete(`/admin/schools/${id}`),
  
  // 交易审核（使用统一的审核接口）
  reviewTransaction: (id, data) => api.put(`/carbon-track/transactions/${id}`, data),
  
  // 获取兑换记录（管理员）
  getExchanges: (params = {}) => api.get('/admin/exchanges', { params }),
  
  // 获取单个兑换记录（管理员）
  getExchange: (id) => api.get(`/admin/exchanges/${id}`),
  
  // 审核兑换记录（管理员）
  reviewExchange: (id, data) => api.put(`/admin/exchanges/${id}`, data),
  updateExchangeStatus: (id, data) => api.put(`/admin/exchanges/${id}/status`, data),
};

// 工具函数
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export default api;

