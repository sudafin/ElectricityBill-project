import request from '@/utils/request';

/**
 * 获取账单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getBillList(params) {
  return request({
    url: '/admin/bill/list',
    method: 'get',
    params
  });
}

/**
 * 获取账单详情
 * @param {String|Number} id - 账单ID
 * @returns {Promise}
 */
export function getBillDetail(id) {
  return request({
    url: `/admin/bill/${id}`,
    method: 'get'
  });
}

/**
 * 生成账单
 * @param {Object} data - 账单数据
 * @returns {Promise}
 */
export function generateBill(data) {
  return request({
    url: '/admin/bill/generate',
    method: 'post',
    data
  });
}

/**
 * 批量生成账单
 * @param {Object} data - 批量生成数据
 * @returns {Promise}
 */
export function batchGenerateBills(data) {
  return request({
    url: '/admin/bill/batch-generate',
    method: 'post',
    data
  });
}

/**
 * 修改账单
 * @param {String|Number} id - 账单ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateBill(id, data) {
  return request({
    url: `/admin/bill/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除账单
 * @param {String|Number} id - 账单ID
 * @returns {Promise}
 */
export function deleteBill(id) {
  return request({
    url: `/admin/bill/${id}`,
    method: 'delete'
  });
}

/**
 * 获取账单支付详情
 * @param {String|Number} id - 账单ID
 * @returns {Promise}
 */
export function getBillPaymentDetail(id) {
  return request({
    url: `/admin/bill/${id}/payment`,
    method: 'get'
  });
}

/**
 * 获取账单统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getBillStatistics(params) {
  return request({
    url: '/admin/bill/statistics',
    method: 'get',
    params
  });
}

/**
 * 导出账单
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function exportBills(params) {
  return request({
    url: '/admin/bill/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

/**
 * 管理端查询用户账单
 * @param {string|number} userId 用户ID
 * @returns {Promise} 返回Promise对象，包含用户账单数据
 */
export function queryUserBill(userId) {
  return request({
    url: `/admin/bill/${userId}`,
    method: 'get'
  });
} 