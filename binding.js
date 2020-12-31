var SegfaultHandler = require('segfault-handler')
SegfaultHandler.registerHandler("crash.log")
var bindings = require('bindings')('node-leveldb.node')

module.exports = bindings