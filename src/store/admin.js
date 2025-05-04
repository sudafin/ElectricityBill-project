import { defineStore } from 'pinia';
import { login, logout, refreshAccessToken } from '@/api/admin/admin';
import { setAdminToken, getAdminToken, removeAdminToken, setAdminInfo, removeAdminInfo, getAdminInfo, setAdminRefreshToken, removeAdminRefreshToken } from '@/utils/auth';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    token: getAdminToken() || '',
    adminInfo: getAdminInfo() || {},
    publicKey: '',
  }),
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm);
        this.token = res.token;
        this.adminInfo = res.loginDTO;
        setAdminToken(res.token);
        setAdminInfo(res.loginDTO);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async refreshLogin() {
      try {
        const res = await refreshAccessToken();
        this.token = res;
        setAdminToken(res);
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
        removeAdminToken();
        removeAdminRefreshToken();
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