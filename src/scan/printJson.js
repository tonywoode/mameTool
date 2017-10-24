'use strict'

let   fs                          = require('fs') //rewired in test, don't try and const or destructure
let   mkdirp                      = require('mkdirp') //ditto
const path                        = require('path')

module.exports = jsonOutPath => systems => {
  const outputDir = path.dirname(jsonOutPath)
  fs.existsSync(outputDir) || mkdirp(outputDir) 
  fs.writeFileSync(jsonOutPath, JSON.stringify(systems, null, `\t`))  
  return systems
}
