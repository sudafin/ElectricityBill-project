import request from '@/utils/request';

export function getReportData(reportType,startDate, endDate) {
  return request({
    url: '/report',
    method: 'get',
    params: { reportType: reportType, startDate: startDate, endDate: endDate },
  });
} 

//获取报表excel
export function getReportExcel(reportType,startDate, endDate) {
  return request({
    url: '/report/export',
    method: 'get',
    params: { reportType: reportType, startDate: startDate, endDate: endDate },
    responseType: 'blob',  // 设置响应类型为 Blob，用于处理文件下载
  });
} 