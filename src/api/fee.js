import request from '@/utils/request';

export function getFeeList(params) {
  return request({
    url: '/fee/list',
    method: 'get',
    params,
  });
}

export function getFeeDetail(id) {
  return request({
    url: `/fee/detail/${id}`,
    method: 'get',
  });
}

export function createFee(data) {
  return request({
    url: '/fee/create',
    method: 'post',
    data,
  });
}

export function updateFee(data) {
  return request({
    url: '/fee/update',
    method: 'put',
    data,
  });
}

export function deleteFee(id) {
  return request({
    url: `/fee/delete/${id}`,
    method: 'delete',
  });
} 