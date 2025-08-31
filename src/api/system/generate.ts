import type { PageResult, ResultBody } from '@/types/api';
import type { GenerateTable } from '@/types/system/generate';
import request from '@/utils/request';

export function page(params: any): Promise<ResultBody<PageResult<GenerateTable>>> {
  return request({
    url: '/api/gen/page',
    method: 'get',
    params,
  });
}
export function preview(params: any) {
  return request({
    url: '/api/gen/preview',
    method: 'get',
    params,
  });
}
export function tableInfo(params: any) {
  return request({
    url: '/api/gen/tableInfo',
    method: 'get',
    params,
  });
}
export function syncTable(params: any) {
  return request({
    url: '/api/gen/sync',
    method: 'post',
    params,
  });
}
export function save(data: any) {
  return request({
    url: '/api/gen/save',
    method: 'post',
    data,
  });
}
export function queryTypeList() {
  return request({
    url: '/api/gen/queryType',
    method: 'get',
  });
}
export function formTypeList() {
  return request({
    url: '/api/gen/formType',
    method: 'get',
  });
}
