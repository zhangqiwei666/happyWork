// api/card.js
// 心情卡片分享 / 评论 / 互动接口（接口文档见 docs/card-share-api.md）
import { get, post } from '../utils/request';

// 创建（上传）心情卡片，返回 { id }
export function createCardApi(card) {
  return post('/api/cards', card, { showError: false });
}

// 获取卡片详情（未登录也可查看；已登录时后端可据 token 返回 isOwner / myReactions）
export function getCardApi(id) {
  return get(`/api/cards/${encodeURIComponent(id)}`, {}, { showError: false });
}

// 获取评论列表，返回 { list, total, hasMore }
export function getCommentsApi(id, page = 1, pageSize = 20) {
  return get(`/api/cards/${encodeURIComponent(id)}/comments`, { page, pageSize }, { showError: false });
}

// 发表评论，返回新评论对象
export function addCommentApi(id, data) {
  return post(`/api/cards/${encodeURIComponent(id)}/comments`, data, { loading: true, loadingText: '发送中...' });
}

// 切换轻互动（抱抱 / 甜茶 / 摸头 / 干杯），返回 { reactions, myReactions }
export function toggleReactionApi(id, type) {
  return post(`/api/cards/${encodeURIComponent(id)}/reactions`, { type });
}

