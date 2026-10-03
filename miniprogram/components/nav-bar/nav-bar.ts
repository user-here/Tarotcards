import { getLayout } from '../../utils/system'

Component({
  options: { multipleSlots: true },
  properties: {
    title: { type: String, value: '' },
    back: { type: Boolean, value: true },
    // 页面滚动后显示半透明背景
    solid: { type: Boolean, value: false },
  },
  data: {
    statusBar: 20,
    navHeight: 64,
    sidePad: 100,
    isRoot: false,
  },
  lifetimes: {
    attached() {
      const l = getLayout()
      this.setData({
        statusBar: l.statusBar,
        navHeight: l.navHeight,
        sidePad: l.menuRight,
        isRoot: getCurrentPages().length <= 1,
      })
    },
  },
  methods: {
    onBack() {
      if (getCurrentPages().length > 1) {
        wx.navigateBack()
      } else {
        wx.reLaunch({ url: '/pages/index/index' })
      }
    },
  },
})
