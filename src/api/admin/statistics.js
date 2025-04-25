import request from '@/utils/request';

/**
 * 电量统计
 */
export function getElectricityReport(params) {
  return request({
    url: '/admin/statistics/electricity',
    method: 'get',
    params
  });
}

/**
 * 电费统计
 */
export function getFeeReport(params) {
  return request({
    url: '/admin/statistics/fee',
    method: 'get',
    params
  });
}

/**
 * 反馈统计
 */
export function getFeedbackReport(params) {
  return request({
    url: '/admin/statistics/feedback',
    method: 'get',
    params
  });
}

/**
 * 对账统计
 */
export function getReconciliationReport(params) {
  return request({
    url: '/admin/statistics/reconciliation',
    method: 'get',
    params
  });
}

/**
 * 用户类型统计
 */
export function getUserTypeReport(params) {
  return request({
    url: '/admin/statistics/user-type',
    method: 'get',
    params
  });
}
