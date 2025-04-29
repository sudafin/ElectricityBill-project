import request from '@/utils/request';

/**
 * 获取用户未读通知数量
 * @returns {Promise<number>} 返回未读通知数量的Promise
 */
export function getUnreadCount() {
  return request({
    url: '/user/notification/unread-count',
    method: 'get'
  });
}

/**
 * 获取用户通知列表
 * @param {Object} params 查询参数
 * @param {string} params.status 通知状态：'全部'或'已读'
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise<Object>} 返回通知列表数据的Promise
 */
export function getNotifications(params) {
  return request({
    url: '/user/notification/list',
    method: 'get',
    params
  });
}

/**
 * 获取通知详情
 * @param {number} id 通知ID
 * @returns {Promise<Object>} 返回通知详情数据的Promise
 */
export function getNotificationDetail(id) {
  return request({
    url: `/user/notification/detail/${id}`,
    method: 'get'
  });
}

/**
 * 标记通知为已读
 * @param {number} id 通知ID
 * @returns {Promise<Object>} 返回操作结果的Promise
 */
export function markAsRead(id) {
  return request({
    url: `/user/notification/read/${id}`,
    method: 'put'
  });
}

/**
 * 标记所有通知为已读
 * @returns {Promise<Object>} 返回操作结果的Promise
 */
export function markAllAsRead() {
  return request({
    url: '/user/notification/read-all',
    method: 'put'
  });
}



