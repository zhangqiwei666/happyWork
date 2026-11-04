// utils/auth.js
// 登录态管理：微信快捷登录（wx.login + 手机号快速验证组件）
import { getUserInfo, saveUserInfo } from './storage';

const AUTH_KEY = 'mood_auth_info';

/**
 * 后端登录接口地址。
 * - 留空：使用本地模拟登录（便于开发调试，不会真正换取 openid / 手机号）。
 * - 填写后：会以 POST { loginCode, phoneCode } 调用该接口，
 *   期望返回 { token, openid, phone, nickName?, avatarUrl? }。
 *   后端需使用 loginCode 调用 code2Session 换取 openid，
 *   使用 phoneCode 调用 getuserphonenumber 换取手机号。
 */
const LOGIN_API = '';

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

function requestServer(data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: LOGIN_API,
      method: 'POST',
      data,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.token) {
          resolve(res.data);
        } else {
          reject(new Error('登录接口返回异常'));
        }
      },
      fail: reject
    });
  });
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone || '';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/**
 * 执行登录
 * @param {string} [phoneCode] 手机号快速验证组件返回的动态令牌 code（可为空）
 */
export async function loginWithWechat(phoneCode) {
  const loginCode = await wxLogin();

  let result;
  if (LOGIN_API) {
    result = await requestServer({ loginCode, phoneCode });
  } else {
    // 本地模拟：仅用于开发调试，正式上线请配置 LOGIN_API
    result = {
      token: 'mock_' + loginCode,
      openid: '',
      phone: ''
    };
  }

  const auth = {
    token: result.token,
    openid: result.openid || '',
    phone: result.phone || '',
    phoneMasked: maskPhone(result.phone),
    hasPhone: !!phoneCode,
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

