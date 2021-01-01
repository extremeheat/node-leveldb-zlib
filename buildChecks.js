// Some helpful pre-build enviornment checks
const fs = require('fs')
const cp = require('child_process')

// function checkIfPrebuildExists() {

// }

// if (checkIfPrebuildExists()) {
//   console.log('Using prebuild at ')
//   process.exit(0)
// }

if (!fs.existsSync('./leveldb-mcpe/include')) {

  console.info('Cloning submodules...')
  cp.execSync('git submodule init')
  cp.execSync('git submodule update')

  if (!fs.existsSync('./leveldb-mcpe/include')) {
    console.error('******************* READ ME ****************\n')
    console.error(' Failed to install git submodules. Please create an issue at https://github.com/extremeheat/node-leveldb-zlib\n')
    console.error('******************* READ ME ****************\n')
    process.exit(1)   
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

console.log('Build checks are passing!')

module.exports = () => {}