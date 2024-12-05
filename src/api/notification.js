import request from '@/utils/request';

export function getNotificationList(params) {
  return request({
    url: '/notification/page',
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

export function deleteNotification(ids) {
  return request({
    url: '/notification/delete',
    method: 'delete',
    params: { ids: ids },
  });
} 

export function fetchNotificationDetail(id) {
  return request({
    url: `/notification/detail/${id}`,
    method: 'get',
  });
}