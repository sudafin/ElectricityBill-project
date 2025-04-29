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

// 登录
export function login(data) {
  return request({
    url: '/login/user',
    method: 'post',
    data,
  });
}


