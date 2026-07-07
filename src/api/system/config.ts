import request from '@/utils/request';

export function page(params: any) {
  return request({
    url: '/api/system/config/page',
    method: 'get',
    params,
  });
}

export function add(data: any) {
  return request({
    url: '/api/system/config',
    method: 'post',
    data,
  });
}

export function update(data: any) {
  return request({
    url: '/api/system/config',
    method: 'put',
    data,
  });
}

export function batchDel(ids: any[]) {
  return request({
    url: '/api/system/config/batch',
    method: 'delete',
    data: ids,
  });
}

export function getConfigKey(configKey: string) {
  return request({
    url: `/api/system/config/configKey/${configKey}`,
    method: 'get',
  });
}
