import Cookies from 'js-cookie';

const TokenKey = 'token';
const RefreshTokenKey = 'refresh';
const AdminInfoKey = 'adminInfo';
const UserInfoKey = 'userInfo';

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}

export function setRefreshToken(refreshToken) {
  return Cookies.set(RefreshTokenKey, refreshToken);
}

export function removeRefreshToken() {
  return Cookies.remove(RefreshTokenKey);
}

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
