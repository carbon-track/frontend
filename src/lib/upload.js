import api from './api';

/**
 * 文件上传工具类
 */
export class FileUploader {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = options.allowedTypes || [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    this.allowedExtensions = options.allowedExtensions || [
      'jpg', 'jpeg', 'png', 'gif', 'webp'
    ];
  }

  /**
   * 验证文件
   */
  validateFile(file) {
    const errors = [];

    // 检查文件大小
    if (file.size > this.maxFileSize) {
      errors.push(`文件大小不能超过 ${this.formatFileSize(this.maxFileSize)}`);
    }

    // 检查文件类型
    if (!this.allowedTypes.includes(file.type)) {
      errors.push(`不支持的文件类型。支持的类型：${this.allowedTypes.join(', ')}`);
    }

    // 检查文件扩展名
    const extension = this.getFileExtension(file.name);
    if (!this.allowedExtensions.includes(extension)) {
      errors.push(`不支持的文件扩展名。支持的扩展名：${this.allowedExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 上传单个文件
   */
  async uploadFile(file, options = {}) {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join('; '));
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (options.directory) {
      formData.append('directory', options.directory);
    }
    
    if (options.entityType) {
      formData.append('entity_type', options.entityType);
    }
    
    if (options.entityId) {
      formData.append('entity_id', options.entityId.toString());
    }

    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: options.onProgress
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '文件上传失败');
    }
  }

  /**
   * 上传多个文件
   */
  async uploadMultipleFiles(files, options = {}) {
    // 验证所有文件
    const validationResults = files.map(file => ({
      file,
      validation: this.validateFile(file)
    }));

    const invalidFiles = validationResults.filter(result => !result.validation.isValid);
    if (invalidFiles.length > 0) {
      const errors = invalidFiles.map(result => 
        `${result.file.name}: ${result.validation.errors.join('; ')}`
      );
      throw new Error('文件验证失败:\n' + errors.join('\n'));
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file);
    });
    
    if (options.directory) {
      formData.append('directory', options.directory);
    }
    
    if (options.entityType) {
      formData.append('entity_type', options.entityType);
    }
    
    if (options.entityId) {
      formData.append('entity_id', options.entityId.toString());
    }

    try {
      const response = await api.post('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: options.onProgress
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '文件上传失败');
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath) {
    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await api.delete(`/files/${encodedPath}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '文件删除失败');
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath) {
    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await api.get(`/files/${encodedPath}/info`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取文件信息失败');
    }
  }

  /**
   * 生成预签名URL
   */
  async generatePresignedUrl(filePath, expiresIn = 3600) {
    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await api.get(`/files/${encodedPath}/presigned-url`, {
        params: { expires_in: expiresIn }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '生成预签名URL失败');
    }
  }

  /**
   * 获取文件扩展名
   */
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * 检查是否为图片文件
   */
  isImageFile(file) {
    return file.type.startsWith('image/');
  }

  /**
   * 创建图片预览URL
   */
  createPreviewUrl(file) {
    if (!this.isImageFile(file)) {
      return null;
    }
    return URL.createObjectURL(file);
  }

  /**
   * 释放预览URL
   */
  revokePreviewUrl(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 压缩图片（可选功能）
   */
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算新的尺寸
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // 设置画布尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建新的File对象
              const compressedFile = new File([blob], file.name, {
                type: outputFormat,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// 创建默认实例
export const fileUploader = new FileUploader();

// 便捷函数
export const uploadFile = (file, options) => fileUploader.uploadFile(file, options);
export const uploadMultipleFiles = (files, options) => fileUploader.uploadMultipleFiles(files, options);
export const deleteFile = (filePath) => fileUploader.deleteFile(filePath);
export const getFileInfo = (filePath) => fileUploader.getFileInfo(filePath);
export const generatePresignedUrl = (filePath, expiresIn) => fileUploader.generatePresignedUrl(filePath, expiresIn);

// 管理员功能
export const adminAPI = {
  // 获取存储统计
  async getStorageStats() {
    try {
      const response = await api.get('/admin/files/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取存储统计失败');
    }
  },

  // 清理过期文件
  async cleanupExpiredFiles(directory = 'temp', daysOld = 7) {
    try {
      const response = await api.post('/admin/files/cleanup', {
        directory,
        days_old: daysOld
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '清理过期文件失败');
    }
  }
};

export default fileUploader;

