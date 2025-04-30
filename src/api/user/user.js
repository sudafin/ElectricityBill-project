import request from '@/utils/request';

/**
 * 获取公钥
 * @returns {Promise} 返回Promise对象，包含公钥
 */
export function getPublicKey() {
  return request({
    url: '/login',
    method: 'get',
    responseType: 'text',
  });
}

/**
 * 获取验证码
 * @param {string} uuid 唯一标识
 * @returns {Promise} 返回Promise对象，包含验证码图片
 */
export function getCaptcha(uuid) {
  return request({
    url: '/login/captcha',
    method: 'get',
    params: { key: uuid },
    responseType: 'blob',
  });
}

/**
 * 用户登录
 * @param {Object} data 登录信息
 * @returns {Promise} 返回Promise对象
 */
export function login(data) {
  return request({
    url: '/login/user',
    method: 'post',
    data,
  });
}

/**
 * 用户退出登录
 * @returns {Promise} 返回Promise对象
 */
export function logout() {
  return request({
    url: '/login/logout',
    method: 'post',
  });
}

/**
 * 刷新访问令牌
 * @returns {Promise} 返回Promise对象
 */
export function refreshAccessToken() {
  return request({
    url: '/login/refresh',
    method: 'get',
    withCredentials: true
  });
}


