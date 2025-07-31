import {InternalAxiosRequestConfig} from "axios";

export interface BaseEntity {
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  delFlag?: number;
}

export interface ResultBody<T = any> {
  code?: number;
  msg?: string;
  data?: T;
  path?: string;
  timestamp?: number;
}

export interface EuAxiosRequestConfig<D = any> extends InternalAxiosRequestConfig<D> {
  silent?: boolean;
}

export interface LoginBody {
  username: string;
  password: string;
  uuid: string;
  code: string;
}
