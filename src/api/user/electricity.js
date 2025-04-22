import request from '@/utils/request';

/**
 * 获取用户电费记录
 * @returns {Promise} 返回Promise对象，包含用户电费记录
 */
export function getElectricityRecords() {
  return request({
    url: '/user/electricity',
    method: 'get'
  });
} 