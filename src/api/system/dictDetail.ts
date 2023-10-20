import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/dict-detail/page',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/dict-detail',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/dict-detail',
    method: 'put',
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/dict-detail/batch',
    method: 'delete',
    data: ids
  })
}

export function listByDictKey(dictKey) {
  return request({
    url: '/api/system/dict-detail/listByDictKey',
    method: 'get',
    params: {
      dictKey
    }
  })
}
