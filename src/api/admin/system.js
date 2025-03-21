import request from '@/utils/request';

/**
 * 获取系统配置
 * @param {string} configType 配置类型（optional）
 * @returns {Promise} 返回Promise对象，包含系统配置
 */
export function getSystemConfig(configType) {
  return request({
    url: '/api/admin/system/config',
    method: 'get',
    params: configType ? { type: configType } : {}
  });
}

/**
 * 更新系统配置
 * @param {Object} data 配置数据
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateSystemConfig(data) {
  return request({
    url: '/api/admin/system/config',
    method: 'put',
    data
  });
}

/**
 * 获取电价配置
 * @returns {Promise} 返回Promise对象，包含电价配置
 */
export function getElectricityPriceConfig() {
  return request({
    url: '/api/admin/system/electricity-price',
    method: 'get'
  });
}

/**
 * 更新电价配置
 * @param {Object} data 电价配置数据
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateElectricityPriceConfig(data) {
  return request({
    url: '/api/admin/system/electricity-price',
    method: 'put',
    data
  });
}

/**
 * 获取操作日志
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.type 日志类型（可选）
 * @param {string} params.username 操作人（可选）
 * @returns {Promise} 返回Promise对象，包含操作日志
 */
export function getOperationLogs(params) {
  return request({
    url: '/api/admin/system/logs',
    method: 'get',
    params
  });
}

/**
 * 获取系统通知设置
 * @returns {Promise} 返回Promise对象，包含系统通知设置
 */
export function getNotificationConfig() {
  return request({
    url: '/api/admin/system/notification-config',
    method: 'get'
  });
}

/**
 * 更新系统通知设置
 * @param {Object} data 通知设置数据
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateNotificationConfig(data) {
  return request({
    url: '/api/admin/system/notification-config',
    method: 'put',
    data
  });
}

/**
 * 发送系统通知
 * @param {Object} data 通知数据
 * @param {string} data.title 通知标题
 * @param {string} data.content 通知内容
 * @param {string} data.type 通知类型
 * @param {Array} data.userIds 接收用户ID列表（可选，为空则发送给所有用户）
 * @returns {Promise} 返回Promise对象，包含发送结果
 */
export function sendSystemNotification(data) {
  return request({
    url: '/api/admin/system/send-notification',
    method: 'post',
    data
  });
}

/**
 * 备份系统数据
 * @returns {Promise} 返回Promise对象，包含备份结果
 */
export function backupData() {
  return request({
    url: '/api/admin/system/backup',
    method: 'post'
  });
}

/**
 * 获取备份列表
 * @returns {Promise} 返回Promise对象，包含备份列表
 */
export function getBackupList() {
  return request({
    url: '/api/admin/system/backup-list',
    method: 'get'
  });
}

/**
 * 恢复系统数据
 * @param {string} backupId 备份ID
 * @returns {Promise} 返回Promise对象，包含恢复结果
 */
export function restoreData(backupId) {
  return request({
    url: `/api/admin/system/restore/${backupId}`,
    method: 'post'
  });
} 