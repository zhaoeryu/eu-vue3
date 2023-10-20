import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/job/page',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/job',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/job',
    method: 'put',
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/job/batch',
    method: 'delete',
    data: ids
  })
}

export function pauseOrResume(data) {
  return request({
    url: '/api/system/job/pause-or-resume',
    method: 'post',
    data
  })
}
export function execJob(id) {
  return request({
    url: '/api/system/job/exec',
    method: 'post',
    params: {
      id
    }
  })
}
