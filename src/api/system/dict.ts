import request from '@/utils/request';

// 查询字典数据列表
export function page(params: any) {
  return request({
    url: '/api/system/dict/page',
    method: 'get',
    params,
  });
}

export function add(data: any) {
  return request({
    url: '/api/system/dict',
    method: 'post',
    data,
  });
}
export function update(data: any) {
  return request({
    url: '/api/system/dict',
    method: 'put',
    data,
  });
}
export function batchDel(ids: any[]) {
  return request({
    url: '/api/system/dict/batch',
    method: 'delete',
    data: ids,
  });
}
