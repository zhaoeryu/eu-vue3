import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/post/page',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/post',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/post',
    method: 'put',
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/post/batch',
    method: 'delete',
    data: ids
  })
}
