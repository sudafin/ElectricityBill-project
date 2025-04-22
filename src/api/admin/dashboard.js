import request from '@/utils/request'

/**
 * 获取管理端仪表盘信息
 * @returns {Promise} 返回Promise对象，包含仪表盘数据
 */
export function getAdminDashboardInfo() {
  return request({
    url: '/admin/dashboard',
    method: 'get'
  })
} 