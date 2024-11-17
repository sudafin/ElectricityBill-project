import request from '@/utils/request';

export function fetchReportDataAPI({ startDate, endDate }) {
  return request({
    url: '/report',
    method: 'get',
    params: { startDate, endDate },
  });
} 