import type {BaseEntity} from '@/types/api';

export interface LoginInfo {
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  sex?: number;
  admin: number;
  loginIp: string;
  loginRegion: string;
  loginTime: string;
  prevLoginIp?: string;
  prevLoginRegion?: string;
  prevLoginTime?: string;
  createTime: string;
  deptId?: number;
  deptName?: string;
  deptNames?: string[];
  browser?: string;
  os?: string;
}

export interface User extends BaseEntity {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  sex?: number;
  admin: number;
  deptId?: number;
  status: number;
  loginIp: string;
  loginTime: string;
  lastActiveTime: string;
  passwordResetTime?: string;
}
