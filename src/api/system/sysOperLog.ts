import request from '@/utils/request';

export function page(params: any) {
  return request({
    url: '/api/system/sysOperLog/page',
    method: 'get',
    params,
  });
}
