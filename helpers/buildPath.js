const os = require('os')

module.exports = {
  getPath () {
    const _osVersion = os.release()

    const plat = process.platform
    const arch = process.arch
    const ver = _osVersion.split('.', 1)

    const bpath = `./prebuilds/${plat}-${ver}-${arch}/`
    return bpath
  },

  getPlatformString () {
    const _osVersion = os.release()

    const plat = process.platform
    const arch = process.arch
    const ver = _osVersion.split('.', 1)
    return `${plat}-${ver}-${arch}`
  }
}
