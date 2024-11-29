import { defineStore } from 'pinia';
import { login, logout } from '@/api/user';
import { setToken, removeToken } from '@/utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    adminInfo: {},
    publicKey: '',
  }),
  actions: {
    async login(loginForm) {
      try {
        const res = await login(loginForm);
        console.log("res", res);
        this.token = res.token;
        this.adminInfo = res.adminDTO;
        setToken(res.token);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async logout() {
      try {
        await logout();
        this.token = '';
        this.adminInfo = {};
        removeToken();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    setPublicKey(publicKey) {
      this.publicKey = publicKey;
    },
  },
}); 