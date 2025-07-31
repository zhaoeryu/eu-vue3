import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/sysOperLog/page',
    method: 'get',
    params
  })
}
