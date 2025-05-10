import request from '@/utils/request';

/**
 * 获取账户余额
 * @returns {Promise} 返回Promise对象，包含账户余额信息
 */
export function getAccountBalance() {
  return request({
    url: '/api/user/account/balance',
    method: 'get'
  });
}

/**
 * 获取账户信息
 * @returns {Promise} 返回Promise对象，包含账户基本信息
 */
export function getAccountInfo() {
  return request({
    url: '/api/user/account/info',
    method: 'get'
  });
}

/**
 * 更新账户信息
 * @param {Object} data 账户信息
 * @param {string} data.phone 手机号（可选）
 * @param {string} data.email 邮箱（可选）
 * @param {string} data.address 地址（可选）
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function updateAccountInfo(data) {
  return request({
    url: '/api/user/account/info',
    method: 'put',
    data
  });
}

/**
 * 修改密码
 * @param {Object} data 密码信息
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 * @param {string} data.confirmPassword 确认新密码
 * @returns {Promise} 返回Promise对象，包含更新结果
 */
export function changePassword(data) {
  return request({
    url: '/api/user/account/password',
    method: 'put',
    data
  });
}

/**
 * 账户充值
 * @param {Object} data 充值信息
 * @param {number} data.amount 充值金额
 * @param {string} data.paymentMethod 支付方式
 * @returns {Promise} 返回Promise对象，包含充值结果
 */
export function accountRecharge(data) {
  return request({
    url: '/api/user/account/recharge',
    method: 'post',
    data
  });
}

/**
 * 绑定电表
 * @param {Object} data 电表信息
 * @param {string} data.meterNo 电表编号
 * @param {string} data.location 安装位置
 * @returns {Promise} 返回Promise对象，包含绑定结果
 */
export function bindMeter(data) {
  return request({
    url: '/api/user/account/bind-meter',
    method: 'post',
    data
  });
} 