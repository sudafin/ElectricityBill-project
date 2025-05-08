import request from '@/utils/request';

export function getAdminList(params) {
  return request({
    url: '/admin/role/page',
    method: 'get',
    params,
  });
}

export function deleteAdmin(Ids) {
  return request({
    url: '/admin/role/delete',
    method: 'delete',
    params: {
      ids: Ids
    }
  });
}

/**
 * 创建角色或系统人员
 * @param {Object} data - 角色或管理员数据
 * @param {boolean} data.isRole - 是否为角色创建
 * @param {string} data.account - 账号（管理员创建时必填）
 * @param {string} data.password - 密码（管理员创建时必填）
 * @param {string} data.role - 角色名称
 * @param {string} data.roleDesc - 角色描述
 * @param {Array<number>} data.permissionIdList - 权限ID列表
 * @returns {Promise} 返回Promise对象，包含创建结果
 */
export function createRoleOrAdmin(data) {
  return request({
    url: '/admin/role/create',
    method: 'post',
    data
  });
}

export function getAdminDetail(Id) {
  return request({
    url: `admin/role/detail/${Id}`,
    method: 'get',
  });
}

export function editAdmin(id, data) {
  return request({
    url: `/admin/role/edit/${id}`,
    method: 'put',
    data,
  });
}

export function getPermissionList(){
  return request({
    url: '/admin/role/list',
    method: 'get',
  });
}

export function updateStatus(id){
  return request({
    url: `/admin/role/status/${id}`,
    method: 'put',
  });
}

export function getRoleList(){
  return request({
    url: '/admin/role/roleList',
    method: 'get',
  });
}

/**
 * 修改角色信息
 * @param {Object} data - 角色修改数据
 * @param {string} data.oldRoleName - 原角色名称
 * @param {string} data.newRoleName - 新角色名称
 * @param {string} data.roleDesc - 角色描述
 * @param {string} data.icon - 角色图标
 * @returns {Promise} 返回Promise对象，包含修改结果
 */
export function updateRole(data) {
  return request({
    url: '/admin/role/updateRole',
    method: 'put',
    data
  });
}