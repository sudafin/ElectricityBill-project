import request from '@/utils/request';


export function getLogList(params) {
  return request({
    url: '/log/page',
    method: 'get',
    params,
  });
}

export function detailLog(id) {
  return request({
    url: `/log/detail/${id}`,
    method: 'get',
  });
}

export function deleteLog(ids) {
  return request({
    url: '/log/delete',
    method: 'delete',
    params: { ids: ids },
  });
}

