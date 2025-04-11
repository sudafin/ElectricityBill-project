import request from '@/utils/request';

/**
 * 获取管理员列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getAdminList(params) {
  return request({
    url: '/admin/role/admin/list',
    method: 'get',
    params
  });
}

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getRoleList(params) {
  return request({
    url: '/admin/role/list',
    method: 'get',
    params
  });
}

/**
 * 获取管理员详情
 * @param {String|Number} id - 管理员ID
 * @returns {Promise}
 */
export function getAdminDetail(id) {
  return request({
    url: `/admin/role/admin/${id}`,
    method: 'get'
  });
}

/**
 * 获取权限列表
 * @returns {Promise}
 */
export function getPermissionList() {
  return request({
    url: '/admin/role/permission/list',
    method: 'get'
  });
}

/**
 * 创建管理员
 * @param {Object} data - 管理员数据
 * @returns {Promise}
 */
export function createAdmin(data) {
  return request({
    url: '/admin/role/admin',
    method: 'post',
    data
  });
}

/**
 * 更新管理员
 * @param {String|Number} id - 管理员ID
 * @param {Object} data - 管理员数据
 * @returns {Promise}
 */
export function updateAdmin(id, data) {
  return request({
    url: `/admin/role/admin/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除管理员
 * @param {String|Number} id - 管理员ID或ID列表
 * @returns {Promise}
 */
export function deleteAdmin(id) {
  return request({
    url: `/admin/role/admin/${id}`,
    method: 'delete'
  });
}

/**
 * 更新管理员状态
 * @param {String|Number} id - 管理员ID
 * @returns {Promise}
 */
export function updateStatus(id) {
  return request({
    url: `/admin/role/admin/status/${id}`,
    method: 'put'
  });
}

/**
 * 获取公钥
 * @returns {Promise}
 */
export function getPublicKey() {
  return request({
    url: '/admin/role/public-key',
    method: 'get'
  });
}