var fs = require('fs')
var cp = require('child_process')

// var packageJson = fs.readFileSync('../package.json', 'utf-8')

cp.execSync('npm version patch', { stdio: 'inherit' })

// packageJson.replace(/"version": "[0-9\.]+\.[0-9\.].[0-9\.]",/, )