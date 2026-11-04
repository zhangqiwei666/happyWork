// components/login-popup/login-popup.js
// 登录弹窗：微信官方「手机号快速验证组件」快捷登录 + 官方隐私授权（agreePrivacyAuthorization）
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
    needPrivacy: true,
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
      // 多个页面共用时，确保当前页面的实例接管隐私授权回调
      this.listenPrivacy();
    }
  },

  methods: {
    // 查询隐私授权状态：微信侧需要授权 或 本地从未同意过，都展示隐私提示
    refreshPrivacySetting() {
      const localAgreed = !!wx.getStorageSync(PRIVACY_AGREED_KEY);
      if (!wx.getPrivacySetting) {
        this.setData({ needPrivacy: !localAgreed });
        return;
      }
      wx.getPrivacySetting({
        success: (res) => {
          this.setData({
            needPrivacy: !!res.needAuthorization || !localAgreed,
            privacyContractName: res.privacyContractName || this.data.privacyContractName
          });
        },
        fail: () => {
          this.setData({ needPrivacy: !localAgreed });
        }
      });
    },

    // 官方隐私接口被触发时（如调用到涉及隐私的 API），弹出隐私提示
    listenPrivacy() {
      if (!wx.onNeedPrivacyAuthorization) return;
      wx.onNeedPrivacyAuthorization((resolve) => {
        this._privacyResolve = resolve;
        this.setData({ privacyVisible: true });
      });
    },

    noop() {},

    // 未同意隐私时，点击「快捷登录」先弹出隐私提示
    onQuickLoginTap() {
      if (this.data.loading) return;
      this.setData({ privacyVisible: true });
    },

    // 打开隐私协议详情（官方接口）
    onOpenPrivacyContract() {
      if (wx.openPrivacyContract) {
        wx.openPrivacyContract({
          fail: () => wx.showToast({ title: '打开隐私协议失败', icon: 'none' })
        });
      }
    },

    // 用户点击「同意」——官方 agreePrivacyAuthorization 回调
    onAgreePrivacy() {
      wx.setStorageSync(PRIVACY_AGREED_KEY, true);
      if (this._privacyResolve) {
        this._privacyResolve({ buttonId: 'privacy-agree-btn', event: 'agree' });
        this._privacyResolve = null;
      }
      this.setData({ privacyVisible: false, needPrivacy: false });
    },

    // 用户拒绝隐私协议
    onDisagreePrivacy() {
      if (this._privacyResolve) {
        this._privacyResolve({ event: 'disagree' });
        this._privacyResolve = null;
      }
      this.setData({ privacyVisible: false });
      wx.showToast({ title: '需同意隐私保护指引后才能登录', icon: 'none' });
    },

    // 手机号快速验证组件回调
    async onGetPhoneNumber(e) {
      const { code, errMsg = '' } = e.detail || {};

      if (code) {
        await this.doLogin(code);
        return;
      }

      // 用户主动拒绝
      if (/deny|cancel/i.test(errMsg)) {
        wx.showToast({ title: '已取消授权', icon: 'none' });
        return;
      }

      // 无权限（如个人主体小程序 / 开发者工具未开通）时降级为仅 wx.login 登录
      console.warn('[login] getPhoneNumber 失败，降级为静默登录：', errMsg);
      await this.doLogin('');
    },

    async doLogin(phoneCode) {
      if (this.data.loading) return;
      this.setData({ loading: true });
      wx.showLoading({ title: '登录中...', mask: true });
      try {
        const auth = await loginWithWechat(phoneCode);
        wx.hideLoading();
        wx.showToast({ title: '登录成功', icon: 'success' });
        this.triggerEvent('success', auth);
        this.triggerEvent('close');
      } catch (err) {
        wx.hideLoading();
        console.error('[login] 登录失败', err);
        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
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

