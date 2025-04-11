import request from '@/utils/request'

export function getFeedbackDetail(id) {
  return request({
    url: `/feedback/${id}`,
    method: 'get'
  })
}

export function updateFeedback(data) {
  return request({
    url: '/feedback',
    method: 'put',
    data
  })
} 