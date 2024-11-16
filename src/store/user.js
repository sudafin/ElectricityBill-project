import { defineStore } from 'pinia';
// import { login } from '@/api/user';
import { setToken } from '@/utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {},
  }),
  actions: {
    async login(loginForm) {
      // 模拟登录成功,返回一个虚拟的 token
      const token = 'mock_token';
      this.token = token;
      setToken(token);
      return Promise.resolve();

      // 实际的登录逻辑,暂时注释掉
      // const res = await login(loginForm);
      // this.token = res.data.token;
      // setToken(res.data.token);
    },
    // ...
  },
}); 