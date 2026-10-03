Page({
  data: {
    version: '1.0.0',
  },

  onLoad() {
    try {
      const info = wx.getAccountInfoSync()
      if (info.miniProgram.version) this.setData({ version: info.miniProgram.version })
    } catch (e) {
      // 开发版没有版本号
    }
  },
})
