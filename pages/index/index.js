// pages/index/index.js
import { 
  MOOD_TYPES, 
  WEATHER_TYPES, 
  HEALING_QUOTES, 
  getUserInfo, 
  saveCard, 
  triggerHaptic, 
  getFormatDate, 
  getFormatWeek,
  getAllCards
} from '../../utils/storage';
import { isLoggedIn } from '../../utils/auth';

Page({
  data: {
    moodList: MOOD_TYPES,
    weatherList: WEATHER_TYPES,
    selectedMoodId: 'chill',
    currentMood: MOOD_TYPES[1], // 默认放空摸鱼
    currentWeather: WEATHER_TYPES[0], // 默认晴天
    currentQuote: '',
    userNote: '',
    weatherPickerVisible: false,
    generatedCard: null,
    cardDay: '03',
    cardYearMonth: '2026.11',
    cardIndexRate: '88%',
    loginVisible: false
  },

  onLoad() {
    this.initDefaultQuote('chill');
    this.checkTodayCard();
    // 首次加载未登录时提示登录
    if (!isLoggedIn()) {
      this.openLogin();
    }
  },

  // 打开登录弹窗（隐藏原生 tabBar，避免遮挡底部弹窗）
  openLogin() {
    this.setData({ loginVisible: true });
    wx.hideTabBar({ fail: () => {} });
  },

  onCloseLogin() {
    this.setData({ loginVisible: false });
    wx.showTabBar({ fail: () => {} });
  },

  onLoginSuccess() {
    this.setData({ loginVisible: false });
    wx.showTabBar({ fail: () => {} });
  },

  onShow() {
    this.checkTodayCard();
  },

  // 检查今日是否已生成过卡片
  checkTodayCard() {
    const today = getFormatDate();
    const cards = getAllCards();
    const todayCard = cards.find(c => c.dateStr === today);
    if (todayCard) {
      const parts = todayCard.dateStr.split('.');
      this.setData({
        generatedCard: todayCard,
        cardDay: parts[2] || '03',
        cardYearMonth: `${parts[0]}.${parts[1]}`,
        selectedMoodId: todayCard.moodId,
        currentMood: MOOD_TYPES.find(m => m.id === todayCard.moodId) || this.data.currentMood,
        cardIndexRate: (todayCard.moodId === 'energized' ? '98%' : todayCard.moodId === 'chill' ? '85%' : todayCard.moodId === 'zen' ? '92%' : '76%')
      });
    }
  },

  // 初始化文案
  initDefaultQuote(moodId) {
    const quotes = HEALING_QUOTES[moodId] || HEALING_QUOTES.chill;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    this.setData({
      currentQuote: randomQuote
    });
  },

  // 切换情绪
  onSelectMood(e) {
    const moodId = e.currentTarget.dataset.id;
    triggerHaptic('selection');
    const mood = MOOD_TYPES.find(m => m.id === moodId) || MOOD_TYPES[0];
    this.setData({
      selectedMoodId: moodId,
      currentMood: mood
    });
    this.initDefaultQuote(moodId);
  },

  // 换一换治愈金句
  onRefreshQuote() {
    triggerHaptic('light');
    const quotes = HEALING_QUOTES[this.data.selectedMoodId] || HEALING_QUOTES.chill;
    let nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    if (quotes.length > 1 && nextQuote === this.data.currentQuote) {
      nextQuote = quotes[(quotes.indexOf(nextQuote) + 1) % quotes.length];
    }
    this.setData({
      currentQuote: nextQuote
    });
  },

  // 打开天气抽屉/弹窗
  onOpenWeatherPicker() {
    triggerHaptic('light');
    this.setData({
      weatherPickerVisible: true
    });
  },

  // 关闭天气选择
  onCloseWeatherPicker() {
    this.setData({
      weatherPickerVisible: false
    });
  },

  // 选择天气
  onSelectWeather(e) {
    const item = e.currentTarget.dataset.item;
    triggerHaptic('selection');
    this.setData({
      currentWeather: item,
      weatherPickerVisible: false
    });
    wx.showToast({
      title: `天气已切为${item.name}`,
      icon: 'none',
      duration: 1200
    });
  },

  // 碎碎念输入
  onNoteInput(e) {
    this.setData({
      userNote: e.detail.value
    });
  },

  // 提交并生成今日解压卡片
  onGenerateCard() {
    if (!isLoggedIn()) {
      this.openLogin();
      return;
    }
    triggerHaptic('medium');
    const user = getUserInfo();
    const dateStr = getFormatDate();
    const weekDay = getFormatWeek();
    const mood = this.data.currentMood;
    const weather = this.data.currentWeather;

    // 碎碎念默认填充
    const note = this.data.userNote.trim() || '今天有好好呼吸，给自己点一个大大的赞！';

    const cardId = 'card_' + Date.now();
    const newCard = {
      id: cardId,
      dateStr: dateStr,
      weekDay: weekDay,
      createdAt: Date.now(),
      moodId: mood.id,
      moodName: mood.name,
      moodEmoji: mood.emoji,
      moodColor: mood.color,
      moodBg: mood.bg,
      tag: mood.tag,
      weatherId: weather.id,
      weatherName: weather.name,
      weatherEmoji: weather.emoji,
      quote: this.data.currentQuote,
      note: note,
      creator: {
        nickName: user.nickName,
        avatarUrl: user.avatarUrl
      }
    };

    const parts = dateStr.split('.');
    const rates = {
      energized: '99%',
      chill: '86%',
      emo: '72%',
      angry: '60%',
      zen: '95%',
      tired: '68%'
    };

    // 本地持久化保存
    saveCard(newCard);

    this.setData({
      generatedCard: newCard,
      cardDay: parts[2] || '03',
      cardYearMonth: `${parts[0]}.${parts[1]}`,
      cardIndexRate: rates[mood.id] || '88%'
    });

    // 提示生成成功
    wx.showToast({
      title: '今日卡片已生成 ✨',
      icon: 'success',
      duration: 1800
    });

    // 滚动展示
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '.card-preview-section',
        duration: 400
      });
    }, 200);
  },

  // 重新签到/重新编辑
  onRecreateCard() {
    triggerHaptic('light');
    wx.showModal({
      title: '重新打卡',
      content: '是否重新调整今日的心情与天气？',
      confirmText: '重新来',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            generatedCard: null
          });
        }
      }
    });
  },

  // 跳转卡片详情互动页
  onViewCardDetail() {
    triggerHaptic('light');
    const card = this.data.generatedCard;
    if (!card) return;
    wx.navigateTo({
      url: `/pages/card-detail/card-detail?id=${card.id}`
    });
  },

  // 生成 Canvas 海报保存到相册
  onSavePoster() {
    triggerHaptic('medium');
    wx.showLoading({ title: '正在绘制海报...' });

    const card = this.data.generatedCard;
    if (!card) {
      wx.hideLoading();
      return;
    }

    const query = wx.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          wx.hideLoading();
          wx.showToast({ title: 'Canvas未准备好', icon: 'none' });
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio || 2;
        const width = res[0].width || 320;
        const height = res[0].height || 460;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // 绘制圆角背景
        ctx.fillStyle = card.moodBg || '#FFFDF8';
        ctx.fillRect(0, 0, width, height);

        // 绘制卡片边框
        ctx.strokeStyle = '#ECE5D8';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, width - 16, height - 16);

        // 绘制日期与天气
        ctx.fillStyle = '#1A1A1A';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(this.data.cardDay, 24, 60);

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText(`${this.data.cardYearMonth} · ${card.weekDay}`, 76, 50);

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(`${card.weatherEmoji} ${card.weatherName}`, width - 140, 50);

        // 绘制情绪 Emoji 与名称
        ctx.font = '48px sans-serif';
        ctx.fillText(card.moodEmoji, 24, 130);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#1A1A1A';
        ctx.fillText(card.moodName, 90, 115);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#8C7A6B';
        ctx.fillText(`“${card.tag}”`, 90, 140);

        // 分割线
        ctx.beginPath();
        ctx.strokeStyle = '#E2DDD5';
        ctx.setLineDash([4, 4]);
        ctx.moveTo(24, 170);
        ctx.lineTo(width - 24, 170);
        ctx.stroke();
        ctx.setLineDash([]);

        // 金句
        ctx.font = 'italic bold 15px sans-serif';
        ctx.fillStyle = '#2B2B2B';
        this.wrapText(ctx, `“${card.quote}”`, 24, 205, width - 48, 24);

        // 碎碎念
        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#6E675F';
        this.wrapText(ctx, `今日心声：${card.note}`, 24, 280, width - 48, 22);

        // 底部品牌说明
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#A0988E';
        ctx.fillText('心晴解压岛 · 今天的我也在好好生活', 24, height - 32);

        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvas: canvas,
            success: (snapRes) => {
              wx.hideLoading();
              wx.saveImageToPhotosAlbum({
                filePath: snapRes.tempFilePath,
                success: () => {
                  wx.showToast({ title: '已保存到相册', icon: 'success' });
                },
                fail: () => {
                  wx.showToast({ title: '保存取消或未授权', icon: 'none' });
                }
              });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '海报生成失败', icon: 'none' });
            }
          });
        }, 100);
      });
  },

  // 简易换行绘制文字辅助
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let words = text.split('');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n];
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  },

  // 微信好友分享配置
  onShareAppMessage() {
    const card = this.data.generatedCard || {
      id: 'demo',
      moodEmoji: '☁️',
      moodName: '放空摸鱼',
      weatherEmoji: '⛅',
      weatherName: '多云'
    };
    return {
      title: `我今天的心情是【${card.moodEmoji} ${card.moodName}】，来拆开看我的心晴卡片，给我个拥抱吧~`,
      path: `/pages/card-detail/card-detail?id=${card.id}`,
      imageUrl: ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const card = this.data.generatedCard || { moodName: '放空摸鱼' };
    return {
      title: `今日心晴打卡 · ${card.moodName} | 心晴解压岛`,
      query: `id=${card.id || ''}`
    };
  }
});
