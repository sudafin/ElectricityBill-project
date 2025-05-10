import request from '@/utils/request';

/**
 * 获取日志列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getLogList(params) {
  return request({
    url: '/admin/log/list',
    method: 'get',
    params
  });
}

/**
 * 获取日志详情
 * @param {String|Number} id - 日志ID
 * @returns {Promise}
 */
export function detailLog(id) {
  return request({
    url: `/admin/log/${id}`,
    method: 'get'
  });
}

/**
 * 删除日志
 * @param {String|Number} id - 日志ID
 * @returns {Promise}
 */
export function deleteLog(id) {
  return request({
    url: `/admin/log/${id}`,
    method: 'delete'
  });
}

/**
 * 获取日志报表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getLogReport(params) {
  return request({
    url: '/admin/log/report',
    method: 'get',
    params,
    responseType: 'blob'
  });
}


