import request from '@/utils/request';

/**
 * 分页查询通知
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码（可选）
 * @param {number} params.pageSize 每页数量（可选）
 * @param {string} params.title 标题（可选）
 * @param {string} params.type 类型（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含通知列表数据
 */
export function queryPage(params) {
  return request({
    url: '/admin/notification/page',
    method: 'get',
    params
  });
}

/**
 * 查询通知详情
 * @param {number} id 通知ID
 * @returns {Promise} 返回Promise对象，包含通知详情
 */
export function queryNotificationDetail(id) {
  return request({
    url: `/admin/notification/detail/${id}`,
    method: 'get'
  });
}

/**
 * 创建通知
 * @param {Object} data 通知数据
 * @param {string} data.title 标题
 * @param {string} data.content 内容
 * @param {string} data.type 类型
 * @param {string} data.notificationType 通知类型
 * @param {string} data.expireTime 过期时间
 * @param {Array} data.senderList 发送对象列表
 * @returns {Promise} 返回Promise对象，包含创建结果
 */
export function create(data) {
  return request({
    url: '/admin/notification/create',
    method: 'post',
    data
  });
}

/**
 * 删除通知
 * @param {Array} ids 通知ID数组
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteNotification(ids) {
  return request({
    url: '/admin/notification/delete',
    method: 'delete',
    params: { ids }
  });
}

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
    url: '/admin/notification/create',
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