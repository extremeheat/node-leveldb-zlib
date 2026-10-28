const { getPlatformString } = require('./buildPath')
const fs = require('fs')

const output = `PLATFORM_STRING=${getPlatformString()}\n`
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, output)
} else {
  console.log('::set-output name=PLATFORM_STRING::' + getPlatformString())
}
