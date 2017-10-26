'use strict'

let   fs                          = require('fs') //rewired in test, don't try and const or destructure

module.exports = jsonOutPath => systems => {
  fs.writeFileSync(jsonOutPath, JSON.stringify(systems, null, `\t`))  
  return systems
}
