import request from '@/utils/request'
import type {LoginBody} from "@/api/types";

export function login(data: LoginBody) {
    return request({
        url: '/api/auth/login',
        method: 'post',
        data
    })
}
export function captcha() {
    return request({
        url: '/api/auth/captcha',
        method: 'get'
    })
}

export function getInfo() {
    return request({
        url: '/api/auth/info',
        method: 'get'
    })
}

export function logout() {
    return request({
        url: '/api/auth/logout',
        method: 'post'
    })
}
