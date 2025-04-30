import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken, removeAdminInfo } from '@/utils/auth';
import router from '@/router';
import { useAdminStore } from '@/store/admin';

const BASE_URL = '/api';

const service = axios.create({
  baseURL: BASE_URL,
  responseType: 'json',
  timeout: 500000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // 默认使用JSON格式
  } // 设置请求头内容
});
// 请求拦截器设置成防抖
service.interceptors.request.use(
  // 使用防抖处理请求
  (() => {
    let timer = null;
    return (config) => {
      return new Promise((resolve) => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          const token = getToken();
          if (token) {
            config.headers['Authorization'] = `${token}`;
          }
          resolve(config);
        }, 500); // 500ms 防抖延迟
      });
    };
  })(),
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);
// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 直接判断响应状态码
     if(res.code === 4001){
      //账号密码或验证码错误
      ElMessage.error(res.msg);
      return Promise.reject(new Error(res.msg));
    }else if(res.code === 4002){
      //验证码错误
      ElMessage.error(res.msg);
      return Promise.reject(new Error(res.msg));
    }else if(res.code === 403){
      ElMessage.error("账号被禁用");
      return Promise.reject(new Error(res.msg));
    }else if(res.code === 0 || response.status === 200){
      return res.data || res;
    } else {
      // 其他错误状态码的处理
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    
  },
  async (error) => {
    const { config, response } = error;
    const userStore = useAdminStore();
    // 检查是否因为accessToken过期引起的401错误
    if (response && response.status === 401 && !config._retry) {
      config._retry = true; // 标记这个请求已经尝试过刷新token
      try {
        await userStore.refreshLogin(); // 尝试使用refreshToken获取新的accessToken
        return service(config); // 重新发送失败的请求
      } catch (refreshError) {
        // refreshToken也无效或者获取新token失败
        ElMessage.error('登录信息已过期，请重新登录');
        userStore.logout(); // 清除本地登录状态
        router.push('/login'); // 重定向到登录页面
        return Promise.reject(refreshError);
      }
    }else if(error.status  === 500){
      ElMessage.error(error.response.data.msg);
      return Promise.reject(new Error(error.response.data.msg));
    }else if(error.status === 403){ 
      ElMessage.error("该账号无权限操作");
      //不用往后面传递错误信息
      return Promise.reject(new Error(error.response.data.msg));
    }
    return Promise.reject(error);
  }
);
export default service; 