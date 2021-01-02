const fs = require('fs')
const os = require('os')

module.exports = {
  getPath() {
    let _osVersion = os.release()

    let plat = process.platform
    let arch = process.arch
    let ver = _osVersion.split('.', 1)

    let path = `./prebuilds/${plat}-${ver}-${arch}/`
    if (fs.existsSync(path)) {
      // console.log('[leveldb] using prebuild in ', path)
      return path
    } else {
      // console.log('[leveldb] building as prebuild not found in ', path)
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