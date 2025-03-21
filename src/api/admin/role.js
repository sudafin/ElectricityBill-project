import request from '@/utils/request';

export function getAdminList(params) {
  return request({
    url: '/role/page',
    method: 'get',
    params,
  });
}

export function deleteAdmin(Ids) {
  return request({
    url: '/role/delete',
    method: 'delete',
    params: {
      ids: Ids
    }
  });
}

export function createRoleOrAdmin(data) {
  return request({
    url: '/role/create',
    method: 'post',
    data,
  });
}
export function getAdminDetail(Id) {
  return request({
    url: `/role/detail/${Id}`,
    method: 'get',
  });
}

export function editAdmin(id, data) {
  return request({
    url: `/role/edit/${id}`,
    method: 'put',
    data,
  });
}
export function getPermissionList(){
  return request({
    url: '/role/list',
    method: 'get',
  });
}
export function updateStatus(id){
  return request({
    url: `/role/status/${id}`,
    method: 'put',
  });
}

export function getRoleList(){
  return request({
    url: '/role/roleList',
    method: 'get',
  });
}