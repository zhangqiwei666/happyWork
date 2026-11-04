// pages/card-detail/card-detail.js
import { 
  getCardById, 
  getCommentsByCardId, 
  addComment, 
  getReactionsByCardId, 
  toggleReaction, 
  getUserInfo, 
  triggerHaptic 
} from '../../utils/storage';

Page({
  data: {
    cardId: '',
    card: null,
    reactions: { hug: 0, tea: 0, pet: 0, cheer: 0, myReactions: [] },
    comments: [],
    commentInput: '',
    quickTags: [
      '抱抱你🫂',
      '辛苦啦，今晚早点睡🌙',
      '摸鱼无罪，放空万岁🧋',
      '不管怎样你都超棒的✨',
      '烦恼快快走开🍀'
    ]
  },

  onLoad(options) {
    const id = options?.id || '';
    this.setData({ cardId: id });
    this.loadCardData(id);
  },

  onPullDownRefresh() {
    this.loadCardData(this.data.cardId);
    wx.stopPullDownRefresh();
  },

  // 加载数据
  loadCardData(id) {
    const card = getCardById(id);
    if (!card) {
      wx.showToast({ title: '卡片未找到', icon: 'none' });
      return;
    }
    const reactions = getReactionsByCardId(card.id);
    const comments = getCommentsByCardId(card.id);

    this.setData({
      cardId: card.id,
      card,
      reactions,
      comments
    });
  },

  // 判断是否已点赞某项
  isReacted(type) {
    return this.data.reactions.myReactions && this.data.reactions.myReactions.includes(type);
  },

  // 轻互动点赞（抱抱、奶茶等）
  onToggleReaction(e) {
    const type = e.currentTarget.dataset.type;
    const cardId = this.data.cardId;
    triggerHaptic('medium');

    const updated = toggleReaction(cardId, type);
    this.setData({ reactions: updated });

    const tips = {
      hug: '送出了一个大大的隔空拥抱 🫂',
      tea: '为 Ta 投喂了一杯暖心甜茶 🧋',
      pet: '轻轻摸了摸 Ta 的小脑袋 🐱',
      cheer: '为 Ta 碰杯加油打气 🍻'
    };

    wx.showToast({
      title: tips[type] || '温暖已送达 ✨',
      icon: 'none',
      duration: 1500
    });
  },

  // 快捷标签点击
  onSelectQuickTag(e) {
    triggerHaptic('light');
    const tag = e.currentTarget.dataset.tag;
    this.setData({ commentInput: tag });
  },

  // 输入监听
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },

  // 提交评论
  onSubmitComment() {
    const text = this.data.commentInput.trim();
    if (!text) return;

    triggerHaptic('medium');
    const currentUser = getUserInfo();
    const newComment = addComment(this.data.cardId, text, currentUser);

    const updatedComments = [newComment, ...this.data.comments];
    this.setData({
      comments: updatedComments,
      commentInput: ''
    });

    wx.showToast({
      title: '留言已送达，温暖+1 💕',
      icon: 'success',
      duration: 1800
    });
  },

  // 跳转到首页去打卡
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 转发给更多好友
  onShareAppMessage() {
    const card = this.data.card;
    if (!card) {
      return {
        title: '心晴解压岛 · 今天的我也在好好生活',
        path: '/pages/index/index'
      };
    }
    return {
      title: `${card.creator?.nickName || '好友'} 的今日心情是【${card.moodEmoji} ${card.moodName}】，快来一起暖心互动吧！`,
      path: `/pages/card-detail/card-detail?id=${card.id}`
    };
  }
});
