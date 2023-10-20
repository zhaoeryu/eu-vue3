import request from '@/utils/request'
import qs from 'qs'

export function page(params) {
  return request({
    url: '/api/system/sysNotice/page',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/sysNotice',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/sysNotice',
    method: 'put',
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/sysNotice/batch',
    method: 'delete',
    data: ids
  })
}

export function getById(id) {
  return request({
    url: '/api/system/sysNotice/query/' + id,
    method: 'get'
  })
}
