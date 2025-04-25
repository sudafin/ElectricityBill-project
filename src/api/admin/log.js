import request from '@/utils/request';


export function getLogList(params) {
  return request({
    url: '/admin/log/page',
    method: 'get',
    params,
  });
}

export function detailLog(id) {
  return request({
    url: `/admin/log/detail/${id}`,
    method: 'get',
  });
}

export function deleteLog(ids) {
  return request({
    url: '/admin/log/delete',
    method: 'delete',
    params: { ids: ids },
  });
}

//获取报表excel
export function getLogReport() {
  return request({
    url: '/admin/log/export',
    method: 'get',
    responseType: 'blob',  // 设置响应类型为 Blob，用于处理文件下载
  });
}

