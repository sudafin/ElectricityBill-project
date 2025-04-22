import request from '@/utils/request'

/**
 * 管理端分页查询用户反馈列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.feedbackType 反馈类型（可选）
 * @param {string} params.feedbackStatus 状态（可选）
 * @param {string} params.feedbackId 反馈ID（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含反馈列表数据
 */
export function queryFeedBackPage(params) {
  return request({
    url: '/admin/feedback/page',
    method: 'get',
    params
  })
}

/**
 * 获取反馈详情
 * @param {string|number} feedbackId 反馈ID
 * @returns {Promise} 返回Promise对象，包含反馈详情
 */
export function getFeedBackDetail(feedbackId) {
  return request({
    url: `/admin/feedback/detail/${feedbackId}`,
    method: 'get'
  })
}

/**
 * 处理用户反馈
 * @param {Object} data 处理数据
 * @param {string|number} data.feedbackId 反馈ID
 * @param {string} data.feedbackStatus 处理状态
 * @param {string} data.response 回复内容
 * @returns {Promise} 返回Promise对象，包含处理结果
 */
export function processFeedBack(data) {
  return request({
    url: `/admin/feedback/process`,
    method: 'post',
    data
  })
}

/**
 * 获取反馈类型
 * @returns {Promise} 返回Promise对象，包含反馈类型数据
 */
export function getFeedbackType() {
  return request({
    url: '/admin/feedback/type',
    method: 'get'
  })
}

/**
 * 更新反馈
 * @param {Object} data 反馈数据
 * @param {string} data.id 反馈ID
 * @param {string} data.status 状态
 * @param {string} data.response 回复内容
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateFeedback(data) {
  return request({
    url: `/api/feedbacks/${data.id}`,
    method: 'put',
    data
  })
}

/**
 * 批量关闭反馈
 * @param {Array} ids 反馈ID数组
 * @returns {Promise} 返回Promise对象，包含批量关闭结果
 */
export function batchCloseFeedback(ids) {
  return request({
    url: '/api/feedbacks/batch-close',
    method: 'post',
    data: { ids }
  })
}

/**
 * 删除反馈
 * @param {string} id 反馈ID
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteFeedback(id) {
  return request({
    url: `/api/feedbacks/${id}`,
    method: 'delete'
  })
}

/**
 * 获取反馈统计信息
 * @returns {Promise} 返回Promise对象，包含反馈统计信息
 */
export function getFeedbackStatistics() {
  return request({
    url: '/api/feedbacks/statistics',
    method: 'get'
  })
} 