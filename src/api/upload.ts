import request from '@/utils/request';
import { type UploadResult } from '@/types/api';

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
