import request from '@/utils/request';

/**
 * 获取电费费率列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getRateList(params) {
  return request({
    url: '/admin/rate/list',
    method: 'get',
    params
  });
}

/**
 * 获取电费费率详情
 * @param {String|Number} id - 费率ID
 * @returns {Promise}
 */
export function getRateDetail(id) {
  return request({
    url: `/admin/rate/${id}`,
    method: 'get'
  });
}

/**
 * 创建电费费率
 * @param {Object} data - 费率数据
 * @returns {Promise}
 */
export function createRate(data) {
  return request({
    url: '/admin/rate',
    method: 'post',
    data
  });
}

/**
 * 更新电费费率
 * @param {String|Number} id - 费率ID
 * @param {Object} data - 费率数据
 * @returns {Promise}
 */
export function updateRate(id, data) {
  return request({
    url: `/admin/rate/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除电费费率
 * @param {String|Number} id - 费率ID
 * @returns {Promise}
 */
export function deleteRate(id) {
  return request({
    url: `/admin/rate/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除电费费率
 * @param {Array} ids - 费率ID数组
 * @returns {Promise}
 */
export function batchDeleteRates(ids) {
  return request({
    url: '/admin/rate/batch',
    method: 'delete',
    data: { ids }
  });
}


