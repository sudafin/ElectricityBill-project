import request from '@/utils/request';

/**
 * 获取控制台数据概览
 * @returns {Promise} 返回Promise对象，包含控制台数据概览
 */
export function getDashboardOverview() {
  return request({
    url: '/api/admin/statistics/dashboard',
    method: 'get'
  });
}

/**
 * 获取收入统计
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.period 周期类型（day/week/month/year，默认month）
 * @returns {Promise} 返回Promise对象，包含收入统计数据
 */
export function getRevenueStatistics(params) {
  return request({
    url: '/api/admin/statistics/revenue',
    method: 'get',
    params
  });
}

/**
 * 获取用电量统计
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.period 周期类型（day/week/month/year，默认month）
 * @returns {Promise} 返回Promise对象，包含用电量统计数据
 */
export function getElectricityUsageStatistics(params) {
  return request({
    url: '/api/admin/statistics/electricity-usage',
    method: 'get',
    params
  });
}

/**
 * 获取用户增长统计
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.period 周期类型（day/week/month/year，默认month）
 * @returns {Promise} 返回Promise对象，包含用户增长统计数据
 */
export function getUserGrowthStatistics(params) {
  return request({
    url: '/api/admin/statistics/user-growth',
    method: 'get',
    params
  });
}

/**
 * 获取支付方式分布
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含支付方式分布数据
 */
export function getPaymentMethodDistribution(params) {
  return request({
    url: '/api/admin/statistics/payment-method',
    method: 'get',
    params
  });
}

/**
 * 获取用户地域分布
 * @returns {Promise} 返回Promise对象，包含用户地域分布数据
 */
export function getUserRegionDistribution() {
  return request({
    url: '/api/admin/statistics/user-region',
    method: 'get'
  });
}

/**
 * 获取账单支付率统计
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {string} params.period 周期类型（day/week/month/year，默认month）
 * @returns {Promise} 返回Promise对象，包含账单支付率统计数据
 */
export function getBillPaymentRateStatistics(params) {
  return request({
    url: '/api/admin/statistics/bill-payment-rate',
    method: 'get',
    params
  });
}

/**
 * 获取峰谷用电分布
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @returns {Promise} 返回Promise对象，包含峰谷用电分布数据
 */
export function getPeakValleyDistribution(params) {
  return request({
    url: '/api/admin/statistics/peak-valley',
    method: 'get',
    params
  });
}

/**
 * 导出统计报表
 * @param {Object} params 查询参数
 * @param {string} params.type 报表类型（revenue/usage/payment/user）
 * @param {string} params.startDate 开始日期
 * @param {string} params.endDate 结束日期
 * @param {string} params.format 导出格式（excel/pdf，默认excel）
 * @returns {Promise} 返回Promise对象，包含导出文件
 */
export function exportReport(params) {
  return request({
    url: '/api/admin/statistics/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
} 