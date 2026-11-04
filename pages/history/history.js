// pages/history/history.js
import { 
  getAllCards, 
  getCommentsByCardId, 
  getReactionsByCardId, 
  triggerHaptic 
} from '../../utils/storage';

Page({
  data: {
    cardList: [],
    totalReactions: 0,
    totalComments: 0
  },

  onShow() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  loadHistory() {
    const rawCards = getAllCards();
    let totalR = 0;
    let totalC = 0;

    const list = rawCards.map(card => {
      const parts = (card.dateStr || '').split('.');
      const reactions = getReactionsByCardId(card.id);
      const comments = getCommentsByCardId(card.id);

      const rCount = (reactions.hug || 0) + (reactions.tea || 0) + (reactions.pet || 0) + (reactions.cheer || 0);
      const cCount = comments.length || 0;

      totalR += rCount;
      totalC += cCount;

      return {
        ...card,
        dayNum: parts[2] || '03',
        yearMonth: `${parts[0] || '2026'}.${parts[1] || '11'}`,
        reactionCount: rCount,
        commentCount: cCount
      };
    });

    this.setData({
      cardList: list,
      totalReactions: totalR,
      totalComments: totalC
    });
  },

  onOpenCardDetail(e) {
    triggerHaptic('light');
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${id}`
    });
  }
});
