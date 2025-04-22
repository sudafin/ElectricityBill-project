import request from '@/utils/request';

/**
 * 分页查询对账单列表
 * @param {Object} params - 查询参数
 * @param {string} params.meterNo - 电表号（可选）
 * @param {string} params.reconciliationNo - 对账单号（可选）
 * @param {string} params.reconciliationStatus - 状态（可选）
 * @param {string} params.username - 用户名（可选）
 * @param {string} params.userType - 用户类型（可选）
 * @param {string} params.startDate - 开始日期（可选）
 * @param {string} params.endDate - 结束日期（可选）
 * @param {number} params.pageNo - 页码（可选）
 * @param {number} params.pageSize - 每页数量（可选）
 * @param {boolean} params.isAsc - 是否升序（可选）
 * @param {string} params.sortBy - 排序字段（可选）
 * @returns {Promise}
 */
export function queryPage(params) {
  return request({
    url: '/reconciliation/page',
    method: 'get',
    params
  });
}

/**
 * 获取对账单详情
 * @param {String|Number} id - 对账单ID
 * @returns {Promise}
 */
export function queryReconciliationDetail(id) {
  return request({
    url: `/reconciliation/detail/${id}`,
    method: 'get'
  });
}

/**
 * 获取审批对账单详情
 * @param {String|Number} id - 对账单ID
 * @returns {Promise}
 */
export function queryApprovalReconciliationDetail(id) {
  return request({
    url: `/reconciliation/approve/detail/${id}`,
    method: 'get'
  });
}

/**
 * 审批对账单
 * @param {String|Number} id - 对账单ID
 * @param {Object} data - 审批数据
 * @param {string} data.status - 状态
 * @param {string} data.comment - 备注
 * @returns {Promise}
 */
export function approveReconciliation(id, data) {
  return request({
    url: `/reconciliation/approve/${id}`,
    method: 'put',
    data
  });
}

/**
 * 导出对账数据报表
 * @returns {Promise}
 */
export function exportReconciliation() {
  return request({
    url: '/reconciliation/export',
    method: 'get',
    responseType: 'blob'
  });
}