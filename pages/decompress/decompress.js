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
    isHammerStriking: false,
    floatTexts: [],

    // 敲击目标模式: 'lotus' (清心莲花) | 'custom' (自定义暴打照片)
    targetType: 'lotus',
    customImage: '',
    targetName: '烦恼',
    targetNameDialogVisible: false,
    newTargetName: '',

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
    this.initCustomTarget();
    this.initBubbles();
  },

  onShow() {
    this.initStats();
  },

  initCustomTarget() {
    const savedImg = wx.getStorageSync('mood_custom_punch_img');
    const savedName = wx.getStorageSync('mood_custom_punch_name');
    if (savedImg) {
      this.setData({
        customImage: savedImg,
        targetName: savedName || '烦恼小怪兽',
        targetType: 'custom'
      });
    }
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

  // 敲击木鱼 / 暴打自定义对象
  onHitWoodfish() {
    if (this.data.vibrateEnabled) {
      triggerHaptic(this.data.targetType === 'custom' ? 'heavy' : 'medium');
    }

    const nextCount = this.data.woodFishCount + 1;
    updateDecompressStats('woodFish', 1);

    // 莲花清心词条 vs 暴打恶搞解压词条
    const lotusSlogans = [
      '烦恼 -1',
      '焦虑 -1',
      '功德 +1',
      '好运 +1',
      '心静 +1',
      '压力清零 ✨',
      '疲惫退散 🌿'
    ];
    const punchSlogans = [
      `${this.data.targetName} 退散！💥`,
      '吃我一锤！🔨',
      '压力 -999 💢',
      '看招！砰砰砰！🥊',
      '暴富 +10000 💰',
      '怒气消散 💨',
      '心情大爽！🎉',
      '不加班 +1 🏖️',
      '甩锅退散 🛡️'
    ];

    const slogans = this.data.targetType === 'custom' ? punchSlogans : lotusSlogans;
    const randomText = slogans[Math.floor(Math.random() * slogans.length)];
    const textId = 'text_' + Date.now() + '_' + Math.random();

    // 随机微偏移
    const randomX = Math.floor(Math.random() * 140) - 70;
    const randomY = Math.floor(Math.random() * 50) - 25;

    const newFloat = {
      id: textId,
      text: randomText,
      x: randomX,
      y: randomY,
      isPunch: this.data.targetType === 'custom'
    };

    const currentFloats = [...this.data.floatTexts, newFloat];

    // 触发锤子挥动动效与击打缩放
    this.setData({
      woodFishCount: nextCount,
      isStriking: true,
      isHammerStriking: true,
      floatTexts: currentFloats
    });

    setTimeout(() => {
      this.setData({ isHammerStriking: false });
    }, 120);

    setTimeout(() => {
      this.setData({ isStriking: false });
    }, 150);

    // 0.9s 后移除飘字
    setTimeout(() => {
      const filtered = this.data.floatTexts.filter(item => item.id !== textId);
      this.setData({ floatTexts: filtered });
    }, 900);
  },

  // 切换回默认莲花模式
  onResetToLotus() {
    triggerHaptic('light');
    this.setData({
      targetType: 'lotus'
    });
    wx.showToast({ title: '已切回清心莲花 🪷', icon: 'none' });
  },

  // 上传/选择自定义照片进行暴打
  onChooseCustomImage() {
    triggerHaptic('light');
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        if (tempPath) {
          this.setData({
            customImage: tempPath,
            targetType: 'custom',
            targetNameDialogVisible: true,
            newTargetName: this.data.targetName || '烦恼小怪兽'
          });
          wx.setStorageSync('mood_custom_punch_img', tempPath);
          triggerHaptic('medium');
        }
      },
      fail: (err) => {
        if (!/cancel/i.test(err.errMsg)) {
          wx.showToast({ title: '选择图片失败', icon: 'none' });
        }
      }
    });
  },

  // 打开修改暴打对象名称弹窗
  openTargetNameDialog() {
    triggerHaptic('light');
    this.setData({
      targetNameDialogVisible: true,
      newTargetName: this.data.targetName
    });
  },

  onTargetNameInput(e) {
    this.setData({
      newTargetName: e.detail.value
    });
  },

  onConfirmTargetName() {
    const name = (this.data.newTargetName || '').trim() || '烦恼小怪兽';
    this.setData({
      targetName: name,
      targetNameDialogVisible: false
    });
    wx.setStorageSync('mood_custom_punch_name', name);
    wx.showToast({ title: `已锁定暴打目标：${name}！`, icon: 'none' });
  },

  onCancelTargetName() {
    this.setData({
      targetNameDialogVisible: false
    });
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
