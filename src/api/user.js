import request from '@/utils/request';


export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data,
  });
}

export function getPublicKey() {
  return request({
    url: '/admin',
    method: 'get',
    responseType: 'text',
  });
}

export function getCaptcha(uuid) {
  return request({
    url: '/admin/captcha',
    method: 'get',
    params: { key: uuid },
    responseType: 'blob',
  });
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post',
  });
} 

export function getDashboardInfo() {
  return request({
    url: '/dashboard',
    method: 'get',
  });
}
export function getUserList(userPageQuery){
  return request({
    url: '/user/page',
    method: 'get',
    params: userPageQuery,
  });
}
export function getUserDetail(id){
  return request({
    url: `/user/detail/${id}`,
    method: 'get',
  });
}

export function createUser(data){
  return request({
    url: '/user/create',
    method: 'post',
    data,
  });
}

export function editUser(data){
  return request({
    url: '/user/edit',
    method: 'put',
    data,
  });
}

export function deleteUser(userIds) {
  return request({
    url: '/user/delete',
    method: 'delete', 
    params: { userIds: userIds },
  });
}

export function payUser(userId, money, paymentMethod){
  return request({  
    url: '/user/pay',
    method: 'put',
    params: { userId: userId, money: money, paymentMethod: paymentMethod },
  });
}

export function getUserBill(id){
  return request({
    url: `/user/bill/${id}`,
    method: 'get',
  });
}

export function refreshAccessToken() {
  return request({
    url: '/admin/refresh',
    method: 'get',
    withCredentials: true
  });
}