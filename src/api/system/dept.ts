import request from '@/utils/request'

export function list(params) {
  return request({
    url: '/api/system/dept/list',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/dept',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/dept',
    method: 'put',
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/dept/batch',
    method: 'delete',
    data: ids
  })
}
