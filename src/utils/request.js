import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getToken, getUserToken, getAdminToken,
  removeUserToken, removeUserRefreshToken, removeUserInfo,
  removeAdminToken, removeAdminRefreshToken, removeAdminInfo 
} from '@/utils/auth';
import router from '@/router';
import { useAdminStore } from '@/store/admin';
import { useUserStore } from '@/store/user';

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

// 判断请求是否来自管理端
function isAdminRequest(config) {
  // 通过配置的URL判断，如果URL以/admin开头，则视为管理端请求
  if (config.url && config.url.startsWith('/admin')) {
    return true;
  }
  
  // 通过当前路由判断
  if (window.location.pathname.includes('/admin')) {
    return true;
  }
  
  return false;
}

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
          // 根据请求类型选择不同的token
          let token;
          if (isAdminRequest(config)) {
            token = getAdminToken();
            console.log('使用管理员token:', token);
          } else {
            token = getUserToken();
            console.log('使用用户token:', token);
          }
          
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
    
    // 处理二进制响应，如验证码图片
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    
    // 直接判断响应状态码
    if (res.code === 4001) {
      // 账号密码或验证码错误
      ElMessage.error(res.msg);
      return Promise.reject(new Error(res.msg));
    } else if (res.code === 4002) {
      // 验证码错误
      ElMessage.error(res.msg);
      return Promise.reject(new Error(res.msg));
    } else if (res.code === 403) {
      ElMessage.error("账号被禁用");
      return Promise.reject(new Error(res.msg));
    } else if (res.code === 0 || response.status === 200) {
      return res.data || res;
    } else {
      // 其他错误状态码的处理
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    
  },
  async (error) => {
    const { config, response } = error;
    
    // 根据请求类型获取对应的store
    let store;
    try {
      if (config && isAdminRequest(config)) {
        store = useAdminStore();
      } else {
        store = useUserStore();
      }
    } catch (e) {
      console.error('获取store失败', e);
    }
    
    // 处理特定的无效token错误信息
    const isInvalidTokenError = response && 
      (response.status === 401 || response.status === 403) && 
      response.data && 
      (response.data.msg === 'Unauthorized: Invalid token' || 
       response.data.message === 'Unauthorized: Invalid token' ||
       (typeof response.data === 'string' && response.data.includes('Invalid token')));
       
    if (isInvalidTokenError) {
      console.log('检测到无效token错误，准备重置登录状态');
      // 直接重置状态并跳转登录页面，不尝试刷新token
      ElMessage.error('登录已失效，请重新登录');
      
      // 根据请求类型清除对应的token和状态
      if (config && isAdminRequest(config)) {
        // 清除管理员token和状态
        removeAdminToken();
        removeAdminRefreshToken();
        removeAdminInfo();
        
        // 重置管理员store状态
        if (store) {
          store.token = '';
          store.adminInfo = {};
        }
        
        // 使用window.location跳转，确保完全刷新页面
        window.location.href = '/login/admin';
      } else {
        // 清除用户token和状态
        removeUserToken();
        removeUserRefreshToken();
        removeUserInfo();
        
        // 重置用户store状态
        if (store) {
          store.token = '';
          store.userInfo = {};
        }
        
        // 使用window.location跳转，确保完全刷新页面
        window.location.href = '/login/user';
      }
      
      return Promise.reject(new Error('登录已失效'));
    }
    
    // 处理常规401错误（尝试刷新token）
    if (response && response.status === 401 && !config._retry && store) {
      config._retry = true; // 标记这个请求已经尝试过刷新token
      try {
        await store.refreshLogin(); // 尝试使用refreshToken获取新的accessToken
        return service(config); // 重新发送失败的请求
      } catch (refreshError) {
        // refreshToken也无效或者获取新token失败
        ElMessage.error('登录信息已过期，请重新登录');
        
        // 根据当前是管理员还是用户分别处理
        if (isAdminRequest(config)) {
          // 清除管理员token和状态
          removeAdminToken();
          removeAdminRefreshToken();
          removeAdminInfo();
          
          // 跳转到管理员登录页面
          window.location.href = '/login/admin';
        } else {
          // 清除用户token和状态
          removeUserToken();
          removeUserRefreshToken();
          removeUserInfo();
          
          // 跳转到用户登录页面
          window.location.href = '/login/user';
        }
        
        return Promise.reject(refreshError);
      }
    } else if (response && response.status === 500) {
      ElMessage.error(response.data?.msg || '服务器错误');
      return Promise.reject(new Error(response.data?.msg || '服务器错误'));
    } else if (response && response.status === 403 && !isInvalidTokenError) { 
      ElMessage.error("该账号无权限操作");
      // 不用往后面传递错误信息
      return Promise.reject(new Error(response.data?.msg || '无权限操作'));
    } else if (error.message && error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试');
      return Promise.reject(new Error('请求超时'));
    } else if (error.message && error.message.includes('Network Error')) {
      ElMessage.error('网络错误，请检查您的网络连接');
      return Promise.reject(new Error('网络错误'));
    }
    
    return Promise.reject(error);
  }
);

export default service; 