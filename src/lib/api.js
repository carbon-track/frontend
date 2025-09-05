import axios from 'axios';

// API base URL - 可以通过环境变量配置
// 规范化规则：
// - 若以 /api 或 /api/ 结尾，自动追加 /v1（推荐直接在 .env 配置到 /api/v1）
// - 去除末尾多余斜杠，避免组合路径出现 //
const normalizeBaseUrl = (url) => {
  if (!url) return 'http://localhost:8000/api/v1';
  let u = String(url).trim();
  // 去除末尾斜杠
  u = u.replace(/\/+$/, '');
  // 如果正好以 /api 结尾，则自动追加 /v1
  if (/\/api$/i.test(u)) {
    u = u + '/v1';
    // 在开发环境提供一次性提示，帮助发现错误配置
    if (typeof window !== 'undefined' && typeof console !== 'undefined') {
      console.info('[api] VITE_API_URL 末尾为 /api，已自动追加 /v1 ->', u);
    }
  }
  return u;
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1');

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 针对 calculate 的并发请求控制（后发先至，取消上一次未完成的计算请求）
let calculateAbortController = null;

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
      // 生成UUID作为幂等性key - 兼容性更好的方法
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        // 备用UUID生成方法
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const requestId = generateUUID();
      config.headers['X-Request-ID'] = requestId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(error?.message || 'API request error'));
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

    return Promise.reject(error instanceof Error ? error : new Error(error?.message || 'API response error'));
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
  
  // 计算碳减排（不创建记录） - 后端期望 { activity_id, data }
  // 使用 AbortController 取消上一次未完成的请求，避免竞态与请求风暴
  calculate: (activityId, data) => {
    const requestBody = { activity_id: activityId, data };
    // 取消上一次未完成的请求
    if (calculateAbortController) {
      try { calculateAbortController.abort(); } catch { /* ignore */ }
    }
    const controller = new AbortController();
    calculateAbortController = controller;
    return api
      .post('/carbon-track/calculate', requestBody, { signal: controller.signal })
      .finally(() => {
        // 仅当当前 controller 仍为最新时清理
        if (calculateAbortController === controller) {
          calculateAbortController = null;
        }
      });
  },
  
  // 记录碳减排活动 - 后端期望 { activity_id, amount, date, description?, images?, unit? }
  recordActivity: (formData) => {
    const requestBody = {
      activity_id: formData.activity_id,
      amount: formData.data, // 数值
      date: formData.activity_date, // 直接传 yyyy-mm-dd 字符串
      description: formData.notes || undefined,
      images: formData.uploaded_files || undefined,
      unit: formData.unit || undefined
    };
    return api.post('/carbon-track/record', requestBody);
  },
  
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
  getChartData: (params = {}) => api.get('/users/me/chart-data', { params }),
  
  // 获取最近活动
  getRecentActivities: (params = {}) => api.get('/users/me/activities', { params }),
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
  // 获取学校列表（支持搜索与分页）
  getSchools: (params = {}) => api.get('/schools', { params }),
  // 创建或获取学校（按名称，不区分大小写）
  createOrFetchSchool: (data) => api.post('/schools', data),
  // 获取某学校的班级列表
  getClasses: (schoolId, params = {}) => api.get(`/schools/${schoolId}/classes`, { params }),
  // 为某学校创建班级（幂等）
  createClass: (schoolId, data) => api.post(`/schools/${schoolId}/classes`, data),
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
