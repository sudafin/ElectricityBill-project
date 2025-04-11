import request from '@/utils/request';

/**
 * 获取对账单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getReconciliationList(params) {
  return request({
    url: '/admin/reconciliation/list',
    method: 'get',
    params
  });
}

/**
 * 获取对账单详情
 * @param {String|Number} id - 对账单ID
 * @returns {Promise}
 */
export function getReconciliationDetail(id) {
  return request({
    url: `/admin/reconciliation/${id}`,
    method: 'get'
  });
}

/**
 * 审批对账单
 * @param {Object} data - 审批数据
 * @returns {Promise}
 */
export function approveReconciliation(data) {
  return request({
    url: '/admin/reconciliation/approve',
    method: 'post',
    data
  });
}

/**
 * 拒绝对账单
 * @param {Object} data - 拒绝数据
 * @returns {Promise}
 */
export function rejectReconciliation(data) {
  return request({
    url: '/admin/reconciliation/reject',
    method: 'post',
    data
  });
}

/**
 * 获取对账单报表
 * @returns {Promise}
 */
export function getReconciliationReport() {
  return request({
    url: '/admin/reconciliation/report',
    method: 'get',
    responseType: 'blob'
  });
}