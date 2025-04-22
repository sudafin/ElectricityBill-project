import request from '@/utils/request';

/**
 * 获取电表列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.keyword 搜索关键词（可选）
 * @param {string} params.status 电表状态（可选）
 * @param {string} params.bindStatus 绑定状态（可选）
 * @param {string} params.startDate 安装开始日期（可选）
 * @param {string} params.endDate 安装结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含电表列表和总数
 */
export function getMeterList(params) {
  return request({
    url: '/api/meters',
    method: 'get',
    params
  });
}

/**
 * 获取电表详情
 * @param {string} id 电表ID
 * @returns {Promise} 返回Promise对象，包含电表详情
 */
export function getMeterDetail(id) {
  return request({
    url: `/api/meters/${id}`,
    method: 'get'
  });
}

/**
 * 添加电表
 * @param {Object} data 电表数据
 * @param {string} data.meterNo 电表编号
 * @param {string} data.model 电表型号
 * @param {string} data.installDate 安装日期
 * @param {string} data.status 状态
 * @returns {Promise} 返回Promise对象，包含添加结果
 */
export function addMeter(data) {
  return request({
    url: '/api/meters',
    method: 'post',
    data
  });
}

/**
 * 更新电表信息
 * @param {Object} data 电表数据
 * @param {string} data.id 电表ID
 * @param {string} data.meterNo 电表编号（可选）
 * @param {string} data.model 电表型号（可选）
 * @param {string} data.installDate 安装日期（可选）
 * @param {string} data.status 状态（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateMeter(data) {
  return request({
    url: `/api/meters/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 删除电表
 * @param {string} id 电表ID
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteMeter(id) {
  return request({
    url: `/api/meters/${id}`,
    method: 'delete'
  });
}

/**
 * 批量删除电表
 * @param {Array} ids 电表ID数组
 * @returns {Promise} 返回Promise对象，包含批量删除结果
 */
export function batchDeleteMeters(ids) {
  return request({
    url: '/api/meters/batch-delete',
    method: 'post',
    data: { ids }
  });
}

/**
 * 绑定电表到用户
 * @param {Object} data 绑定数据
 * @param {string} data.meterId 电表ID
 * @param {string} data.userId 用户ID
 * @returns {Promise} 返回Promise对象，包含绑定结果
 */
export function bindMeterToUser(data) {
  return request({
    url: '/api/meters/bind-user',
    method: 'post',
    data
  });
}

/**
 * 解绑用户电表
 * @param {string} meterId 电表ID
 * @returns {Promise} 返回Promise对象，包含解绑结果
 */
export function unbindMeter(meterId) {
  return request({
    url: `/api/meters/${meterId}/unbind`,
    method: 'post'
  });
}

/**
 * 获取电表读数历史
 * @param {string} meterId 电表ID
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含电表读数历史
 */
export function getMeterReadings(meterId, params) {
  return request({
    url: `/api/meters/${meterId}/readings`,
    method: 'get',
    params
  });
}

/**
 * 添加电表读数
 * @param {string} meterId 电表ID
 * @param {Object} data 读数数据
 * @param {number} data.reading 读数值
 * @param {string} data.readingDate 读数日期
 * @param {string} data.remark 备注（可选）
 * @returns {Promise} 返回Promise对象，包含添加结果
 */
export function addMeterReading(meterId, data) {
  return request({
    url: `/api/meters/${meterId}/readings`,
    method: 'post',
    data
  });
}

/**
 * 获取电表异常记录
 * @param {string} meterId 电表ID
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise} 返回Promise对象，包含电表异常记录
 */
export function getMeterAbnormalRecords(meterId, params) {
  return request({
    url: `/api/meters/${meterId}/abnormal-records`,
    method: 'get',
    params
  });
} 