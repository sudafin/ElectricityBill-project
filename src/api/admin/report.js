import request from '@/utils/request';

/**
 * 获取报表数据
 * @param {String} type - 报表类型
 * @param {String} startDate - 开始日期
 * @param {String} endDate - 结束日期
 * @returns {Promise}
 */
export function getReportData(type, startDate, endDate) {
  return request({
    url: '/admin/report/data',
    method: 'get',
    params: {
      type,
      startDate,
      endDate
    }
  });
}

/**
 * 导出报表Excel
 * @param {String} type - 报表类型
 * @param {String} startDate - 开始日期
 * @param {String} endDate - 结束日期
 * @returns {Promise}
 */
export function getReportExcel(type, startDate, endDate) {
  return request({
    url: '/admin/report/excel',
    method: 'get',
    params: {
      type,
      startDate,
      endDate
    },
    responseType: 'blob'
  });
}

/**
 * 获取用户类型统计报表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserTypeReport(params) {
  return request({
    url: '/admin/report/user-type',
    method: 'get',
    params
  });
}

/**
 * 获取反馈信息统计报表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFeedbackReport(params) {
  return request({
    url: '/admin/report/feedback',
    method: 'get',
    params
  });
}

/**
 * 获取对账审批统计报表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getReconciliationReport(params) {
  return request({
    url: '/admin/report/reconciliation',
    method: 'get',
    params
  });
}

/**
 * 获取电量统计报表
 * @param {Object} params - 查询参数
 * @param {string} params.granularity - 时间粒度（daily/weekly/monthly/yearly）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getElectricityReport(params) {
  return request({
    url: '/admin/report/electricity',
    method: 'get',
    params
  });
}

/**
 * 获取电费统计报表
 * @param {Object} params - 查询参数
 * @param {string} params.granularity - 时间粒度（daily/weekly/monthly/yearly）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getFeeReport(params) {
  return request({
    url: '/admin/report/fee',
    method: 'get',
    params
  });
}

/**
 * 获取区域统计报表
 * @param {Object} params - 查询参数
 * @param {string} params.dataType - 数据类型（electricity/fee/users）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getRegionReport(params) {
  return request({
    url: '/admin/report/region',
    method: 'get',
    params
  });
}

/**
 * 获取报表主要指标数据（如总量、平均值、最高值等）
 * @param {Object} params - 查询参数
 * @param {string} params.type - 报表类型（electricity/fee/region/feedback/reconciliation/userType）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getReportMetrics(params) {
  return request({
    url: '/admin/report/metrics',
    method: 'get',
    params
  });
} 