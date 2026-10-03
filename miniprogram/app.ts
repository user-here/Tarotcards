App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 发布新版本后提示用户重启
    if (wx.canIUse('getUpdateManager')) {
      const um = wx.getUpdateManager()
      um.onUpdateReady(() => {
        wx.showModal({
          title: '新版本已就绪',
          content: '星语塔罗有了新的变化，重启即可体验。',
          showCancel: false,
          confirmText: '立即重启',
          success: () => um.applyUpdate(),
        })
      })
    }
  },
})
