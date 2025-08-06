import request from '@/utils/request'

export function list(params: any) {
  return request({
    url: '/api/system/menu/list',
    method: 'get',
    params
  })
}

export function add(data: any) {
  return request({
    url: '/api/system/menu',
    method: 'post',
    data
  })
}
export function update(data: any) {
  return request({
    url: '/api/system/menu',
    method: 'put',
    data
  })
}

export function batchDel(ids: any[]) {
  return request({
    url: '/api/system/menu/batch',
    method: 'delete',
    data: ids
  })
}

export function getRouters() {
  return request({
    url: '/api/system/menu/routers',
    method: 'get'
  })
}
