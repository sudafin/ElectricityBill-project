import request from '@/utils/request';

/**
 * 获取账单列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.keyword 搜索关键词（可选）
 * @param {string} params.status 账单状态（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含账单列表
 */
export function getBillList(params) {
  return request({
    url: '/api/admin/bills',
    method: 'get',
    params
  });
}

/**
 * 获取账单详情
 * @param {string} billId 账单ID
 * @returns {Promise} 返回Promise对象，包含账单详情
 */
export function getBillDetail(billId) {
  return request({
    url: `/api/admin/bills/${billId}`,
    method: 'get'
  });
}

/**
 * 生成账单
 * @param {Object} data 账单数据
 * @param {string} data.userId 用户ID
 * @param {string} data.meterId 电表ID
 * @param {string} data.billPeriod 账单周期
 * @param {number} data.usage 用电量
 * @param {number} data.amount 金额
 * @param {string} data.dueDate 截止日期
 * @returns {Promise} 返回Promise对象，包含生成结果
 */
export function generateBill(data) {
  return request({
    url: '/api/admin/bills',
    method: 'post',
    data
  });
}

/**
 * 批量生成账单
 * @param {Object} data 批量生成数据
 * @param {string} data.billPeriod 账单周期
 * @param {string} data.dueDate 截止日期
 * @param {Array} data.userIds 用户ID列表（可选）
 * @returns {Promise} 返回Promise对象，包含生成结果
 */
export function batchGenerateBills(data) {
  return request({
    url: '/api/admin/bills/batch',
    method: 'post',
    data
  });
}

/**
 * 修改账单
 * @param {string} billId 账单ID
 * @param {Object} data 更新数据
 * @param {number} data.usage 用电量（可选）
 * @param {number} data.amount 金额（可选）
 * @param {string} data.dueDate 截止日期（可选）
 * @param {string} data.status 状态（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateBill(billId, data) {
  return request({
    url: `/api/admin/bills/${billId}`,
    method: 'put',
    data
  });
}

/**
 * 删除账单
 * @param {string} billId 账单ID
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteBill(billId) {
  return request({
    url: `/api/admin/bills/${billId}`,
    method: 'delete'
  });
}

/**
 * 获取账单支付详情
 * @param {string} billId 账单ID
 * @returns {Promise} 返回Promise对象，包含账单支付详情
 */
export function getBillPaymentDetail(billId) {
  return request({
    url: `/api/admin/bills/${billId}/payment`,
    method: 'get'
  });
}

/**
 * 获取账单统计数据
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含账单统计数据
 */
export function getBillStatistics(params) {
  return request({
    url: '/api/admin/bills/statistics',
    method: 'get',
    params
  });
}

/**
 * 导出账单
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.status 账单状态（可选）
 * @param {string} params.format 导出格式（excel/pdf，默认excel）
 * @returns {Promise} 返回Promise对象，包含导出文件
 */
export function exportBills(params) {
  return request({
    url: '/api/admin/bills/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
} 