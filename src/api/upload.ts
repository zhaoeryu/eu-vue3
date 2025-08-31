import type {UploadResult} from '@/types/api';
import request from '@/utils/request';

export function uploadFile(data: FormData): Promise<UploadResult> {
  return request({
    url: '/api/upload/uploadFile',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  });
}
