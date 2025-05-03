import request from '@/utils/request';

/**
 * 分页查询电表
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码（可选）
 * @param {number} params.pageSize 每页数量（可选）
 * @param {string} params.meterId 电表ID（可选）
 * @param {string} params.model 型号（可选）
 * @param {string} params.status 状态（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含电表列表数据
 */
export function queryMeterPage(params) {
  return request({
    url: '/admin/meter/page',
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
    url: `/admin/meter/detail/${meterId}`,
    method: 'get'
  });
}

/**
 * 创建电表
 * @param {Object} data 电表数据
 * @param {string} data.model 型号
 * @param {string} data.installPlace 安装地点
 * @param {string} data.installDate 安装日期
 * @param {string} data.status 状态
 * @returns {Promise} 返回Promise对象，包含创建结果
 */
export function createMeter(data) {
  return request({
    url: '/admin/meter/create',
    method: 'post',
    data
  });
}

/**
 * 编辑电表
 * @param {Object} data 电表数据
 * @param {number} data.meterId 电表ID
 * @param {string} data.model 型号（可选）
 * @param {string} data.installPlace 安装地点（可选）
 * @param {string} data.installDate 安装日期（可选）
 * @param {string} data.status 状态（可选）
 * @param {string} data.idCardNo 身份证号（可选）
 * @returns {Promise} 返回Promise对象，包含编辑结果
 */
export function editMeter(data) {
  return request({
    url: '/admin/meter/edit',
    method: 'post',
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
    url: `/admin/meter/delete/${meterId}`,
    method: 'put'
  });
}

/**
 * 获取电表型号列表
 * @returns {Promise} 返回Promise对象，包含电表型号列表
 */
export function getMeterModel() {
  return request({
    url: '/admin/meter/model',
    method: 'get'
  });
}

/**
 * 电表检查
 * @param {Object} data 检查数据
 * @param {string} data.meterId 电表ID
 * @param {string} data.inspectionType 检查类型
 * @param {string} data.inspectionTime 检查时间
 * @param {string} data.inspectionStatus 检查状态
 * @param {string} data.inspectionResult 检查结果
 * @param {string} data.inspectorName 检查人
 * @param {string} data.faultDescription 故障描述（可选）
 * @param {string} data.solution 解决方案（可选）
 * @param {number} data.repairCost 维修费用（可选）
 * @param {string} data.remark 备注（可选）
 * @param {string} data.nextInspectionTime 下次检查时间（可选）
 * @returns {Promise} 返回Promise对象，包含检查结果
 */
export function inspectionCreate(data) {
  return request({
    url: `/admin/meter/inspection`,
    method: 'post',
    data
  });
}

/**
 * 获取电表维修历史记录
 * @param {string} meterId 电表ID
 * @returns {Promise} 返回Promise对象，包含电表维修历史记录
 */
export function getMeterInspectionHistory(meterId) {
  return request({
    url: `/admin/meter/inspection/${meterId}`,
    method: 'get'
  });
}

/**
 * 获取电表数据统计
 * @param {string} meterId 电表ID
 * @returns {Promise} 返回Promise对象，包含电表数据统计
 */
export function getMeterData(meterId) {
  return request({
    url: `/admin/meter/data/${meterId}`,
    method: 'get'
  });
} 