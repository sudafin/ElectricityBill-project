import request from '@/utils/request';

/**
 * 获取用户仪表盘数据
 * 返回包括用户信息、电表信息和当前账单信息的综合数据
 * @returns {Promise} 返回仪表盘数据的Promise
 */
export function getDashboardData() {
  return request({
    url: '/user/dashboard',
    method: 'get'
  });
}

/**
 * 获取用户未读通知数量
 * @returns {Promise} 返回未读通知数量的Promise
 */
export function getUnreadNotificationCount() {
  return request({
    url: '/user/notification/unread-count',
    method: 'get'
  });
}

/**
 * 获取用户最新通知列表
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=3] - 返回通知数量限制
 * @returns {Promise} 返回最新通知列表的Promise
 */
export function getLatestNotifications(params) {
  return request({
    url: '/user/notification/latest',
    method: 'get',
    params
  });
}