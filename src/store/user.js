import { defineStore } from 'pinia';
import { login } from '@/api/user/user';
import { logout, refreshAccessToken } from '@/api/admin/admin';
import { 
  getUserToken, 
  setUserToken, 
  removeUserToken, 
  setUserInfo, 
  removeUserInfo, 
  getUserInfo, 
  setUserRefreshToken, 
  removeUserRefreshToken 
} from '@/utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getUserToken() || '',
    userInfo: getUserInfo() || {},
    publicKey: '',
  }),
  
  getters: {
    userId: (state) => state.userInfo?.userId,
    userName: (state) => state.userInfo?.userName,
    isLoggedIn: (state) => !!state.token,
  },
  
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await login(loginForm);
        this.token = res.token;
        this.userInfo = res.userDTO;
        setUserToken(res.token);
        setUserInfo(res.userDTO);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    // 刷新令牌
    async refreshLogin() {
      try {
        const res = await refreshAccessToken();
        this.token = res;
        setUserToken(res);
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
        this.userInfo = {};
        removeUserToken();
        removeUserRefreshToken();
        removeUserInfo();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    
    // 设置公钥
    setPublicKey(publicKey) {
      this.publicKey = publicKey;
    },
  },
}); 