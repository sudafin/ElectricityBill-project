import request from '@/utils/request';

export function getReconciliationList(params) {
  return request({
    url: '/reconciliation/page',
    method: 'get',
    params
  });
}

export function getReconciliationDetail(id) {
  return request({
    url: `/reconciliation/detail/${id}`,
    method: 'get',
  });
}

/**
 * 获取审批详情
 * @param {*} id 
 * @returns 
 */
export function approveReconciliationDetail(id) {
  return request({
    url: `/reconciliation/approval/detail/${id}`,
    method: 'get',
  });
} 
/**
 * 审批
 * @param {*} id 
 * @param {*} data 
 * @returns 
 */
export function approveReconciliation(id, data) {
  return request({
    url: `/reconciliation/approve/${id}`,
    method: 'put',
    data,
  });
} 

//获取报表excel
export function getReconciliationReport() {
  return request({
    url: '/reconciliation/export',
    method: 'get',
    responseType: 'blob',  // 设置响应类型为 Blob，用于处理文件下载
  });
}