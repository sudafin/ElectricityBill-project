import request from '@/utils/request';

/**
 * 搜索帮助内容
 * @param {Object} params 查询参数
 * @param {string} params.query 搜索关键词
 * @returns {Promise} 返回Promise对象，包含搜索结果
 */
export function searchHelp(params) {
  return request({
    url: '/api/user/help/search',
    method: 'get',
    params
  });
}

/**
 * 获取分类问题列表
 * @param {string} categoryId 分类ID
 * @returns {Promise} 返回Promise对象，包含分类问题列表
 */
export function getCategoryFAQs(categoryId) {
  return request({
    url: `/api/user/help/category/${categoryId}`,
    method: 'get'
  });
}

/**
 * 提交问题反馈
 * @param {Object} data 反馈数据
 * @param {string} data.faqId 问题ID
 * @param {boolean} data.helpful 是否有帮助
 * @param {string} data.comment 反馈意见（可选）
 * @returns {Promise} 返回Promise对象，包含提交结果
 */
export function submitFeedback(data) {
  return request({
    url: '/api/user/help/feedback',
    method: 'post',
    data
  });
}

/**
 * 提交问题反馈表单
 * @param {Object} data 表单数据
 * @param {string} data.title 问题标题
 * @param {string} data.content 问题描述
 * @param {string} data.category 问题分类
 * @param {string} data.contact 联系方式（可选）
 * @param {Array} data.attachments 附件列表（可选）
 * @returns {Promise} 返回Promise对象，包含提交结果
 */
export function submitFeedbackForm(data) {
  return request({
    url: '/api/user/help/feedback-form',
    method: 'post',
    data
  });
}

/**
 * 获取热门问题
 * @param {Object} params 查询参数
 * @param {number} params.limit 获取数量限制（可选）
 * @returns {Promise} 返回Promise对象，包含热门问题列表
 */
export function getHotQuestions(params) {
  return request({
    url: '/api/user/help/hot-questions',
    method: 'get',
    params
  });
}

/**
 * 获取所有帮助分类
 * @returns {Promise} 返回Promise对象，包含所有帮助分类
 */
export function getAllCategories() {
  return request({
    url: '/api/user/help/categories',
    method: 'get'
  });
}

/**
 * 获取操作指南
 * @param {string} guideId 指南ID（可选）
 * @returns {Promise} 返回Promise对象，包含操作指南
 */
export function getOperationGuide(guideId) {
  return request({
    url: '/api/user/help/guides',
    method: 'get',
    params: guideId ? { guideId } : {}
  });
} 