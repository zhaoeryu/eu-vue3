import request from '@/utils/request'
import {type PageResult, type ResultBody} from "@/types/api";
import {type Notice} from "@/types/system/notice";

export function page(params: any): Promise<ResultBody<PageResult<Notice>>> {
  return request({
    url: '/api/system/sysNotice/page',
    method: 'get',
    params
  })
}

export function add(data: any) {
  return request({
    url: '/api/system/sysNotice',
    method: 'post',
    data
  })
}

export function update(data: any) {
  return request({
    url: '/api/system/sysNotice',
    method: 'put',
    data
  })
}

export function batchDel(ids: any[]) {
  return request({
    url: '/api/system/sysNotice/batch',
    method: 'delete',
    data: ids
  })
}

export function getById(id: string | number) {
  return request({
    url: '/api/system/sysNotice/query/' + id,
    method: 'get'
  })
}
