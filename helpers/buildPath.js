const fs = require('fs')
const os = require('os')
const path = require('path')

module.exports = {
  getPath() {
    let _osVersion = os.release()

    let plat = process.platform
    let arch = process.arch
    let ver = _osVersion.split('.', 1)

    let bpath = `./prebuilds/${plat}-${ver}-${arch}/`
    return bpath
    if (fs.existsSync(path.join(__dirname, bpath))) {
      console.log('[leveldb] using prebuild in ', bpath)
      return bpath
    } else {
      console.log('[leveldb] building as prebuild not found in ', path.join(__dirname, bpath))
      return
    }
  },
  
  getPlatformString() {
    let _osVersion = os.release()

    let plat = process.platform
    let arch = process.arch
    let ver = _osVersion.split('.', 1)
    return `${plat}-${ver}-${arch}`
  }
}