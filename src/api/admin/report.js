import request from '@/utils/request';

/**
 * 导出报表数据
 * @param {Object} params - 查询参数
 * @param {string} params.reportType - 报表类型（electricity/fee/region/feedback/reconciliation/userType）
 * @param {string} params.startDate - 开始时间
 * @param {string} params.endDate - 结束时间
 * @param {string} params.format - 导出格式（excel/pdf，默认excel）
 * @returns {Promise}
 */
export function exportReport(params) {
  return request({
    url: '/admin/report/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

