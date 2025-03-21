import request from '@/utils/request';

/**
 * 获取电表列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.keyword 搜索关键词（可选）
 * @param {string} params.status 电表状态（可选）
 * @returns {Promise} 返回Promise对象，包含电表列表
 */
export function getMeterList(params) {
  return request({
    url: '/api/admin/meters',
    method: 'get',
    params
  });
}

/**
 * 获取电表详情
 * @param {string} meterId 电表ID
 * @returns {Promise} 返回Promise对象，包含电表详情
 */
export function getMeterDetail(meterId) {
  return request({
    url: `/api/admin/meters/${meterId}`,
    method: 'get'
  });
}

/**
 * 添加电表
 * @param {Object} data 电表数据
 * @param {string} data.meterNo 电表编号
 * @param {string} data.meterType 电表类型
 * @param {string} data.location 安装位置
 * @param {string} data.userId 用户ID（可选）
 * @returns {Promise} 返回Promise对象，包含添加结果
 */
export function addMeter(data) {
  return request({
    url: '/api/admin/meters',
    method: 'post',
    data
  });
}

/**
 * 更新电表信息
 * @param {string} meterId 电表ID
 * @param {Object} data 更新数据
 * @param {string} data.meterType 电表类型（可选）
 * @param {string} data.location 安装位置（可选）
 * @param {string} data.status 状态（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateMeter(meterId, data) {
  return request({
    url: `/api/admin/meters/${meterId}`,
    method: 'put',
    data
  });
}

/**
 * 删除电表
 * @param {string} meterId 电表ID
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteMeter(meterId) {
  return request({
    url: `/api/admin/meters/${meterId}`,
    method: 'delete'
  });
}

/**
 * 绑定用户
 * @param {string} meterId 电表ID
 * @param {string} userId 用户ID
 * @returns {Promise} 返回Promise对象，包含绑定结果
 */
export function bindUser(meterId, userId) {
  return request({
    url: `/api/admin/meters/${meterId}/bind`,
    method: 'post',
    data: { userId }
  });
}

/**
 * 解绑用户
 * @param {string} meterId 电表ID
 * @returns {Promise} 返回Promise对象，包含解绑结果
 */
export function unbindUser(meterId) {
  return request({
    url: `/api/admin/meters/${meterId}/unbind`,
    method: 'post'
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