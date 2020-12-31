// Some helpful pre-build enviornment checks
const fs = require('fs')

if (!fs.existsSync('./leveldb-mcpe/include')) {
  console.error('******************* READ ME ****************\n')
  console.error(' You did not clone recursively. You need to run git submodule init && git submodule update\n')
  console.error('******************* READ ME ****************\n')
  process.exit(1)
}

if (process.platform == 'win32') {
  if (!process.env.CMAKE_TOOLCHAIN_FILE) {

    const exec = require("child_process");
    // Try to set CMAKE_TOOLCHAIN_FILE with pre-packaged vcpkg
    exec.execSync('cd helpers && win-build.bat')

    console.error('******************* READ ME ****************\n')
    console.error(' CMAKE_TOOLCHAIN_FILE was not set. Please see the Windows build steps at https://github.com/extremeheat/node-leveldb-zlib/\n')
    console.error(' The build below probably failed.\n')
    console.error('******************* READ ME ****************\n')
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