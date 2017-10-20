'use strict'

let   fs                          = require('fs') //rewired in test, don't try and const or destructure
let   mkdirp                      = require('mkdirp') //ditto

module.exports = (outputDir, jsonOutName) => systems => {
  const jsonOutPath = `${outputDir}/${jsonOutName}`
  fs.existsSync(outputDir) || mkdirp(outputDir) 
  fs.writeFileSync(jsonOutPath, JSON.stringify(systems, null, `\t`))  
  return systems
}
