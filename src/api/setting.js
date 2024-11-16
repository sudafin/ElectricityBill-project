import request from '@/utils/request';

export function getRoleList(params) {
  return request({
    url: '/setting/role/list',
    method: 'get',
    params,
  });
}

export function createRole(data) {
  return request({
    url: '/setting/role/create',
    method: 'post',
    data,
  });
}

export function updateRole(data) {
  return request({
    url: '/setting/role/update',
    method: 'put',
    data,
  });
}

export function deleteRole(id) {
  return request({
    url: `/setting/role/delete/${id}`,
    method: 'delete',
  });
}

export function getFeeRateList(params) {
  return request({
    url: '/setting/fee-rate/list',
    method: 'get',
    params,
  });
}

export function updateFeeRate(data) {
  return request({
    url: '/setting/fee-rate/update',
    method: 'put',
    data,
  });
}

export function getParamList(params) {
  return request({
    url: '/setting/param/list',
    method: 'get',
    params,
  });
}

export function updateParam(data) {
  return request({
    url: '/setting/param/update',
    method: 'put',
    data,
  });
}

export function getLogList(params) {
  return request({
    url: '/setting/log/list',
    method: 'get',
    params,
  });
} 