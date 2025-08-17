import request from '@/utils/request';
import type { ResultBody } from '@/types/api';
import type { DictDetail } from '@/types/system/dict';

export function page(params: any) {
  return request({
    url: '/api/system/dict-detail/page',
    method: 'get',
    params,
  });
}

export function add(data: any) {
  return request({
    url: '/api/system/dict-detail',
    method: 'post',
    data,
  });
}

export function update(data: any) {
  return request({
    url: '/api/system/dict-detail',
    method: 'put',
    data,
  });
}

export function batchDel(ids: any[]) {
  return request({
    url: '/api/system/dict-detail/batch',
    method: 'delete',
    data: ids,
  });
}

export function listByDictKey(params: any): Promise<ResultBody<DictDetail[]>> {
  return request({
    url: '/api/system/dict-detail/listByDictKey',
    method: 'get',
    params,
  });
}

export function fetchOne(params: any) {
  return request({
    url: '/api/system/dict-detail/fetchOne',
    method: 'get',
    params,
  });
}
