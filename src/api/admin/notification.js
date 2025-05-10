import request from '@/utils/request';

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getNotificationList(params) {
  return request({
    url: '/admin/notification/list',
    method: 'get',
    params
  });
}

/**
 * 获取通知详情
 * @param {String|Number} id - 通知ID
 * @returns {Promise}
 */
export function fetchNotificationDetail(id) {
  return request({
    url: `/admin/notification/${id}`,
    method: 'get'
  });
}

/**
 * 创建通知
 * @param {Object} data - 通知数据
 * @returns {Promise}
 */
export function createNotification(data) {
  return request({
    url: '/admin/notification',
    method: 'post',
    data
  });
}

/**
 * 更新通知
 * @param {String|Number} id - 通知ID
 * @param {Object} data - 通知数据
 * @returns {Promise}
 */
export function updateNotification(id, data) {
  return request({
    url: `/admin/notification/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除通知
 * @param {String|Number} id - 通知ID或ID列表
 * @returns {Promise}
 */
export function deleteNotification(id) {
  return request({
    url: `/admin/notification/${id}`,
    method: 'delete'
  });
}

/**
 * 发送通知
 * @param {String|Number} id - 通知ID
 * @returns {Promise}
 */
export function sendNotification(id) {
  return request({
    url: `/admin/notification/send/${id}`,
    method: 'post'
  });
}