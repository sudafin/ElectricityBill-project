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
    url: '/admin/role/list',
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

/**
 * 分页查询角色
 * @param {Object} params 查询参数
 * @param {number} params.pageNo 页码（可选）
 * @param {number} params.pageSize 每页数量（可选）
 * @param {string} params.account 账号（可选）
 * @param {string} params.adminId 管理员ID（可选）
 * @param {string} params.role 角色（可选）
 * @param {string} params.startDate 开始日期（可选）
 * @param {string} params.endDate 结束日期（可选）
 * @param {boolean} params.isAsc 是否升序（可选）
 * @param {string} params.sortBy 排序字段（可选）
 * @returns {Promise} 返回Promise对象，包含角色列表数据
 */
export function queryPage(params) {
  return request({
    url: '/admin/role/page',
    method: 'get',
    params
  })
}

/**
 * 获取角色详情
 * @param {number} id 角色ID
 * @returns {Promise} 返回Promise对象，包含角色详情
 */
export function editRoleAndAdminDetail(id) {
  return request({
    url: `/admin/role/detail/${id}`,
    method: 'get'
  })
}

/**
 * 创建角色
 * @param {Object} data 角色数据
 * @returns {Promise} 返回Promise对象，包含创建结果
 */
export function createRole(data) {
  return request({
    url: '/admin/role/create',
    method: 'post',
    data
  })
}

/**
 * 编辑角色
 * @param {number} id 角色ID
 * @param {Object} data 角色数据
 * @returns {Promise} 返回Promise对象，包含编辑结果
 */
export function editRole(id, data) {
  return request({
    url: `/admin/role/edit/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 * @param {Array} ids 角色ID数组
 * @returns {Promise} 返回Promise对象，包含删除结果
 */
export function deleteAdmins(ids) {
  return request({
    url: '/admin/role/delete',
    method: 'delete',
    params: { ids }
  })
}

/**
 * 修改角色状态
 * @param {number} id 角色ID
 * @returns {Promise} 返回Promise对象，包含修改结果
 */
export function status(id) {
  return request({
    url: `/admin/role/status/${id}`,
    method: 'put'
  })
}

/**
 * 获取角色列表
 * @returns {Promise} 返回Promise对象，包含角色列表
 */
export function roleList() {
  return request({
    url: '/admin/role/roleList',
    method: 'get'
  })
}