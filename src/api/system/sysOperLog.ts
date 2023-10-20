import request from '@/utils/request'
import qs from 'qs'

export function page(params) {
  return request({
    url: '/api/system/sysOperLog/page',
    method: 'get',
    params
  })
}
