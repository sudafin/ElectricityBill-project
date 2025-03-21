import request from '@/utils/request';

export function getPaymentList(params) {
  return request({
    url: '/payment/page',
    method: 'get',
    params,
  });
}

export function getPaymentDetail(id) {
  return request({
    url: `/payment/detail/${id}`,
    method: 'get',
  });
}

export function deletePayment(Ids) {
  return request({
    url: `/payment/delete`,
    method: 'delete',
    params: {
      ids: Ids
    }
  });
}
export function refundPayment(id) {
  return request({
    url: `/payment/refund/${id}`,
    method: 'put',
  });
}

//获取报表excel
export function getPaymentReport() {
  return request({
    url: '/payment/export',
    method: 'get',
    responseType: 'blob',  // 设置响应类型为 Blob，用于处理文件下载
  });
}
