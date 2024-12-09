import request from '@/utils/request';

export function getReportData(reportType,startDate, endDate) {
  return request({
    url: '/report',
    method: 'get',
    params: { reportType: reportType, startDate: startDate, endDate: endDate },
  });
} 