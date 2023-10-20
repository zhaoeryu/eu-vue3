import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/job-log/page',
    method: 'get',
    params
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/job-log/batch',
    method: 'delete',
    data: ids
  })
}
