// utils/storage.js
// 情绪解压小程序 - 本地持久化数据管理与状态中枢

const STORAGE_KEYS = {
  USER_INFO: 'mood_user_info',
  CARDS: 'mood_cards_list',
  COMMENTS: 'mood_comments_map', // { [cardId]: [ { id, userName, userAvatar, content, createTime } ] }
  REACTIONS: 'mood_reactions_map', // { [cardId]: { hug: 3, tea: 1, pet: 5, cheer: 2, myReactions: [] } }
  SETTINGS: 'mood_app_settings',
  DECOMPRESS_STATS: 'mood_decompress_stats'
};

// 预设治愈解压金句库（按情绪分类）
export const HEALING_QUOTES = {
  energized: [
    '今天又是充满生机的一天，像太阳一样发光吧！',
    '把好心情打包，今天所见皆是明媚。',
    '蓄满能量，去把生活过得热气腾腾。',
    '心怀浪漫与热爱，去奔赴每一场期待。'
  ],
  chill: [
    '偶尔放空，是给灵魂做一次深呼吸。',
    '今天的主题是：允许自己什么都不做。',
    '摸鱼不是偷懒，是在生活里偷一块糖。',
    '风吹过树梢的节奏，就是今天最好的生活节奏。'
  ],
  emo: [
    '允许眼泪流淌，每一朵云都会遇到天晴。',
    '累了就先抱抱自己，今天不用非做个坚强的大人。',
    '低谷期的安静，是在土壤里默默扎根。',
    '无论多漫长的黑夜，晨光总会如期而至。'
  ],
  furious: [
    '深呼吸三次，把坏情绪随风呼出去。',
    '别让外界的杂音，打乱了你原本温柔的心跳。',
    '今天暴躁也没关系，烦恼统统被粉碎机切碎了！',
    '不顺心只是生活的逗号，接下来依然是精彩段落。'
  ],
  zen: [
    '顺其自然，心无挂碍，自有一片清欢。',
    '煮一壶清茶，万事随缘，内心波澜不惊。',
    '不争不抢，在自己的时区里笃定前行。',
    '看淡得失，平淡日子里自藏诗意。'
  ],
  exhausted: [
    '电量不足也没关系，今晚就好好睡个懒觉吧。',
    '把手机调成飞行模式，给自己一个柔软的被窝。',
    '辛苦啦，你已经做得很棒了，现在安心休息。',
    '卸下防备，世界会悄悄守护疲惫的你。'
  ]
};

// 情绪元数据定义
export const MOOD_TYPES = [
  { id: 'energized', name: '元气满满', icon: 'sunny', emoji: '🌞', color: '#FA8C16', bgGradient: 'linear-gradient(135deg, #FFE7BA 0%, #FFD591 50%, #FFBB96 100%)', themeColor: '#D46B08' },
  { id: 'chill', name: '放空摸鱼', icon: 'cloud', emoji: '☁️', color: '#13C2C2', bgGradient: 'linear-gradient(135deg, #E6FFFB 0%, #B5F5EC 50%, #87E8DE 100%)', themeColor: '#08979C' },
  { id: 'emo', name: '略微Emo', icon: 'sound-low', emoji: '🌧️', color: '#597EF7', bgGradient: 'linear-gradient(135deg, #D6E4FF 0%, #ADC6FF 50%, #85A5FF 100%)', themeColor: '#2F54EB' },
  { id: 'furious', name: '暴躁拆家', icon: 'fire', emoji: '🔥', color: '#F5222D', bgGradient: 'linear-gradient(135deg, #FFCCC7 0%, #FFA39E 50%, #FF7875 100%)', themeColor: '#CF1322' },
  { id: 'zen', name: '佛系平和', icon: 'browse', emoji: '🍵', color: '#52C41A', bgGradient: 'linear-gradient(135deg, #F6FFED 0%, #D9F7BE 50%, #B7EB8F 100%)', themeColor: '#389E0D' },
  { id: 'exhausted', name: '电量告急', icon: 'time', emoji: '💤', color: '#722ED1', bgGradient: 'linear-gradient(135deg, #EFDBFF 0%, #D3ADF7 50%, #B37FEB 100%)', themeColor: '#531DAB' }
];

