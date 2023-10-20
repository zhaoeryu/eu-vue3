import { STORAGE_KEY_TOKEN } from './constants'

export function getToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

export function setToken(token: string) {
  localStorage.setItem(STORAGE_KEY_TOKEN, token)
}

export function removeToken() {
  localStorage.removeItem(STORAGE_KEY_TOKEN)
}
