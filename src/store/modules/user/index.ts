import {defineStore} from 'pinia';
import {UserState} from "./types";
import type {LoginBody} from "@/api/types";
import {getInfo, login, logout} from "@/api/system/login";
import {getToken, removeToken, setToken} from "@/utils/auth";

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken(),
    user: {},
    roles: [],
    permissions: []
  }),
  getters: {},
  actions: {
    login(loginBody: LoginBody) {
      return new Promise((resolve, reject) => {
        login(loginBody).then((res) => {
          if (res.code != 200) {
            reject(res.msg)
            return
          }
          setToken(res.data)
          this.token = res.data
          resolve()
        }).catch(error => {
          removeToken()
          reject(error)
        })
      })
    },
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          let roles = res.data.roles
          if (!roles || !roles.length) {
            roles = ['ROLE_DEFAULT']
          }

          this.user = res.data.user || {}
          this.roles = roles
          this.permissions = res.data.permissions || []
          resolve(res.data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    logout() {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        }).finally(() => {
          // 清空登录状态
          this.token = ''
          this.user = {}
          this.roles = []
          this.permissions = []
          removeToken()
        })
      })
    }
  }
})

export default useUserStore
