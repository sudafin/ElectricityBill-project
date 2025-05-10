import request from '@/utils/request';

/**
 * 获取用电趋势数据
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（YYYY-MM-DD）
 * @param {string} params.endDate 结束日期（YYYY-MM-DD）
 * @param {string} params.type 数据类型（daily/weekly/monthly，可选）
 * @returns {Promise} 返回Promise对象，包含用电趋势数据
 */
export function getElectricityTrend(params) {
  return request({
    url: '/api/user/analysis/trend',
    method: 'get',
    params
  });
}

/**
 * 获取年度用电分析
 * @param {Object} params 查询参数
 * @param {number} params.year 年份
 * @returns {Promise} 返回Promise对象，包含年度用电分析数据
 */
export function getYearlyAnalysis(params) {
  return request({
    url: '/api/user/analysis/yearly',
    method: 'get',
    params
  });
}

/**
 * 获取用电对比数据
 * @param {Object} params 查询参数
 * @param {number} params.year 年份
 * @param {number} params.prevYear 对比年份（可选）
 * @returns {Promise} 返回Promise对象，包含用电对比数据
 */
export function getElectricityComparison(params) {
  return request({
    url: '/api/user/analysis/comparison',
    method: 'get',
    params
  });
}

/**
 * 获取节能建议
 * @param {Object} params 查询参数
 * @param {number} params.limit 获取数量限制（可选）
 * @returns {Promise} 返回Promise对象，包含节能建议
 */
export function getEnergySavingTips(params) {
  return request({
    url: '/api/user/analysis/tips',
    method: 'get',
    params
  });
}

/**
 * 获取用电时段分布
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（YYYY-MM-DD，可选）
 * @param {string} params.endDate 结束日期（YYYY-MM-DD，可选）
 * @returns {Promise} 返回Promise对象，包含用电时段分布数据
 */
export function getTimeDistribution(params) {
  return request({
    url: '/api/user/analysis/time-distribution',
    method: 'get',
    params
  });
}

/**
 * 获取用电类型分布
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（YYYY-MM-DD，可选）
 * @param {string} params.endDate 结束日期（YYYY-MM-DD，可选）
 * @returns {Promise} 返回Promise对象，包含用电类型分布数据
 */
export function getTypeDistribution(params) {
  return request({
    url: '/api/user/analysis/type-distribution',
    method: 'get',
    params
  });
} 