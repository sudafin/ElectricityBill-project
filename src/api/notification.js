import request from '@/utils/request';

export function getNotificationList(params) {
  return request({
    url: '/notification/list',
    method: 'get',
    params,
  });
}

export function createNotification(data) {
  return request({
    url: '/notification/create',
    method: 'post',
    data,
  });
}

export function updateNotification(data) {
  return request({
    url: '/notification/update',
    method: 'put',
    data,
  });
}

export function deleteNotification(id) {
  return request({
    url: `/notification/delete/${id}`,
    method: 'delete',
  });
} 