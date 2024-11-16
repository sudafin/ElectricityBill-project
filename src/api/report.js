import request from '@/utils/request';

export function getReportData(params) {
  return request({
    url: '/report/data',
    method: 'get',
    params,
  });
}

export function generateReport(data) {
  return request({
    url: '/report/generate',
    method: 'post',
    data,
  });
} 