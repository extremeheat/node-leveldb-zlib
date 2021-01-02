const fs = require('fs')
const helper = require('./helpers/buildPath.js')

if (!process.versions.electron) { 
  // Electron has its own crash handler, and segfault-handler
  // uses NAN which is a hassle, so only load outside electron
  var SegfaultHandler = require('segfault-handler')
  SegfaultHandler.registerHandler("crash.log")
}

var bindings
var pathToSearch = helper.getPath()
if (pathToSearch) {
  try {
    bindings = require(pathToSearch + '/node-leveldb.node')
  } catch (e) {
    // console.warn('[leveldb] did not find lib in ', pathToSearch + '/node-leveldb.node')
  }
}
if (!bindings) {
  bindings = require('bindings')('node-leveldb.node')
}

module.exports = bindings