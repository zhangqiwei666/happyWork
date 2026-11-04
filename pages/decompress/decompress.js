// pages/decompress/decompress.js
import { 
  getDecompressStats, 
  updateDecompressStats, 
  triggerHaptic 
} from '../../utils/storage';

Page({
  data: {
    currentTab: 'woodfish',
    woodFishCount: 0,
    vibrateEnabled: true,
    isStriking: false,
    floatTexts: [],

    // 气泡膜
    bubbles: [],
    bubblePoppedCount: 0,

    // 呼吸
    isBreathing: false,
    breatheState: 'inhale', // inhale, hold, exhale
    breatheText: '准备呼吸',
    breatheTimer: 4
  },

  breatheInterval: null,

  onLoad() {
    this.initStats();
    this.initBubbles();
  },

  onShow() {
    this.initStats();
  },

  onUnload() {
    this.stopBreatheTimer();
  },

  initStats() {
    const stats = getDecompressStats();
    this.setData({
      woodFishCount: stats.woodFishCount || 0,
      bubblePoppedCount: stats.bubbleCount || 0
    });
  },

  onTabChange(e) {
    const tab = e.detail.value;
    triggerHaptic('light');
    this.setData({ currentTab: tab });
    if (tab !== 'breathe' && this.data.isBreathing) {
      this.stopBreatheTimer();
    }
  },

  toggleVibrate() {
    this.setData({
      vibrateEnabled: !this.data.vibrateEnabled
    });
    triggerHaptic('light');
  },

  // 敲击木鱼
  onHitWoodfish() {
    if (this.data.vibrateEnabled) {
      triggerHaptic('medium');
    }

    const nextCount = this.data.woodFishCount + 1;
    updateDecompressStats('woodFish', 1);

    const slogans = [
      '烦恼 -1',
      '焦虑 -1',
      '功德 +1',
      '好运 +1',
      '心静 +1',
      '压力清零 ✨',
      '疲惫退散 🌿'
    ];
    const randomText = slogans[Math.floor(Math.random() * slogans.length)];
    const textId = 'text_' + Date.now() + '_' + Math.random();

    // 随机微偏移
    const randomX = Math.floor(Math.random() * 120) - 60;
    const randomY = Math.floor(Math.random() * 40) - 20;

    const newFloat = {
      id: textId,
      text: randomText,
      x: randomX,
      y: randomY
    };

    const currentFloats = [...this.data.floatTexts, newFloat];

    this.setData({
      woodFishCount: nextCount,
      isStriking: true,
      floatTexts: currentFloats
    });

    setTimeout(() => {
      this.setData({ isStriking: false });
    }, 100);

    // 0.9s 后移除飘字
    setTimeout(() => {
      const filtered = this.data.floatTexts.filter(item => item.id !== textId);
      this.setData({ floatTexts: filtered });
    }, 900);
  },

  // 初始化 30 个气泡
  initBubbles() {
    const list = [];
    for (let i = 0; i < 30; i++) {
      list.push({ id: i, popped: false });
    }
    this.setData({ bubbles: list });
  },

  // 捏爆单个气泡
  onPopBubble(e) {
    const idx = e.currentTarget.dataset.index;
    const bubbles = this.data.bubbles;
    if (bubbles[idx] && bubbles[idx].popped) {
      return; // 已经破了
    }

    triggerHaptic('heavy');
    bubbles[idx].popped = true;
    const nextPopped = this.data.bubblePoppedCount + 1;
    updateDecompressStats('bubble', 1);

    this.setData({
      bubbles: [...bubbles],
      bubblePoppedCount: nextPopped
    });
  },

  // 换一张新的气泡纸
  onResetBubbles() {
    triggerHaptic('medium');
    this.initBubbles();
    wx.showToast({ title: '已换上全新气泡纸 🫧', icon: 'none' });
  },

  // 开启/停止 4-7-8 呼吸
  toggleBreathe() {
    triggerHaptic('medium');
    if (this.data.isBreathing) {
      this.stopBreatheTimer();
    } else {
      this.startBreatheCycle();
    }
  },

  startBreatheCycle() {
    this.setData({
      isBreathing: true,
      breatheState: 'inhale',
      breatheText: '深深吸气...',
      breatheTimer: 4
    });

    let currentPhase = 'inhale'; // inhale(4s) -> hold(7s) -> exhale(8s)
    let timeLeft = 4;

    this.breatheInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          timeLeft = 7;
          this.setData({
            breatheState: 'hold',
            breatheText: '屏住呼吸，放空思绪...',
            breatheTimer: timeLeft
          });
          triggerHaptic('light');
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timeLeft = 8;
          this.setData({
            breatheState: 'exhale',
            breatheText: '缓缓呼气，排出压力...',
            breatheTimer: timeLeft
          });
          triggerHaptic('light');
        } else {
          currentPhase = 'inhale';
          timeLeft = 4;
          this.setData({
            breatheState: 'inhale',
            breatheText: '深深吸气...',
            breatheTimer: timeLeft
          });
          triggerHaptic('light');
        }
      } else {
        this.setData({ breatheTimer: timeLeft });
      }
    }, 1000);
  },

  stopBreatheTimer() {
    if (this.breatheInterval) {
      clearInterval(this.breatheInterval);
      this.breatheInterval = null;
    }
    this.setData({
      isBreathing: false,
      breatheState: 'inhale',
      breatheText: '准备呼吸',
      breatheTimer: 4
    });
  }
});
