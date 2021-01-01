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
  bindings = require(pathToSearch + '/node-leveldb.node')
} else {
  bindings = require('bindings')('node-leveldb.node')
}

module.exports = bindings