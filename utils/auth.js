// utils/auth.js
// 登录态管理：微信快捷登录（wx.login 静默/授权获取 code 并完成换票）
import { getUserInfo, saveUserInfo } from './storage';
import { AUTH_KEY } from './config';
import { wxLoginApi } from '../api/user';

/**
 * 是否调用后端登录接口（接口地址见 api/user.js → wxLoginApi）。
 * - false：使用本地模拟登录（便于后端未就绪时开发调试）。
 * - true：以 POST { code: loginCode } 调用后端 https://aiballs.cn/api/auth/wx-login，
 *   期望返回 { token, openid, nickName?, avatarUrl? }。
 *   后端使用 code 调用微信官方 code2Session 接口换取 openid 和 session_key。
 */
const USE_SERVER_LOGIN = true;

export function getAuthInfo() {
  return wx.getStorageSync(AUTH_KEY) || null;
}

export function isLoggedIn() {
  const auth = getAuthInfo();
  return !!(auth && auth.token);
}

export function logout() {
  wx.removeStorageSync(AUTH_KEY);
}

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => (res.code ? resolve(res.code) : reject(new Error('wx.login 未返回 code'))),
      fail: reject
    });
  });
}

/**
 * 执行微信快捷登录
 */
export async function loginWithWechat() {
  console.log('[auth] 开始执行微信官方快捷登录流程 (wx.login) ...');
  const loginCode = await wxLogin();
  console.log('[auth] 微信官方 wx.login 调用成功, 获取到登录凭证 code:', loginCode);

  let result;
  if (USE_SERVER_LOGIN) {
    console.log('[auth] 正在向后端服务器发送快捷登录请求: /api/auth/wx-login ...');
    result = await wxLoginApi({ code: loginCode, loginCode });
    console.log('[auth] 后端登录接口响应成功:', result);
    if (!result || !result.token) throw new Error('登录接口未返回 token');
  } else {
    // 本地模拟模式
    console.log('[auth] 当前为本地模拟登录模式 (USE_SERVER_LOGIN = false)');
    result = {
      token: 'mock_' + loginCode,
      openid: 'mock_openid_' + Date.now()
    };
  }

  const auth = {
    token: result.token,
    openid: result.openid || '',
    loginTime: Date.now()
  };
  wx.setStorageSync(AUTH_KEY, auth);

  // 同步用户资料
  const user = getUserInfo();
  saveUserInfo({
    ...user,
    nickName: result.nickName || user.nickName,
    avatarUrl: result.avatarUrl || user.avatarUrl
  });

  const app = getApp();
  if (app && app.globalData) {
    app.globalData.userInfo = getUserInfo();
    app.globalData.authInfo = auth;
  }
  return auth;
}

