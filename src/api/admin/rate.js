import request from '@/utils/request';

/**
 * 分页查询费率
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码（可选）
 * @param {number} params.pageSize 每页数量（可选）
 * @param {string} params.rateId 费率ID（可选）
 * @param {string} params.status 状态（可选）
 * @param {string} params.userType 用户类型（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含费率列表数据
 */
export function queryRatePage(params) {
  return request({
    url: '/admin/rate/page',
    method: 'get',
    params
  });
}

/**
 * 获取费率详情
 * @param {number} id 费率ID
 * @returns {Promise} 返回Promise对象，包含费率详情
 */
export function getRateDetail(id) {
  return request({
    url: `/admin/rate/detail/${id}`,
    method: 'get'
  });
}

/**
 * 创建费率
 * @param {Object} data 费率数据
 * @returns {Promise} 返回Promise对象，包含创建结果
 */
export function createRate(data) {
  return request({
    url: '/admin/rate/create',
    method: 'post',
    data
  });
}

/**
 * 编辑费率
 * @param {number} id 费率ID
 * @param {Object} data 费率数据
 * @returns {Promise} 返回Promise对象，包含编辑结果
 */
export function editRate(id, data) {
  return request({
    url: `/admin/rate/edit/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除费率
 * @param {Array} ids 费率ID数组
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteRate(ids) {
  return request({
    url: '/admin/rate/delete',
    method: 'delete',
    params: { ids }
  });
}

/**
 * 获取费率列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.userType 用户类型（可选）
 * @param {string} params.status 状态（可选）
 * @param {string} params.startDate 生效开始日期（可选）
 * @param {string} params.endDate 生效结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含费率列表和总数
 */
export function getRateList(params) {
  return request({
    url: '/admin/rate/list',
    method: 'get',
    params
  });
}

/**
 * 添加费率
 * @param {Object} data 费率数据
 * @param {string} data.user_type 用户类型
 * @param {number} data.peak_price 峰时电价
 * @param {number} data.flat_price 平时电价
 * @param {number} data.valley_price 谷时电价
 * @param {number} data.summer_peak_price 夏季峰时电价（可选）
 * @param {string} data.peak_start 峰时开始时间
 * @param {string} data.peak_end 峰时结束时间
 * @param {string} data.valley_start 谷时开始时间
 * @param {string} data.valley_end 谷时结束时间
 * @param {string} data.summer_period 夏季时段（可选）
 * @param {number} data.status 状态
 * @param {string} data.effective_date 生效日期
 * @param {string} data.expire_date 失效日期
 * @param {number} data.discount 折扣（可选）
 * @returns {Promise} 返回Promise对象，包含添加结果
 */
export function addRate(data) {
  return request({
    url: '/admin/rate/create',
    method: 'post',
    data
  });
}

/**
 * 更新费率
 * @param {Object} data 费率数据
 * @param {string} data.id 费率ID
 * @param {string} data.user_type 用户类型（可选）
 * @param {number} data.peak_price 峰时电价（可选）
 * @param {number} data.flat_price 平时电价（可选）
 * @param {number} data.valley_price 谷时电价（可选）
 * @param {number} data.summer_peak_price 夏季峰时电价（可选）
 * @param {string} data.peak_start 峰时开始时间（可选）
 * @param {string} data.peak_end 峰时结束时间（可选）
 * @param {string} data.valley_start 谷时开始时间（可选）
 * @param {string} data.valley_end 谷时结束时间（可选）
 * @param {string} data.summer_period 夏季时段（可选）
 * @param {number} data.status 状态（可选）
 * @param {string} data.effective_date 生效日期（可选）
 * @param {string} data.expire_date 失效日期（可选）
 * @param {number} data.discount 折扣（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateRate(data) {
  return request({
    url: `/admin/rate/edit/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 批量删除费率
 * @param {Array} ids 费率ID数组
 * @returns {Promise} 返回Promise对象，包含批量删除结果
 */
export function batchDeleteRates(ids) {
  return request({
    url: '/admmnin/rae/batch-delete',
    method: 'post',
    data: {ids: ids }
  });
}

/**
 * 启用/禁用费率
 * @param {string} id 费率ID
 * @param {number} status 状态（1-启用，0-禁用）
 * @returns {Promise} 返回Promise对象，包含操作结果
 */
export function toggleRateStatus(id, status) {
  return request({
    url: `/admin/rate/${id}/toggle-status`,
    method: 'put',
    data: { status }
  });
}

/**
 * 获取当前有效费率
 * @param {string} userType 用户类型
 * @returns {Promise} 返回Promise对象，包含当前有效费率
 */
export function getCurrentRate(userType) {
  return request({
    url: '/admin/rate/current',
    method: 'get',
    params: { user_type: userType }
  });
}

/**
 * 查询费率历史
 * @param {Object} params 查询参数
 * @param {string} params.userType 用户类型（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含费率历史
 */
export function getRateHistory(params) {
  return request({
    url: '/admin/rate/history',
    method: 'get',
    params
  });
} 