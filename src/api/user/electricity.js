import request from '@/utils/request';

/**
 * 获取用户用电统计数据
 * @param {Object} params - 查询参数
 * @param {string} [params.startDate] - 开始日期，格式：YYYY-MM-DD
 * @param {string} [params.endDate] - 结束日期，格式：YYYY-MM-DD
 * @returns {Promise} - 返回包含总用电量、总电费和日均用电量的Promise
 */
export function getElectricityStatistics(data) {
  return request({
    url: '/user/electricity/statistics',
    method: 'post',
    data
  });
}

/**
 * 获取用户每日用电记录
 * @param {Object} params - 查询参数
 * @param {string} [params.startDate] - 开始日期，格式：YYYY-MM-DD
 * @param {string} [params.endDate] - 结束日期，格式：YYYY-MM-DD
 * @param {number} [params.days=30] - 查询天数，默认30天
 * @returns {Promise} - 返回包含日期、用电量和电费的Promise
 */
export function getDailyElectricityUsage(data) {
  return request({
    url: '/user/electricity/daily-usage',
    method: 'post',
    data
  });
}
