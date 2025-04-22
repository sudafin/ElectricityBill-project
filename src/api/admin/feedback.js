import request from '@/utils/request'

/**
 * 获取反馈列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.limit 每页数量
 * @param {string} params.feedback_type 反馈类型（可选）
 * @param {string} params.status 状态（可选）
 * @param {Array} params.submit_time 提交时间范围（可选）
 * @returns {Promise} 返回Promise对象，包含反馈列表数据
 */
export function getFeedbackList(params) {
  return request({
    url: '/api/feedbacks',
    method: 'get',
    params
  })
}

/**
 * 获取反馈详情
 * @param {string} id 反馈ID
 * @returns {Promise} 返回Promise对象，包含反馈详情
 */
export function getFeedbackDetail(id) {
  return request({
    url: `/api/feedbacks/${id}`,
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