// 天气氛围元数据
export const WEATHER_TYPES = [
  { id: 'sunny', name: '晴朗明媚', emoji: '☀️', temp: '25℃', desc: '阳光正好，微风拂面' },
  { id: 'cloudy', name: '多云放空', emoji: '⛅', temp: '22℃', desc: '微阴凉爽，适合发呆' },
  { id: 'rainy', name: '微雨洗尘', emoji: '🌧️', temp: '19℃', desc: '细雨微凉，煮茶听风' },
  { id: 'sunset', name: '晚霞暮色', emoji: '🌇', temp: '23℃', desc: '天边橘红，抚平躁动' },
  { id: 'windy', name: '晚风微凉', emoji: '🍃', temp: '20℃', desc: '微风渐起，烦恼吹散' },
  { id: 'snowy', name: '初雪轻柔', emoji: '❄️', temp: '2℃', desc: '世界纯白，万物归静' }
];

// 默认用户信息
export function getUserInfo() {
  const cached = wx.getStorageSync(STORAGE_KEYS.USER_INFO);
  if (cached) return cached;
  const defaultUser = {
    id: 'user_' + Math.floor(Math.random() * 899999 + 100000),
    nickName: '解压旅人',
    avatarUrl: 'https://tdesign.gtimg.com/mobile/demos/avatar1.png'
  };
  wx.setStorageSync(STORAGE_KEYS.USER_INFO, defaultUser);
  return defaultUser;
}

export function saveUserInfo(userInfo) {
  wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
}

// 获取或初始化所有卡片
export function getAllCards() {
  let cards = wx.getStorageSync(STORAGE_KEYS.CARDS);
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    // 初始化示范数据，让新安装打开就能看到互动效果
    const defaultCard = createSampleCard();
    cards = [defaultCard];
    wx.setStorageSync(STORAGE_KEYS.CARDS, cards);
  }
  return cards;
}

// 创建示范卡片
function createSampleCard() {
  const cardId = 'card_demo_001';
  // 初始化该卡片的示范互动与留言
  const initialReactions = {
    hug: 8,
    tea: 5,
    pet: 6,
    cheer: 4,
    myReactions: ['hug']
  };
  const commentsMap = wx.getStorageSync(STORAGE_KEYS.COMMENTS) || {};
  commentsMap[cardId] = [
    {
      id: 'cmt_001',
      userName: '温热白巧',
      userAvatar: 'https://tdesign.gtimg.com/mobile/demos/avatar2.png',
      content: '给你一个大大的隔空拥抱！今晚早点睡，明天又是新的一天~✨',
      createTime: '今天 10:25'
    },
    {
      id: 'cmt_002',
      userName: '林间小鹿',
      userAvatar: 'https://tdesign.gtimg.com/mobile/demos/avatar3.png',
      content: '这个天气太适合去喝一杯热可可了，摸鱼无罪，放空万岁！🧋',
      createTime: '今天 11:40'
    }
  ];
  wx.setStorageSync(STORAGE_KEYS.COMMENTS, commentsMap);

  const reactionsMap = wx.getStorageSync(STORAGE_KEYS.REACTIONS) || {};
  reactionsMap[cardId] = initialReactions;
  wx.setStorageSync(STORAGE_KEYS.REACTIONS, reactionsMap);

  return {
    id: cardId,
    dateStr: getFormatDate(new Date()),
    weekDay: getFormatWeek(new Date()),
    moodId: 'chill',
    moodName: '放空摸鱼',
    moodEmoji: '☁️',
    moodColor: '#13C2C2',
    weatherId: 'cloudy',
    weatherName: '多云放空',
    weatherEmoji: '⛅',
    weatherTemp: '22℃',
    quote: '偶尔放空，是给灵魂做一次深呼吸。摸鱼不是偷懒，是在生活里偷一块糖。',
    note: '今天工作稍微歇了口气，在工位泡了杯乌龙茶，看窗外云卷云舒，整个人都平静了下来。',
    creator: {
      id: 'user_default',
      nickName: '解压旅人',
      avatarUrl: 'https://tdesign.gtimg.com/mobile/demos/avatar1.png'
    },
    createTimestamp: Date.now()
  };
}

