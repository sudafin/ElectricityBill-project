import request from '@/utils/request';

/**
 * 创建支付订单
 * @param {Object} data 支付数据
 * @param {string} data.billId 账单ID
 * @param {string} data.paymentMethod 支付方式（balance/wechat/alipay/bank）
 * @param {Object} data.bankInfo 银行卡支付信息（仅当paymentMethod为bank时必填）
 * @returns {Promise} 返回Promise对象，包含支付订单信息
 */
export function createPayment(data) {
  return request({
    url: '/api/user/payments',
    method: 'post',
    data
  });
}

/**
 * 获取支付结果
 * @param {string} paymentId 支付订单ID
 * @returns {Promise} 返回Promise对象，包含支付结果信息
 */
export function getPaymentStatus(paymentId) {
  return request({
    url: `/api/user/payments/${paymentId}/status`,
    method: 'get'
  });
}

/**
 * 申请退款
 * @param {string} paymentId 支付订单ID
 * @param {Object} data 退款数据
 * @param {string} data.reason 退款原因
 * @param {string} data.description 详细说明（当reason为"其他原因"时必填）
 * @returns {Promise} 返回Promise对象，包含退款申请结果
 */
export function applyRefund(paymentId, data) {
  return request({
    url: `/api/user/payments/${paymentId}/refund`,
    method: 'post',
    data
  });
}

/**
 * 获取支付记录
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.status 支付状态（可选）
 * @returns {Promise} 返回Promise对象，包含支付记录列表
 */
export function getPaymentHistory(params) {
  return request({
    url: '/api/user/payments/history',
    method: 'get',
    params
  });
}

/**
 * 获取支付详情
 * @param {string} paymentId 支付订单ID
 * @returns {Promise} 返回Promise对象，包含支付详情
 */
export function getPaymentDetail(paymentId) {
  return request({
    url: `/api/user/payments/${paymentId}/detail`,
    method: 'get'
  });
}

/**
 * 下载电子收据
 * @param {string} paymentId 支付订单ID
 * @returns {Promise} 返回Promise对象，包含收据PDF文件
 */
export function downloadReceipt(paymentId) {
  return request({
    url: `/api/user/payments/${paymentId}/receipt`,
    method: 'get',
    responseType: 'blob'
  });
} 