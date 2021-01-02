// Some helpful pre-build enviornment checks
const fs = require('fs')
const cp = require('child_process')

function checkIfPrebuildExists() {
  try {
    const bindings = require('./binding')
    if (!bindings) throw 'Bindings are undefined'
    console.log('[leveldb] not building as already have prebuild')
    return true
  } catch (e) {
    console.log('[leveldb] need to build')
  }
}

var runCmake = true

if (!process.env.FORCE_BUILD) {
  if (checkIfPrebuildExists()) {
    runCmake = false
  }
}
if (process.env.SKIP_BUILD) {
  runCmake = false
}

async function runChecks() {
  if (!fs.existsSync('./leveldb-mcpe/include')) {

    console.info('Cloning submodules...')
    cp.execSync('git submodule init', { stdio: 'inherit' })
    cp.execSync('git submodule update', { stdio: 'inherit' })

    if (!fs.existsSync('./leveldb-mcpe/include')) { // npm install does not clone submodules...

      cp.execSync('git clone https://github.com/extremeheat/leveldb-mcpe') // so do it manually

      if (!fs.existsSync('./leveldb-mcpe/include')) { //gie up
        console.error('******************* READ ME ****************\n')
        console.error(' Failed to install git submodules. Please create an issue at https://github.com/extremeheat/node-leveldb-zlib\n')
        console.error('******************* READ ME ****************\n')
        process.exit(1)
      }
    }
  }

  if (process.platform == 'win32') {
    if (!process.env.CMAKE_TOOLCHAIN_FILE) {

      const exec = require("child_process");
      // Try to set CMAKE_TOOLCHAIN_FILE with pre-packaged vcpkg
      exec.execSync('cd helpers && win-build.bat')

      if (!fs.existsSync('helpers/CMakeExtras.txt')) {
        console.error('******************* READ ME ****************\n')
        console.error(' CMAKE_TOOLCHAIN_FILE was not set. Please see the Windows build steps at https://github.com/extremeheat/node-leveldb-zlib/\n')
        console.error(' The build below probably failed.\n')
        console.error('******************* READ ME ****************\n')
      } else {
        console.log('Using pre-bundled vcpkg')
      }
    }
  } else if (process.platform == 'darwin') {
    if (!fs.existsSync(`/usr/local/opt/zlib/include/`)) {
      console.error('******************* READ ME ****************\n')
      console.error(' zlib was not found. Run `xcode-select --install` and try again.\n')
      console.error(' The build below probably failed.\n')
      console.error('******************* READ ME ****************\n')
    }
  } else {
    if (!fs.existsSync(`/usr/include/zlib.h`) && !fs.existsSync(`/usr/local/include/zlib.h`)) {
      console.error('******************* READ ME ****************\n')
      console.error(' zlib headers were not found. If the build fails, try `sudo apt-get install libz-dev`\n')
      console.error('******************* READ ME ****************\n')
    }
  }
}

if (runCmake) {
  runChecks().then(
    () => {
      console.log('Build checks are passing! Building...')
      cp.execSync(`cmake-js compile`, {stdio: 'inherit'})
    }
  )
}

module.exports = () => { }