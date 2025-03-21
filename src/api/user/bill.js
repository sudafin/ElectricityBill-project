import request from '@/utils/request';

/**
 * 获取当前账单信息
 * @returns {Promise} 返回Promise对象，包含当前账单信息
 */
export function getCurrentBill() {
  return request({
    url: '/api/user/bills/current',
    method: 'get'
  });
}

/**
 * 获取账单详情
 * @param {string} billId 账单ID
 * @returns {Promise} 返回Promise对象，包含账单详情
 */
export function getBillDetail(billId) {
  return request({
    url: `/api/user/bills/${billId}`,
    method: 'get'
  });
}

/**
 * 获取账单历史列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.status 账单状态（可选）
 * @returns {Promise} 返回Promise对象，包含账单历史列表
 */
export function getBillHistory(params) {
  return request({
    url: '/api/user/bills/history',
    method: 'get',
    params
  });
}

/**
 * 下载账单
 * @param {string} billId 账单ID
 * @returns {Promise} 返回Promise对象，包含账单PDF文件
 */
export function downloadBill(billId) {
  return request({
    url: `/api/user/bills/${billId}/download`,
    method: 'get',
    responseType: 'blob'
  });
} 