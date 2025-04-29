import request from '@/utils/request';

/**
 * 获取账单概览统计信息
 * @param {Object} params - 查询参数
 * @returns {Promise} - 返回账单概览统计数据的Promise
 */
export function getBillOverview(params) {
  return request({
    url: '/user/bill/overview',
    method: 'get',
    params
  })
}

/**
 * 分页获取账单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页记录数
 * @returns {Promise} - 返回账单列表的Promise
 */
export function getBillList(params) {
  return request({
    url: '/user/bill/page',
    method: 'get',
    params
  })
}

/**
 * 获取指定账单详情
 * @param {string|number} billId - 账单ID
 * @returns {Promise} - 返回账单详情的Promise
 */
export function getBillDetail(billId) {
  return request({
    url: `/user/bill/detail/${billId}`,
    method: 'get'
  })    
}

/**
 * 获取可用支付方式
 * @returns {Promise} - 返回可用支付方式列表的Promise
 */
export function getBillPaymentDetail() {
  return request({
    url: '/user/bill/payment/detail',
    method: 'get'
  })
}

/**
 * 创建支付订单/发起支付
 * @param {Object} data - 支付数据
 * @param {string|number} data.billId - 账单ID
 * @param {string} data.paymentMethod - 支付方式
 * @returns {Promise} - 返回支付订单信息的Promise
 */
export function createPayment(billId) {
  return request({
    url: `/user/bill/pay`,
    method: 'get',
    params: {
      billId
    } 
  })
}

/**
 * 查询支付结果
 * @param {string} billId - 账单ID
 * @returns {Promise} - 返回支付状态的Promise
 */
export function queryPaymentStatus(billId) {
  return request({
    url: `/user/bill/status/${billId}`,
    method: 'get' 
  })
} 


