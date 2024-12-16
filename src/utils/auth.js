import Cookies from 'js-cookie';

const TokenKey = 'token';
const RefreshTokenKey = 'refresh';
const AdminInfoKey = 'adminInfo';

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
  return adminInfo ? JSON.parse(adminInfo) : null;
}

export function setAdminInfo(adminInfo) {
  return Cookies.set(AdminInfoKey, JSON.stringify(adminInfo));
}

export function removeAdminInfo() {
  return Cookies.remove(AdminInfoKey);
} 
