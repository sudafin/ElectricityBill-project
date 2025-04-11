import request from '@/utils/request';

/**
 * 获取电表列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMeterList(params) {
  return request({
    url: '/admin/meter/list',
    method: 'get',
    params
  });
}

/**
 * 获取电表详情
 * @param {String|Number} id - 电表ID
 * @returns {Promise}
 */
export function getMeterDetail(id) {
  return request({
    url: `/admin/meter/${id}`,
    method: 'get'
  });
}

/**
 * 创建电表
 * @param {Object} data - 电表数据
 * @returns {Promise}
 */
export function createMeter(data) {
  return request({
    url: '/admin/meter',
    method: 'post',
    data
  });
}

/**
 * 更新电表
 * @param {String|Number} id - 电表ID
 * @param {Object} data - 电表数据
 * @returns {Promise}
 */
export function updateMeter(id, data) {
  return request({
    url: `/admin/meter/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除电表
 * @param {String|Number} id - 电表ID
 * @returns {Promise}
 */
export function deleteMeter(id) {
  return request({
    url: `/admin/meter/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除电表
 * @param {Array} ids - 电表ID数组
 * @returns {Promise}
 */
export function batchDeleteMeters(ids) {
  return request({
    url: '/admin/meter/batch',
    method: 'delete',
    data: { ids }
  });
}

/**
 * 绑定用户
 * @param {String|Number} meterId - 电表ID
 * @param {String|Number} userId - 用户ID
 * @returns {Promise}
 */
export function bindUser(meterId, userId) {
  return request({
    url: '/admin/meter/bind',
    method: 'post',
    data: {
      meterId,
      userId
    }
  });
}

/**
 * 解绑用户
 * @param {String|Number} meterId - 电表ID
 * @returns {Promise}
 */
export function unbindUser(meterId) {
  return request({
    url: `/admin/meter/unbind/${meterId}`,
    method: 'post'
  });
}

/**
 * 获取电表数据
 * @param {String|Number} meterId - 电表ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMeterData(meterId, params) {
  return request({
    url: `/admin/meter/data/${meterId}`,
    method: 'get',
    params
  });
}

/**
 * 获取电表读数历史
 * @param {string} meterId 电表ID
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含电表读数历史
 */
export function getMeterReadingHistory(meterId, params) {
  return request({
    url: `/api/admin/meters/${meterId}/readings`,
    method: 'get',
    params
  });
}

/**
 * 手动录入电表读数
 * @param {string} meterId 电表ID
 * @param {Object} data 读数数据
 * @param {number} data.reading 读数值
 * @param {string} data.readingDate 读数日期
 * @param {string} data.remark 备注（可选）
 * @returns {Promise} 返回Promise对象，包含录入结果
 */
export function addMeterReading(meterId, data) {
  return request({
    url: `/api/admin/meters/${meterId}/readings`,
    method: 'post',
    data
  });
}

/**
 * 获取电表状态统计
 * @returns {Promise} 返回Promise对象，包含电表状态统计
 */
export function getMeterStatistics() {
  return request({
    url: '/api/admin/meters/statistics',
    method: 'get'
  });
} 