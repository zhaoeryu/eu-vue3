import { defineStore } from 'pinia';

import { getInfo, login, logout } from '@/api/system/login';
import { getToken, removeToken, setToken } from '@/utils/auth';
import type { LoginInfo } from '@/types/system/user';

interface UserState {
  token: string | null;
  user: LoginInfo;
  roles: Array<string>;
  permissions: Array<string>;
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken(),
    user: {} as LoginInfo,
    roles: [],
    permissions: [],
  }),
  getters: {},
  actions: {
    login(loginBody: any) {
      return new Promise((resolve, reject) => {
        login(loginBody)
          .then((res) => {
            if (res.code != 200) {
              reject(res.msg);
              return;
            }
            setToken(res.data);
            this.token = res.data;
            resolve({
              token: res.data,
            });
          })
          .catch((error) => {
            removeToken();
            reject(error);
          });
      });
    },
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            let roles = res.data.roles;
            if (!roles || !roles.length) {
              roles = ['ROLE_DEFAULT'];
            }

            this.user = res.data.user || {};
            this.roles = roles;
            this.permissions = res.data.permissions || [];
            resolve(res.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    logout() {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            resolve({});
          })
          .catch((error) => {
            reject(error);
          })
          .finally(() => {
            // 清空登录状态
            this.token = '';
            this.user = {} as LoginInfo;
            this.roles = [];
            this.permissions = [];
            removeToken();
          });
      });
    },
  },
});

export default useUserStore;
