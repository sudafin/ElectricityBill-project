import request from '@/utils/request';

/**
 * 获取系统配置
 * @param {String} configType - 配置类型
 * @returns {Promise}
 */
export function getSystemConfig(configType) {
  return request({
    url: '/admin/system/config',
    method: 'get',
    params: configType ? { type: configType } : {}
  });
}

/**
 * 更新系统配置
 * @param {Object} data - 配置数据
 * @returns {Promise}
 */
export function updateSystemConfig(data) {
  return request({
    url: '/admin/system/config',
    method: 'put',
    data
  });
}

/**
 * 获取电价配置
 * @returns {Promise}
 */
export function getElectricityPriceConfig() {
  return request({
    url: '/admin/system/electricity-price',
    method: 'get'
  });
}

/**
 * 更新电价配置
 * @param {Object} data - 电价配置数据
 * @returns {Promise}
 */
export function updateElectricityPriceConfig(data) {
  return request({
    url: '/admin/system/electricity-price',
    method: 'put',
    data
  });
}

/**
 * 获取操作日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getOperationLogs(params) {
  return request({
    url: '/admin/system/logs',
    method: 'get',
    params
  });
}

/**
 * 获取系统通知设置
 * @returns {Promise}
 */
export function getNotificationConfig() {
  return request({
    url: '/admin/system/notification-config',
    method: 'get'
  });
}

/**
 * 更新系统通知设置
 * @param {Object} data - 通知设置数据
 * @returns {Promise}
 */
export function updateNotificationConfig(data) {
  return request({
    url: '/admin/system/notification-config',
    method: 'put',
    data
  });
}

/**
 * 发送系统通知
 * @param {Object} data - 通知数据
 * @returns {Promise}
 */
export function sendSystemNotification(data) {
  return request({
    url: '/admin/system/send-notification',
    method: 'post',
    data
  });
}

/**
 * 备份系统数据
 * @returns {Promise}
 */
export function backupData() {
  return request({
    url: '/admin/system/backup',
    method: 'post'
  });
}

/**
 * 获取备份列表
 * @returns {Promise}
 */
export function getBackupList() {
  return request({
    url: '/admin/system/backup-list',
    method: 'get'
  });
}

/**
 * 恢复系统数据
 * @param {String} backupId - 备份ID
 * @returns {Promise}
 */
export function restoreData(backupId) {
  return request({
    url: `/admin/system/restore/${backupId}`,
    method: 'post'
  });
}

/**
 * 获取公钥
 * @returns {Promise} 返回Promise对象，包含公钥
 */
export function getPublicKey() {
  return request({
    url: '/login',
    method: 'get'
  })
}

/**
 * 获取验证码
 * @param {string} key 验证码key
 * @returns {Promise} 返回Promise对象，包含验证码图片
 */
export function captcha(key) {
  return request({
    url: '/login/captcha',
    method: 'get',
    params: { key },
    responseType: 'blob'
  })
}

/**
 * 登录
 * @param {Object} data 登录数据
 * @param {string} data.account 账号
 * @param {string} data.password 密码
 * @param {string} data.code 验证码
 * @param {string} data.key 验证码key
 * @param {boolean} data.rememberMe 记住我
 * @returns {Promise} 返回Promise对象，包含登录结果
 */
export function login(data) {
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}

/**
 * 登出
 * @returns {Promise} 返回Promise对象，包含登出结果
 */
export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

/**
 * 刷新token
 * @param {string} adminToken 管理员token
 * @returns {Promise} 返回Promise对象，包含新token
 */
export function refreshToken(adminToken) {
  return request({
    url: '/login/refresh',
    method: 'get',
    params: { adminToken }
  })
} 