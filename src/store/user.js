import { defineStore } from 'pinia';
import { login, logout } from '@/api/user';
import { setToken, removeToken, getToken, setAdminInfo, removeAdminInfo, getAdminInfo } from '@/utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    adminInfo: getAdminInfo() || {},
    publicKey: '',
  }),
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm);
        console.log(res);
        this.token = res.token;
        this.adminInfo = res.adminDTO;
        setToken(res.token);
        setAdminInfo(res.adminDTO);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    // 退出登录
    async logout() {
      try {
        await logout();
        this.token = '';
        this.adminInfo = {};
        removeToken();
        removeAdminInfo();
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