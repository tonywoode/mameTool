'use strict'

const manualOutput = require('./manualOutput.js')
const _throw       = m => { throw new Error(m) }

//these manual prints from an early version could be an integration test
const testArcadeRun = (settings, readMameJson, jsonOutPath, outputDir) => {
  readMameJson(jsonOutPath).then( sysObj => {
    const {arcade} = sysObj 
    manualOutput(`${outputDir}/MAME`, settings)(arcade) 
    settings.mameExe = `Retroarch Arcade (Mame) Win32`
    manualOutput(`${outputDir}/RetroArch`, settings)(arcade) 
    return sysObj
  })
  .catch(err => _throw(err) )
}

module.exports = {testArcadeRun, manualOutput}
