import { defineStore } from 'pinia';

import { getInfo, login, logout } from '@/api/system/login';
import type { LoginInfo } from '@/types/system/user';
import { getToken, removeToken, setToken } from '@/utils/auth';

interface UserState {
  token: string | null;
  user: LoginInfo;
  roles: string[];
  permissions: string[];
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
              reject(new Error(res.msg));
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
            reject(new Error(error));
          });
      });
    },
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            let roles = res.data.roles;
            if (!roles?.length) {
              roles = ['ROLE_DEFAULT'];
            }

            this.user = res.data.user || {};
            this.roles = roles;
            this.permissions = res.data.permissions || [];
            resolve(res.data);
          })
          .catch((error) => {
            reject(new Error(error));
          });
      });
    },
    logout() {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            resolve({});
          })
          .catch((err) => {
            reject(new Error(err));
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
