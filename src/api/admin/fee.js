import request from '@/utils/request';

/**
 * 获取费用列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFeeList(params) {
  return request({
    url: '/admin/fee/list',
    method: 'get',
    params
  });
}

/**
 * 获取费用详情
 * @param {String|Number} id - 费用ID
 * @returns {Promise}
 */
export function getFeeDetail(id) {
  return request({
    url: `/admin/fee/${id}`,
    method: 'get'
  });
}

/**
 * 创建费用
 * @param {Object} data - 费用数据
 * @returns {Promise}
 */
export function createFee(data) {
  return request({
    url: '/admin/fee',
    method: 'post',
    data
  });
}

/**
 * 更新费用
 * @param {String|Number} id - 费用ID
 * @param {Object} data - 费用数据
 * @returns {Promise}
 */
export function updateFee(id, data) {
  return request({
    url: `/admin/fee/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除费用
 * @param {String|Number} id - 费用ID
 * @returns {Promise}
 */
export function deleteFee(id) {
  return request({
    url: `/admin/fee/${id}`,
    method: 'delete'
  });
}

/**
 * 根据用户ID获取费用历史
 * @param {String|Number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserFeeHistory(userId, params) {
  return request({
    url: `/admin/fee/user/${userId}/history`,
    method: 'get',
    params
  });
}

/**
 * 获取费用统计
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFeeStatistics(params) {
  return request({
    url: '/admin/fee/statistics',
    method: 'get',
    params
  });
}

export function getBillList(params) {
  return request({
    url: '/payment/page',
    method: 'get',
    params,
  });
}

export function getBillDetail(id) {
  return request({
    url: `/payment/detail/${id}`,
    method: 'get',
  });
}

export function deleteBill(Ids) {
  return request({
    url: `/payment/delete`,
    method: 'delete',
    params: {
      ids: Ids
    }
  });
}
export function refundBill(id) {
  return request({
    url: `/payment/refund/${id}`,
    method: 'put',
  });
}

//获取报表excel
export function getBillReport() {
  return request({
    url: '/payment/export',
    method: 'get',
    responseType: 'blob',  // 设置响应类型为 Blob，用于处理文件下载
  });
}
