import request from '@/utils/request';

export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params,
  });
}

export function createUser(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data,
  });
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data,
  });
}

export function deleteUser(id) {
  return request({
    url: `/user/delete/${id}`,
    method: 'delete',
  });
}

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data,
  });
} 