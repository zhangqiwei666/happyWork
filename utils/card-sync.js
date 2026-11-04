// utils/card-sync.js
// 将本地心情卡片同步到服务端，拿到可分享的服务端 id
import { createCardApi } from '../api/card';
import { setCardServerId, findLocalCard } from './storage';
import { getAuthInfo } from './auth';

const pending = {};

/**
 * 确保卡片已同步到服务端
 * @param {Object} card 本地卡片
 * @returns {Promise<string>} 服务端卡片 id
 */
export function ensureCardSynced(card) {
  if (!card) return Promise.reject(new Error('卡片不存在'));
  const latest = findLocalCard(card.id) || card;
  if (latest.serverId) return Promise.resolve(latest.serverId);
  if (pending[card.id]) return pending[card.id];

  // 本地模拟登录（USE_SERVER_LOGIN = false）的 token 服务端不认，避免触发 401 被踢回首页
  const auth = getAuthInfo();
  if (!auth || !auth.token || auth.token.indexOf('mock_') === 0) {
    return Promise.reject(new Error('未使用服务端登录，无法同步卡片'));
  }

  const payload = {
    clientId: card.id,
    dateStr: card.dateStr,
    weekDay: card.weekDay,
    moodId: card.moodId,
    moodName: card.moodName,
    moodEmoji: card.moodEmoji,
    moodColor: card.moodColor,
    moodGradient: card.moodGradient,
    weatherId: card.weatherId,
    weatherName: card.weatherName,
    weatherEmoji: card.weatherEmoji,
    weatherTemp: card.weatherTemp,
    quote: card.quote,
    note: card.note,
    nickName: card.creator && card.creator.nickName,
    avatarUrl: card.creator && card.creator.avatarUrl
  };

  pending[card.id] = createCardApi(payload)
    .then((res) => {
      const serverId = res && res.id;
      if (!serverId) throw new Error('服务端未返回卡片 id');
      setCardServerId(card.id, String(serverId));
      return String(serverId);
    })
    .finally(() => {
      delete pending[card.id];
    });

  return pending[card.id];
}
