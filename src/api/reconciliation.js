import request from '@/utils/request';

export function getReconciliationList(params) {
  return request({
    url: '/reconciliation/list',
    method: 'get',
    params,
  });
}

export function getReconciliationDetail(id) {
  return request({
    url: `/reconciliation/detail/${id}`,
    method: 'get',
  });
}

export function approveReconciliation(data) {
  return request({
    url: '/reconciliation/approve',
    method: 'post',
    data,
  });
} 