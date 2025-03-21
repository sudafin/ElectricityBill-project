import request from '@/utils/request';

/**
 * 获取支付记录列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.keyword 搜索关键词（可选）
 * @param {string} params.status 支付状态（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.paymentMethod 支付方式（可选）
 * @returns {Promise} 返回Promise对象，包含支付记录列表
 */
export function getPaymentList(params) {
  return request({
    url: '/api/admin/payments',
    method: 'get',
    params
  });
}

/**
 * 获取支付详情
 * @param {string} paymentId 支付ID
 * @returns {Promise} 返回Promise对象，包含支付详情
 */
export function getPaymentDetail(paymentId) {
  return request({
    url: `/api/admin/payments/${paymentId}`,
    method: 'get'
  });
}

/**
 * 更新支付状态
 * @param {string} paymentId 支付ID
 * @param {Object} data 更新数据
 * @param {string} data.status 支付状态
 * @param {string} data.remark 备注（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updatePaymentStatus(paymentId, data) {
  return request({
    url: `/api/admin/payments/${paymentId}/status`,
    method: 'put',
    data
  });
}

/**
 * 处理退款申请
 * @param {string} refundId 退款申请ID
 * @param {Object} data 处理数据
 * @param {string} data.status 处理状态 (approved/rejected)
 * @param {string} data.reason 处理原因（可选）
 * @returns {Promise} 返回Promise对象，包含处理结果
 */
export function processRefund(refundId, data) {
  return request({
    url: `/api/admin/payments/refunds/${refundId}`,
    method: 'put',
    data
  });
}

/**
 * 获取退款申请列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.status 退款状态（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含退款申请列表
 */
export function getRefundList(params) {
  return request({
    url: '/api/admin/payments/refunds',
    method: 'get',
    params
  });
}

/**
 * 获取支付统计数据
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.groupBy 分组方式（day/week/month/year，默认day）
 * @returns {Promise} 返回Promise对象，包含支付统计数据
 */
export function getPaymentStatistics(params) {
  return request({
    url: '/api/admin/payments/statistics',
    method: 'get',
    params
  });
}

/**
 * 导出支付记录
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.status 支付状态（可选）
 * @param {string} params.paymentMethod 支付方式（可选）
 * @param {string} params.format 导出格式（excel/pdf，默认excel）
 * @returns {Promise} 返回Promise对象，包含导出文件
 */
export function exportPayments(params) {
  return request({
    url: '/api/admin/payments/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
} 