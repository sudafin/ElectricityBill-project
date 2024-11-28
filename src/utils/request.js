import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken } from '@/utils/auth';
import router from '@/router';
const BASE_URL = '/api';

const service = axios.create({
  baseURL: BASE_URL,
  responseType: 'json',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  } // 设置请求头内容
});
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    if (response.status === 200) {
      return res;
    } else {
      ElMessage.error(res.message || 'Error');
      if (response.status === 401) {
        ElMessageBox.confirm(
          '您已经登出,您可以取消停留在此页面,或重新登录',
          '确认登出', 
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(() => {
          removeToken();
          router.push('/login');
        });
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
  },
  (error) => {
    console.log(`err${error}`);
    ElMessage.error(error.message);
    return Promise.reject(error);
  }
);

export default service; 