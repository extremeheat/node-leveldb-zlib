const fs = require('fs')

const proc = require('child_process')

console.log('Current dir:')

if (process.platform == 'win32') {
    proc.execSync('dir /s /b')
} else {
    proc.execSync('ls -r')
}

module.exports = {}