import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/role/page',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/role',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/role',
    method: 'put',
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/role/batch',
    method: 'delete',
    data: ids
  })
}

export function getMenuIdsByRoleId(roleId) {
  return request({
    url: '/api/system/role/menus',
    method: 'get',
    params: {
      roleId
    }
  })
}

export function getDeptIdsByRoleId(roleId) {
  return request({
    url: '/api/system/role/depts',
    method: 'get',
    params: {
      roleId
    }
  })
}
