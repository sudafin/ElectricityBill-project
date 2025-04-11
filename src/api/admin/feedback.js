import request from '@/utils/request'

/**
 * 获取反馈列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFeedbackList(params) {
  return request({
    url: '/admin/feedback/list',
    method: 'get',
    params
  })
}

/**
 * 获取反馈详情
 * @param {String|Number} id - 反馈ID
 * @returns {Promise}
 */
export function getFeedbackDetail(id) {
  return request({
    url: `/admin/feedback/${id}`,
    method: 'get'
  })
}

/**
 * 处理反馈
 * @param {Object} data - 处理数据
 * @returns {Promise}
 */
export function processFeedback(data) {
  return request({
    url: '/admin/feedback/process',
    method: 'post',
    data
  })
}

/**
 * 批量关闭反馈
 * @param {Array} ids - 反馈ID数组
 * @returns {Promise}
 */
export function batchCloseFeedback(ids) {
  return request({
    url: '/admin/feedback/batch-close',
    method: 'post',
    data: { ids }
  })
} 