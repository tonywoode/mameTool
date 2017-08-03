"use strict"

const mkdirp = require(`mkdirp`)
const writeFileSync = require('fs').writeFileSync

exports.printJsonToFile = (systems, jsonOutPath) => writeFileSync(
  jsonOutPath, JSON.stringify(systems, null, `\t`) 
)

exports.printRomdata = (romdata, romdataOutDir, romdataOutName) => {
  mkdirp.sync(romdataOutDir)
  const romdataOutPath = `${romdataOutDir}/${romdataOutName}`
  writeFileSync(romdataOutPath, romdata.join(`\n`), `latin1`) //utf8 isn't possible at this time
  console.log(romdata)
}

