// app.js
import { getUserInfo } from './utils/storage';

App({
  globalData: {
    userInfo: null,
    systemInfo: null
  },

  onLaunch() {
    // 检查并初始化用户信息
    this.globalData.userInfo = getUserInfo();
    
    // 获取设备窗口与安全区信息
    try {
      const windowInfo = wx.getWindowInfo();
      this.globalData.systemInfo = windowInfo;
    } catch (e) {
      // 兼容低版本
    }
  }
});
