const fs = require('fs')

fs.writeFileSync('CMakeExtras.txt', process.argv[2].replace(/\\/g, '/'))

module.exports = {}