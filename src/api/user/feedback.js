import request from '@/utils/request';

/**
 * 获取反馈类型列表
 * @returns {Promise<string[]>} 返回反馈类型字符串列表
 */
export function getFeedbackTypes() {
  return request({
    url: '/user/feedback/types',
    method: 'get'
  });
}

/**
 * 提交用户反馈
 * @param {Object} data - 反馈数据
 * @param {string} data.category - 反馈类型
 * @param {string} data.title - 反馈标题
 * @param {string} data.content - 反馈内容
 * @param {string} data.contact - 联系方式
 * @returns {Promise} 返回提交结果
 */
export function submitFeedback(data) {
  return request({
    url: '/user/feedback/submit',
    method: 'post',
    data
  });
} 