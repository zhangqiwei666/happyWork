// api/user.js
// 用户相关接口（接口路径请按后端实际约定修改）
import { post, get } from '../utils/request';

/**
 * 微信登录
 * @param {{ loginCode: string, phoneCode?: string }} data
 * 期望返回 { token, openid, phone, nickName?, avatarUrl? }
 */
export function wxLoginApi(data) {
  return post('/api/auth/wx-login', data, { auth: false, showError: false });
}

// 获取当前用户信息
export function getProfileApi() {
  return get('/api/user/profile');
}

