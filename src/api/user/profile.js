import request from '@/utils/request';

/**
 * 获取用户个人信息
 * @returns {Promise<Object>} 返回用户信息的Promise
 */
export function getUserProfile() {
  return request({
    url: '/user/profile',
    method: 'get'
  });
}

/**
 * 更新用户个人信息
 * @param {Object} data 用户信息数据
 * @returns {Promise<Object>} 返回更新结果的Promise
 */
export function updateUserProfile(data) {
  return request({
    url: '/user/profile/update',
    method: 'put',
    data
  });
}

/**
 * 修改用户密码
 * @param {Object} data 密码修改数据
 * @param {string} data.currentPassword 当前密码
 * @param {string} data.newPassword 新密码
 * @param {string} data.confirmPassword 确认密码
 * @returns {Promise<Object>} 返回修改结果的Promise
 */
export function changePassword(data) {
  return request({
    url: '/user/profile/change-password',
    method: 'put',
    data
  });
} 