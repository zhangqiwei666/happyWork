// components/login-popup/login-popup.js
// 登录弹窗：微信官方一键快捷登录（wx.login + 官方隐私授权）
import { loginWithWechat } from '../../utils/auth';

const PRIVACY_AGREED_KEY = 'mood_privacy_agreed';

Component({
  options: {
    multipleSlots: true
  },

  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    privacyVisible: false,
    needPrivacy: false,
    privacyContractName: '《用户隐私保护指引》',
    loading: false
  },

  lifetimes: {
    attached() {
      this.refreshPrivacySetting();
      this.listenPrivacy();
    },
    detached() {
      this._privacyResolve = null;
    }
  },

  pageLifetimes: {
    show() {
      this.listenPrivacy();
    }
  },

  methods: {
    // 查询隐私授权状态
    refreshPrivacySetting() {
      if (!wx.getPrivacySetting) {
        this.setData({ needPrivacy: false });
        return;
      }
      wx.getPrivacySetting({
        success: (res) => {
          this.setData({
            needPrivacy: !!res.needAuthorization,
            privacyContractName: res.privacyContractName || this.data.privacyContractName
          });
        },
        fail: () => {
          this.setData({ needPrivacy: false });
        }
      });
    },

    // 官方隐私接口被触发时
    listenPrivacy() {
      if (!wx.onNeedPrivacyAuthorization) return;
      wx.onNeedPrivacyAuthorization((resolve) => {
        this._privacyResolve = resolve;
        this.setData({ privacyVisible: true });
      });
    },

    noop() {},

    // 打开隐私协议详情
    onOpenPrivacyContract() {
      if (wx.openPrivacyContract) {
        wx.openPrivacyContract({
          fail: () => wx.showToast({ title: '打开隐私协议失败', icon: 'none' })
        });
      }
    },

    // 按钮直接点击登录（已同意隐私状态）
    onDirectLoginTap() {
      this.doLogin();
    },

    // 点击同意隐私授权并立即执行微信快捷登录
    onAgreePrivacyAndLogin(e) {
      console.log('[login-popup] 用户同意隐私协议:', e.detail);
      wx.setStorageSync(PRIVACY_AGREED_KEY, true);
      if (this._privacyResolve) {
        this._privacyResolve({ buttonId: 'privacy-agree-btn', event: 'agree' });
        this._privacyResolve = null;
      }
      this.setData({ privacyVisible: false, needPrivacy: false });
      // 立即触发微信快捷登录
      this.doLogin();
    },

    // 用户拒绝隐私协议
    onDisagreePrivacy() {
      if (this._privacyResolve) {
        this._privacyResolve({ event: 'disagree' });
        this._privacyResolve = null;
      }
      this.setData({ privacyVisible: false });
      wx.showToast({ title: '需同意隐私指引后才能登录', icon: 'none' });
    },

    // 执行微信官方快捷登录
    async doLogin() {
      if (this.data.loading) return;
      this.setData({ loading: true });
      wx.showLoading({ title: '正在快捷登录...', mask: true });
      try {
        const auth = await loginWithWechat();
        wx.hideLoading();
        wx.showToast({ title: '登录成功', icon: 'success' });
        this.triggerEvent('success', auth);
        this.triggerEvent('close');
      } catch (err) {
        wx.hideLoading();
        console.error('[login] 登录失败', err);
        wx.showToast({ title: err?.msg || '登录失败，请重试', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    onClose() {
      if (this.data.loading) return;
      this.triggerEvent('close');
    }
  }
});
