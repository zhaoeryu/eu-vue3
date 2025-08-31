import type {BaseEntity} from '@/types/api';

export interface Online extends BaseEntity {
  id: string;
  username: string;
  nickname: string;
  loginIp: string;
  loginRegion: string;
  loginTime: string;
  browser: string;
  os: string;
}
