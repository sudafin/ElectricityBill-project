import request from '@/utils/request';

/**
 * 用户端查询账单列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码（可选）
 * @param {number} params.pageSize 每页数量（可选）
 * @param {number} params.billId 账单ID（可选）
 * @param {string} params.status 账单状态（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含账单列表数据
 */
export function query(params) {
  return request({
    url: '/user/bill/page',
    method: 'get',
    params
  });
}

/**
 * 获取账单详情
 * @param {number} id 账单ID
 * @returns {Promise} 返回Promise对象，包含账单详情
 */
export function detailBill(id) {
  return request({
    url: `/user/bill/detailBill/${id}`,
    method: 'get'
  });
}

/**
 * 支付账单
 * @param {Object} params 支付参数
 * @param {number} params.billId 账单ID
 * @returns {Promise} 返回Promise对象，包含支付数据
 */
export function pay(params) {
  return request({
    url: '/user/bill/pay',
    method: 'get',
    params
  });
}

/**
 * 支付通知
 * @returns {Promise} 返回Promise对象，包含支付通知结果
 */
export function payNotify() {
  return request({
    url: '/user/bill/notify',
    method: 'post'
  });
} 