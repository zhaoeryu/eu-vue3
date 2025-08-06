import request from '@/utils/request'
import {type ResultBody} from "@/types/api";
import type {LoginInfo} from "@/types/system/user";

export function login(data: any): Promise<ResultBody<string>> {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function captcha(): Promise<ResultBody<{
  uuid: string
  img: string
}>> {
  return request({
    url: '/api/auth/captcha',
    method: 'get'
  })
}

export function getInfo(): Promise<ResultBody<{
  roles: string[],
  permissions: string[],
  user: LoginInfo
}>> {
  return request({
    url: '/api/auth/info',
    method: 'get',
    silent: true
  })
}

export function logout() {
  return request({
    url: '/api/auth/logout',
    method: 'post'
  })
}
