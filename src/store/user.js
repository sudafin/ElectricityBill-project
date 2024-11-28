import { defineStore } from 'pinia';
import { login } from '@/api/user';
import { setToken } from '@/utils/auth';

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
        this.token = res.data.token;
        this.adminInfo = res.data.adminDTO;
        setToken(res.data.token);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    setPublicKey(publicKey) {
      this.publicKey = publicKey;
    },
    // ...
  },
}); 