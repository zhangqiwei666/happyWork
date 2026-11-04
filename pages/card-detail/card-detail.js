// pages/card-detail/card-detail.js
// 心情卡片详情：自己查看 / 好友通过分享打开，可查看卡片、轻互动与评论
import {
  getCommentsByCardId,
  addComment,
  getReactionsByCardId,
  toggleReaction,
  getUserInfo,
  findLocalCard,
  triggerHaptic
} from '../../utils/storage';
import { isLoggedIn } from '../../utils/auth';
import { ensureCardSynced } from '../../utils/card-sync';
import { getCardApi, getCommentsApi, addCommentApi, toggleReactionApi } from '../../api/card';

const PAGE_SIZE = 20;
const REACTION_TIPS = {
  hug: '送出了一个大大的隔空拥抱 🫂',
  tea: '为 Ta 投喂了一杯暖心甜茶 🧋',
  pet: '轻轻摸了摸 Ta 的小脑袋 🐱',
  cheer: '为 Ta 碰杯加油打气 🍻'
};

function buildReactedMap(myReactions = []) {
  return myReactions.reduce((m, t) => {
    m[t] = true;
    return m;
  }, {});
}

Page({
  data: {
    // remote：服务端卡片（可被好友查看/评论）；local：仅本机未同步的卡片
    mode: 'remote',
    cardId: '',
    localId: '',
    card: null,
    loadState: 'loading', // loading | ok | error
    isOwner: false,
    fromShare: false,
    reactions: { hug: 0, tea: 0, pet: 0, cheer: 0 },
    reactedMap: {},
    comments: [],
    commentTotal: 0,
    page: 1,
    hasMore: false,
    loadingMore: false,
    commentInput: '',
    canSend: false,
    sending: false,
    loginVisible: false,
    quickTags: [
      '抱抱你🫂',
      '辛苦啦，今晚早点睡🌙',
      '摸鱼无罪，放空万岁🧋',
      '不管怎样你都超棒的✨',
      '烦恼快快走开🍀'
    ]
  },

  onLoad(options = {}) {
    const id = options.id ? decodeURIComponent(options.id) : '';
    this.setData({ fromShare: options.from === 'share' });
    this.resolveAndLoad(id);
  },

  onPullDownRefresh() {
    this.reload().finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.mode === 'remote' && this.data.hasMore && !this.data.loadingMore) {
      this.loadComments(this.data.page + 1);
    }
  },

  // 判断是本机卡片还是服务端卡片
  resolveAndLoad(id) {
    if (!id) {
      this.setData({ loadState: 'error' });
      return;
    }
    const local = findLocalCard(id);
    if (local && !local.serverId) {
      // 自己的卡片尚未同步：先尝试同步，失败则以本地模式展示
      this.setData({ localId: local.id, isOwner: true });
      ensureCardSynced(local)
        .then((serverId) => {
          this.setData({ cardId: serverId, mode: 'remote' });
          return this.reload();
        })
        .catch(() => this.loadLocal(local));
      return;
    }
    this.setData({
      cardId: local ? local.serverId : id,
      localId: local ? local.id : '',
      isOwner: !!local,
      mode: 'remote'
    });
    this.reload();
  },

  reload() {
    if (this.data.mode === 'local') {
      const local = findLocalCard(this.data.localId);
      if (local) this.loadLocal(local);
      return Promise.resolve();
    }
    return Promise.all([this.loadCard(), this.loadComments(1)]);
  },

  // ---------- 服务端模式 ----------
  loadCard() {
    return getCardApi(this.data.cardId)
      .then((card) => {
        if (!card) throw new Error('empty');
        this.setData({
          card,
          loadState: 'ok',
          isOwner: !!card.isOwner || this.data.isOwner,
          reactions: card.reactions || this.data.reactions,
          reactedMap: buildReactedMap(card.myReactions)
        });
      })
      .catch(() => {
        // 服务端获取失败，若是自己的卡片则回退本地展示
        const local = this.data.localId && findLocalCard(this.data.localId);
        if (local) {
          this.loadLocal(local);
          wx.showToast({ title: '网络异常，当前为本地查看', icon: 'none' });
        } else {
          this.setData({ loadState: 'error' });
        }
      });
  },

  loadComments(page = 1) {
    this.setData({ loadingMore: true });
    return getCommentsApi(this.data.cardId, page, PAGE_SIZE)
      .then((res = {}) => {
        const list = res.list || [];
        const comments = page === 1 ? list : this.data.comments.concat(list);
        this.setData({
          comments,
          page,
          commentTotal: res.total != null ? res.total : comments.length,
          hasMore: res.hasMore != null ? !!res.hasMore : list.length >= PAGE_SIZE
        });
      })
      .catch(() => {})
      .finally(() => this.setData({ loadingMore: false }));
  },

  // ---------- 本地模式（未同步的卡片，仅自己可见） ----------
  loadLocal(card) {
    const r = getReactionsByCardId(card.id);
    const comments = getCommentsByCardId(card.id);
    this.setData({
      mode: 'local',
      localId: card.id,
      card,
      loadState: 'ok',
      isOwner: true,
      reactions: r,
      reactedMap: buildReactedMap(r.myReactions),
      comments,
      commentTotal: comments.length,
      hasMore: false
    });
  },

  // ---------- 登录 ----------
  requireLogin() {
    if (isLoggedIn()) return true;
    this.setData({ loginVisible: true });
    return false;
  },

  onCloseLogin() {
    this.setData({ loginVisible: false });
  },

  onLoginSuccess() {
    this.setData({ loginVisible: false });
    // 登录后刷新，以便获取 myReactions / isOwner
    if (this.data.mode === 'remote') this.loadCard();
  },

  // ---------- 轻互动 ----------
  onToggleReaction(e) {
    const type = e.currentTarget.dataset.type;
    if (!this.requireLogin()) return;
    triggerHaptic('medium');

    if (this.data.mode === 'local') {
      const updated = toggleReaction(this.data.localId, type);
      this.setData({ reactions: updated, reactedMap: buildReactedMap(updated.myReactions) });
      wx.showToast({ title: REACTION_TIPS[type] || '温暖已送达 ✨', icon: 'none', duration: 1500 });
      return;
    }

    if (this._reacting) return;
    this._reacting = true;
    toggleReactionApi(this.data.cardId, type)
      .then((res = {}) => {
        const myReactions = res.myReactions || [];
        this.setData({
          reactions: res.reactions || this.data.reactions,
          reactedMap: buildReactedMap(myReactions)
        });
        if (myReactions.includes(type)) {
          wx.showToast({ title: REACTION_TIPS[type] || '温暖已送达 ✨', icon: 'none', duration: 1500 });
        }
      })
      .catch(() => {})
      .finally(() => {
        this._reacting = false;
      });
  },

  // ---------- 评论 ----------
  onSelectQuickTag(e) {
    triggerHaptic('light');
    const tag = e.currentTarget.dataset.tag;
    this.setData({ commentInput: tag, canSend: true });
  },

  onCommentInput(e) {
    const value = e.detail.value || '';
    this.setData({ commentInput: value, canSend: value.trim().length > 0 });
  },

  onCommentFocus() {
    if (!isLoggedIn()) {
      wx.hideKeyboard && wx.hideKeyboard();
      this.setData({ loginVisible: true });
    }
  },

  onSubmitComment() {
    const text = (this.data.commentInput || '').trim();
    if (!text || this.data.sending) return;
    if (text.length > 200) {
      wx.showToast({ title: '留言最多 200 字', icon: 'none' });
      return;
    }
    if (!this.requireLogin()) return;
    triggerHaptic('medium');

    const user = getUserInfo();

    if (this.data.mode === 'local') {
      const newComment = addComment(this.data.localId, text, user);
      this.afterCommentAdded(newComment);
      return;
    }

    this.setData({ sending: true });
    addCommentApi(this.data.cardId, {
      content: text,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl
    })
      .then((comment) => {
        this.afterCommentAdded(
          comment || {
            id: 'tmp_' + Date.now(),
            userName: user.nickName,
            userAvatar: user.avatarUrl,
            content: text,
            createTime: '刚刚'
          }
        );
      })
      .catch(() => {})
      .finally(() => this.setData({ sending: false }));
  },

  afterCommentAdded(comment) {
    this.setData({
      comments: [comment, ...this.data.comments],
      commentTotal: this.data.commentTotal + 1,
      commentInput: '',
      canSend: false
    });
    wx.showToast({ title: '留言已送达，温暖+1 💕', icon: 'none', duration: 1800 });
  },

  // 跳转到首页去打卡
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 转发给更多好友（始终使用服务端 id）
  onShareAppMessage() {
    const card = this.data.card;
    if (!card || this.data.mode !== 'remote') {
      return {
        title: '心晴解压岛 · 今天的我也在好好生活',
        path: '/pages/index/index'
      };
    }
    const name = this.data.isOwner ? '我' : (card.creator && card.creator.nickName) || '好友';
    return {
      title: `${name}今天的心情是【${card.moodEmoji} ${card.moodName}】，快来一起暖心互动吧！`,
      path: `/pages/card-detail/card-detail?id=${encodeURIComponent(this.data.cardId)}&from=share`
    };
  }
});
