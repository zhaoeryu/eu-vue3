import request from '@/utils/request'

export function list(params?: any) {
  return request({
    url: '/api/system/dept/list',
    method: 'get',
    params
  })
}

export function add(data: any) {
  return request({
    url: '/api/system/dept',
    method: 'post',
    data
  })
}

export function update(data: any) {
  return request({
    url: '/api/system/dept',
    method: 'put',
    data
  })
}

export function batchDel(ids: any[]) {
  return request({
    url: '/api/system/dept/batch',
    method: 'delete',
    data: ids
  })
}