// 保存卡片
export function saveCard(cardData) {
  const cards = getAllCards();
  const existingIdx = cards.findIndex(c => c.id === cardData.id);
  if (existingIdx >= 0) {
    cards[existingIdx] = cardData;
  } else {
    cards.unshift(cardData);
  }
  wx.setStorageSync(STORAGE_KEYS.CARDS, cards);
  return cardData;
}

// 根据 ID 获取卡片
export function getCardById(cardId) {
  const cards = getAllCards();
  const card = cards.find(c => c.id === cardId);
  if (card) return card;
  // 如果是示范或者新链接，兜底返回第一张或临时卡片
  return cards[0] || null;
}

// 精确查找本地卡片（匹配本地 id 或服务端 serverId，不做兜底）
export function findLocalCard(id) {
  if (!id) return null;
  const cards = wx.getStorageSync(STORAGE_KEYS.CARDS) || [];
  return cards.find(c => c.id === id || c.serverId === id) || null;
}

// 卡片同步到服务端后，记录服务端 id
export function setCardServerId(localId, serverId) {
  const cards = getAllCards();
  const card = cards.find(c => c.id === localId);
  if (!card) return null;
  card.serverId = serverId;
  wx.setStorageSync(STORAGE_KEYS.CARDS, cards);
  return card;
}

// 获取卡片评论列表
export function getCommentsByCardId(cardId) {
  const map = wx.getStorageSync(STORAGE_KEYS.COMMENTS) || {};
  return map[cardId] || [];
}

// 添加评论
export function addComment(cardId, content, user) {
  const map = wx.getStorageSync(STORAGE_KEYS.COMMENTS) || {};
  if (!map[cardId]) {
    map[cardId] = [];
  }
  const newComment = {
    id: 'cmt_' + Date.now(),
    userName: user?.nickName || '温暖好友',
    userAvatar: user?.avatarUrl || 'https://tdesign.gtimg.com/mobile/demos/avatar4.png',
    content: content.trim(),
    createTime: '刚刚'
  };
  map[cardId].unshift(newComment);
  wx.setStorageSync(STORAGE_KEYS.COMMENTS, map);
  return newComment;
}

// 获取卡片互动（抱抱、奶茶等）
export function getReactionsByCardId(cardId) {
  const map = wx.getStorageSync(STORAGE_KEYS.REACTIONS) || {};
  return map[cardId] || {
    hug: 0,
    tea: 0,
    pet: 0,
    cheer: 0,
    myReactions: []
  };
}

// 点赞/轻互动
export function toggleReaction(cardId, reactionType) {
  const map = wx.getStorageSync(STORAGE_KEYS.REACTIONS) || {};
  if (!map[cardId]) {
    map[cardId] = { hug: 0, tea: 0, pet: 0, cheer: 0, myReactions: [] };
  }
  const item = map[cardId];
  if (!item.myReactions) item.myReactions = [];

  const hasReacted = item.myReactions.includes(reactionType);
  if (hasReacted) {
    // 取消
    item[reactionType] = Math.max(0, (item[reactionType] || 1) - 1);
    item.myReactions = item.myReactions.filter(r => r !== reactionType);
  } else {
    // 增加
    item[reactionType] = (item[reactionType] || 0) + 1;
    item.myReactions.push(reactionType);
  }
  wx.setStorageSync(STORAGE_KEYS.REACTIONS, map);
  return item;
}

// 获取解压统计
export function getDecompressStats() {
  const stats = wx.getStorageSync(STORAGE_KEYS.DECOMPRESS_STATS) || {
    woodFishCount: 88, // 敲木鱼次数
    bubbleCount: 156,   // 捏泡泡次数
    breathCount: 12     // 呼吸冥想次数
  };
  return stats;
}

export function updateDecompressStats(type, delta = 1) {
  const stats = getDecompressStats();
  if (type === 'woodFish') stats.woodFishCount += delta;
  if (type === 'bubble') stats.bubbleCount += delta;
  if (type === 'breath') stats.breathCount += delta;
  wx.setStorageSync(STORAGE_KEYS.DECOMPRESS_STATS, stats);
  return stats;
}

// 轻微震动辅助
export function triggerHaptic(type = 'light') {
  try {
    wx.vibrateShort({ type });
  } catch (e) {
    // 忽略异常
  }
}

// 日期格式化辅助
export function getFormatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function getFormatWeek(date = new Date()) {
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weeks[date.getDay()];
}
