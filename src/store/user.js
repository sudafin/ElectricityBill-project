import { defineStore } from 'pinia';
import { getUserList, createUser, updateUser, deleteUser, login } from '@/api/user';
import { setToken } from '@/utils/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    userList: [],
    total: 0,
    token: '',
    userInfo: {},
  }),
  actions: {
    async fetchUserList(params) {
      const res = await getUserList(params);
      this.userList = res.data.list;
      this.total = res.data.total;
    },
    async createUser(data) {
      await createUser(data);
      this.fetchUserList();
    },
    async updateUser(data) {
      await updateUser(data);
      this.fetchUserList();
    },
    async deleteUser(id) {
      await deleteUser(id);
      this.fetchUserList();
    },
    async login(loginForm) {
      // 预设的测试账号和密码
      const testUsername = 'admin';
      const testPassword = '123456';

      if (loginForm.username === testUsername && loginForm.password === testPassword) {
        // 如果输入的账号和密码与预设的一致,则模拟登录成功
        const token = 'test_token';
        this.token = token;
        setToken(token);
        return Promise.resolve();
      } else {
        // 如果输入的账号和密码与预设的不一致,则模拟登录失败
        return Promise.reject(new Error('账号或密码错误'));
      }
    },
  },
}); 