// utils/request.js
// 网络请求封装：统一域名、Token、Loading、错误提示、登录过期处理
import { BASE_URL, TIMEOUT, SUCCESS_CODES, UNAUTHORIZED_CODES, AUTH_KEY } from './config';

let loadingCount = 0;
let isHandlingUnauthorized = false;

function showLoading(title) {
  if (loadingCount === 0) {
    wx.showLoading({ title: title || '加载中...', mask: true });
  }
  loadingCount++;
}

function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    wx.hideLoading();
  }
}

function toast(msg) {
  if (msg) wx.showToast({ title: String(msg), icon: 'none', duration: 2000 });
}

function getToken() {
  const auth = wx.getStorageSync(AUTH_KEY);
  return (auth && auth.token) || '';
}

function buildUrl(url) {
  if (/^https?:\/\//.test(url)) return url;
  return BASE_URL.replace(/\/+$/, '') + '/' + String(url).replace(/^\/+/, '');
}

// 登录失效：清除登录态，回到首页（首页会自动弹出登录弹窗）
function handleUnauthorized() {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;
  wx.removeStorageSync(AUTH_KEY);
  toast('登录已过期，请重新登录');
  setTimeout(() => {
    isHandlingUnauthorized = false;
    wx.reLaunch({ url: '/pages/index/index' });
  }, 1200);
}

/**
 * 通用请求
 * @param {Object} options
 * @param {string} options.url       接口路径（如 /api/user）或完整地址
 * @param {string} [options.method]  GET | POST | PUT | DELETE
 * @param {Object} [options.data]    请求参数
 * @param {Object} [options.header]  额外请求头
 * @param {boolean} [options.loading=false]   是否显示 loading
 * @param {string}  [options.loadingText]     loading 文案
 * @param {boolean} [options.showError=true]  失败时是否自动 toast
 * @param {boolean} [options.auth=true]       是否携带 token
 * @param {boolean} [options.raw=false]       是否返回原始响应体（不做业务码判断）
 * @returns {Promise<any>} 成功时 resolve 业务数据 data
 */
export function request(options = {}) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    loading = false,
    loadingText,
    showError = true,
    auth = true,
    raw = false,
    timeout = TIMEOUT
  } = options;

  const headers = { 'Content-Type': 'application/json', ...header };
  const token = auth ? getToken() : '';
  if (token) headers.Authorization = 'Bearer ' + token;

  if (loading) showLoading(loadingText);

  return new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(url),
      method: method.toUpperCase(),
      data,
      header: headers,
      timeout,
      success: (res) => {
        const { statusCode, data: body } = res;

        // HTTP 层错误
        if (statusCode === 401) {
          handleUnauthorized();
          return reject({ code: 401, msg: '未登录或登录已过期', res });
        }
        if (statusCode < 200 || statusCode >= 300) {
          const msg = (body && (body.msg || body.message)) || `请求失败（${statusCode}）`;
          if (showError) toast(msg);
          return reject({ code: statusCode, msg, res });
        }

        if (raw || body === null || typeof body !== 'object' || !('code' in body)) {
          return resolve(body);
        }

        // 业务层判断：约定返回 { code, data, msg }
        if (SUCCESS_CODES.includes(body.code)) {
          return resolve(body.data);
        }
        if (UNAUTHORIZED_CODES.includes(body.code)) {
          handleUnauthorized();
          return reject({ code: body.code, msg: body.msg, res });
        }
        const msg = body.msg || body.message || '请求失败';
        if (showError) toast(msg);
        reject({ code: body.code, msg, res });
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || '';
        const msg = /timeout/i.test(errMsg) ? '请求超时，请稍后重试' : '网络异常，请检查网络连接';
        if (showError) toast(msg);
        reject({ code: -1, msg, err });
      },
      complete: () => {
        if (loading) hideLoading();
      }
    });
  });
}

export const get = (url, data, options = {}) => request({ ...options, url, data, method: 'GET' });
export const post = (url, data, options = {}) => request({ ...options, url, data, method: 'POST' });
export const put = (url, data, options = {}) => request({ ...options, url, data, method: 'PUT' });
export const del = (url, data, options = {}) => request({ ...options, url, data, method: 'DELETE' });

/**
 * 文件上传
 * @param {string} url       接口路径
 * @param {string} filePath  本地临时文件路径
 * @param {Object} [options] { name='file', formData={}, loading=true, showError=true }
 */
export function upload(url, filePath, options = {}) {
  const { name = 'file', formData = {}, loading = true, showError = true } = options;
  const header = {};
  const token = getToken();
  if (token) header.Authorization = 'Bearer ' + token;

  if (loading) showLoading('上传中...');

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: buildUrl(url),
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          handleUnauthorized();
          return reject({ code: 401, msg: '未登录或登录已过期', res });
        }
        let body = res.data;
        try { body = JSON.parse(res.data); } catch (e) { /* 非 JSON 响应 */ }
        if (body && typeof body === 'object' && 'code' in body) {
          if (SUCCESS_CODES.includes(body.code)) return resolve(body.data);
          if (UNAUTHORIZED_CODES.includes(body.code)) {
            handleUnauthorized();
            return reject({ code: body.code, msg: body.msg, res });
          }
          if (showError) toast(body.msg || '上传失败');
          return reject({ code: body.code, msg: body.msg, res });
        }
        resolve(body);
      },
      fail: (err) => {
        if (showError) toast('上传失败，请检查网络');
        reject({ code: -1, msg: '上传失败', err });
      },
      complete: () => {
        if (loading) hideLoading();
      }
    });
  });
}

export default { request, get, post, put, del, upload };

