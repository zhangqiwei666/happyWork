// utils/config.js
// 全局配置

// 请求域名（需在 微信公众平台 → 开发管理 → 开发设置 → 服务器域名 中配置 request 合法域名）
export const BASE_URL = 'https://aiballs.cn';

// 请求超时时间（毫秒）
export const TIMEOUT = 15000;

// 后端业务成功码（按实际接口约定调整）
export const SUCCESS_CODES = [0, 200];

// 登录过期 / 未登录业务码
export const UNAUTHORIZED_CODES = [401];

// 本地登录态存储 key
export const AUTH_KEY = 'mood_auth_info';

