import request from '@/utils/request';

/**
 * 分页查询日志列表
 * @param {Object} params - 查询参数
 * @param {String} params.module - 模块
 * @param {String} params.operationType - 操作类型
 * @param {String} params.operatorName - 操作人
 * @param {String} params.startDate - 开始日期
 * @param {String} params.endDate - 结束日期
 * @param {Number} params.pageNo - 页码
 * @param {Number} params.pageSize - 每页大小
 * @param {Boolean} params.isAsc - 是否升序
 * @param {String} params.sortBy - 排序字段
 * @returns {Promise}
 */
export function queryPage(params) {
  return request({
    url: '/admin/log/page',
    method: 'get',
    params
  });
}

/**
 * 获取日志详情
 * @param {String|Number} id - 日志ID
 * @returns {Promise}
 */
export function queryDetail(id) {
  return request({
    url: `/admin/log/detail/${id}`,
    method: 'get'
  });
}

/**
 * 删除日志
 * @param {Array} ids - 日志ID数组
 * @returns {Promise}
 */
export function deleteLog(ids) {
  return request({
    url: '/admin/log/delete',
    method: 'delete',
    params: { ids }
  });
}

/**
 * 导出日志报表
 * @returns {Promise}
 */
export function exportLog() {
  return request({
    url: '/admin/log/export',
    method: 'get',
    responseType: 'blob'
  });
}


