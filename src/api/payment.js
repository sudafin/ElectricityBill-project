import request from '@/utils/request';

export function getPaymentList(params) {
  return request({
    url: '/payment/list',
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

export function createPayment(data) {
  return request({
    url: '/payment/create',
    method: 'post',
    data,
  });
} 