import request from '@/utils/request';

/**
 * 获取通知列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise} 返回Promise对象，包含通知列表
 */
export function getNotifications(params) {
  return request({
    url: '/api/user/notifications',
    method: 'get',
    params
  });
}

/**
 * 标记通知已读
 * @param {string} notificationId 通知ID
 * @returns {Promise} 返回Promise对象，包含标记结果
 */
export function markNotificationRead(notificationId) {
  return request({
    url: `/api/user/notifications/${notificationId}/read`,
    method: 'put'
  });
}

/**
 * 标记所有通知已读
 * @returns {Promise} 返回Promise对象，包含标记结果
 */
export function markAllNotificationsRead() {
  return request({
    url: '/api/user/notifications/read-all',
    method: 'put'
  });
}

/**
 * 删除通知
 * @param {string} notificationId 通知ID
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteNotification(notificationId) {
  return request({
    url: `/api/user/notifications/${notificationId}`,
    method: 'delete'
  });
}

/**
 * 获取未读通知数量
 * @returns {Promise} 返回Promise对象，包含未读通知数量
 */
export function getUnreadCount() {
  return request({
    url: '/api/user/notifications/unread-count',
    method: 'get'
  });
}

/**
 * 更新通知设置
 * @param {Object} data 通知设置
 * @param {boolean} data.emailNotification 是否开启邮件通知
 * @param {boolean} data.smsNotification 是否开启短信通知
 * @param {boolean} data.billReminder 是否开启账单提醒
 * @param {boolean} data.paymentReminder 是否开启缴费提醒
 * @param {boolean} data.usageAlert 是否开启用电预警
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateNotificationSettings(data) {
  return request({
    url: '/api/user/notifications/settings',
    method: 'put',
    data
  });
}

/**
 * 获取用户新通知列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码（可选）
 * @param {number} params.pageSize 每页数量（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含新通知列表
 */
export function getNewNotificationList(params) {
  return request({
    url: '/user/notification/newList',
    method: 'get',
    params
  });
} 