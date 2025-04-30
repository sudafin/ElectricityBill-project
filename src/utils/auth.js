import Cookies from 'js-cookie';

const TokenKey = 'token';
const UserTokenKey = 'user_token';
const AdminTokenKey = 'admin_token';
const RefreshTokenKey = 'refresh';
const UserRefreshTokenKey = 'user_refresh';
const AdminRefreshTokenKey = 'admin_refresh';
const AdminInfoKey = 'adminInfo';
const UserInfoKey = 'userInfo';

// 通用token方法 (兼容旧代码)
export function getToken() {
  // 优先获取当前路径对应的token
  if (window.location.pathname.includes('/admin')) {
    return getAdminToken();
  } else {
    return getUserToken();
  }
}

export function setToken(token) {
  // 根据当前路径设置对应的token
  if (window.location.pathname.includes('/admin')) {
    return setAdminToken(token);
  } else {
    return setUserToken(token);
  }
}

export function removeToken() {
  // 移除所有token
  removeUserToken();
  removeAdminToken();
}

// 用户token方法
export function getUserToken() {
  return Cookies.get(UserTokenKey);
}

export function setUserToken(token) {
  return Cookies.set(UserTokenKey, token);
}

export function removeUserToken() {
  return Cookies.remove(UserTokenKey);
}

// 管理员token方法
export function getAdminToken() {
  return Cookies.get(AdminTokenKey);
}

export function setAdminToken(token) {
  return Cookies.set(AdminTokenKey, token);
}

export function removeAdminToken() {
  return Cookies.remove(AdminTokenKey);
}

// 刷新token方法
export function setRefreshToken(refreshToken) {
  if (window.location.pathname.includes('/admin')) {
    return setAdminRefreshToken(refreshToken);
  } else {
    return setUserRefreshToken(refreshToken);
  }
}

export function removeRefreshToken() {
  removeUserRefreshToken();
  removeAdminRefreshToken();
}

// 用户刷新token
export function getUserRefreshToken() {
  return Cookies.get(UserRefreshTokenKey);
}

export function setUserRefreshToken(refreshToken) {
  return Cookies.set(UserRefreshTokenKey, refreshToken);
}

export function removeUserRefreshToken() {
  return Cookies.remove(UserRefreshTokenKey);
}

// 管理员刷新token
export function getAdminRefreshToken() {
  return Cookies.get(AdminRefreshTokenKey);
}

export function setAdminRefreshToken(refreshToken) {
  return Cookies.set(AdminRefreshTokenKey, refreshToken);
}

export function removeAdminRefreshToken() {
  return Cookies.remove(AdminRefreshTokenKey);
}

// 用户和管理员信息
export function getAdminInfo() {
  const adminInfo = Cookies.get(AdminInfoKey);
  if (adminInfo && adminInfo !== "undefined" && adminInfo !== "null") {
    try {
      return JSON.parse(adminInfo);
    } catch (e) {
      console.error('解析管理员信息失败:', e);
      return null;
    }
  }
  return null;
}

export function setAdminInfo(adminInfo) {
  return Cookies.set(AdminInfoKey, JSON.stringify(adminInfo));
}

export function removeAdminInfo() {
  return Cookies.remove(AdminInfoKey);
}

export function getUserInfo() {
  const userInfo = Cookies.get(UserInfoKey);
  if (userInfo && userInfo !== "undefined" && userInfo !== "null") {
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      console.error('解析用户信息失败:', e);
      return null;
    }
  }
  return null;
}

export function setUserInfo(userInfo) {
  return Cookies.set(UserInfoKey, JSON.stringify(userInfo));
}

export function removeUserInfo() {
  return Cookies.remove(UserInfoKey);
} 
