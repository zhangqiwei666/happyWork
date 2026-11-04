// pages/mine/mine.js
import { 
  getUserInfo, 
  saveUserInfo, 
  getDecompressStats, 
  triggerHaptic 
} from '../../utils/storage';
import { isLoggedIn, getAuthInfo, logout } from '../../utils/auth';

Page({
  data: {
    userInfo: null,
    isLogin: false,
    authInfo: null,
    loginVisible: false,
    decompressStats: { woodFishCount: 0, bubbleCount: 0, breathCount: 0 },
    hapticEnabled: true,
    editNameVisible: false,
    newNickName: ''
  },

  onShow() {
    this.loadUserData();
  },

  loadUserData() {
    const user = getUserInfo();
    const stats = getDecompressStats();
    this.setData({
      userInfo: user,
      isLogin: isLoggedIn(),
      authInfo: getAuthInfo(),
      decompressStats: stats
    });
  },

  openLogin() {
    this.setData({ loginVisible: true });
    wx.hideTabBar({ fail: () => {} });
  },

  onCloseLogin() {
    this.setData({ loginVisible: false });
    wx.showTabBar({ fail: () => {} });
  },

  onLoginSuccess() {
    this.onCloseLogin();
    this.loadUserData();
  },

  onLogout() {
    triggerHaptic('medium');
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          this.loadUserData();
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
    });
  },

  openEditNameDialog() {
    triggerHaptic('light');
    this.setData({
      editNameVisible: true,
      newNickName: this.data.userInfo?.nickName || ''
    });
  },

  onNickNameChange(e) {
    this.setData({ newNickName: e.detail.value });
  },

  onConfirmEditName() {
    const name = this.data.newNickName.trim();
    if (!name) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' });
      return;
    }
    const updated = {
      ...this.data.userInfo,
      nickName: name
    };
    saveUserInfo(updated);
    this.setData({
      userInfo: updated,
      editNameVisible: false
    });
    triggerHaptic('medium');
    wx.showToast({ title: '昵称修改成功', icon: 'success' });
  },

  onCancelEditName() {
    this.setData({ editNameVisible: false });
  },

  onToggleHaptic(e) {
    const val = e.detail.value;
    this.setData({ hapticEnabled: val });
    if (val) triggerHaptic('medium');
  },

  onShowAbout() {
    triggerHaptic('light');
    wx.showModal({
      title: '关于心晴解压岛',
      content: '这是一款主打轻量情绪记录、天气氛围感知与好友暖心互动的解压小程序。采用原生微信小程序架构与腾讯 TDesign 设计系统精心打造，愿能抚平你生活的每一次小波澜。',
      showCancel: false,
      confirmText: '知道啦'
    });
  },

  onResetData() {
    triggerHaptic('medium');
    wx.showModal({
      title: '重置体验数据',
      content: '确定要清空本地卡片和留言，恢复初始示范数据吗？',
      confirmColor: '#E34D59',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.loadUserData();
          wx.showToast({ title: '已恢复初始状态', icon: 'success' });
        }
      }
    });
  }
});
