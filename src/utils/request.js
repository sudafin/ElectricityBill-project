import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken, removeAdminInfo } from '@/utils/auth';
import router from '@/router';
const BASE_URL = '/api';

const service = axios.create({
  baseURL: BASE_URL,
  responseType: 'json',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // 默认使用JSON格式
  } // 设置请求头内容
});
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `${token}`;
    }
    return config;
  },
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
     if (res.code === 401) {
      // token 失效,提示用户重新登录
      ElMessageBox.confirm('登录状态已过期,您可以继续留在该页面,或者重新登录', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户确认重新登录,清除 token 和用户信息,并跳转到登录页面
        removeToken();
        removeAdminInfo();
        router.push('/login');
      });
      return Promise.reject(new Error('登录状态已过期'));
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
  (error) => {
    // 处理请求错误
    if(error.status === 401){
      ElMessage.error("登录状态已过期");
      const token = getToken();
      if (token) {
      removeToken();
      removeAdminInfo();
      }
      router.push('/login');
    }
    if(error.status === 403){
      ElMessage.error("该账号无权限操作");
      //不用往后面传递错误信息
      return Promise.reject(new Error(error.response.data.msg));
    }
    return Promise.reject(error);
  }
);
export default service; 