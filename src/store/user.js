import { defineStore } from 'pinia';
import { login, logout, refreshAccessToken } from '@/api/admin/user';
import { setToken, removeToken, getToken, setAdminInfo, removeAdminInfo, getAdminInfo,setRefreshToken, removeRefreshToken } from '@/utils/auth';

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
        this.token = res.token;;
        this.adminInfo = res.adminDTO;
        setToken(res.token);
        setAdminInfo(res.adminDTO);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async refreshLogin() {
      try {
        const res = await refreshAccessToken();
        this.token = res;
        setToken(res);
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
        this.refreshToken = '';
        this.adminInfo = {};
        removeToken();
        removeRefreshToken();
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