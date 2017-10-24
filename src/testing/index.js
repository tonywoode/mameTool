'use strict'

const manualOutput                         = require('./manualOutput.js')

//these manual prints from an early version could be an integration test
const testArcadeRun = (readMameJson, jsonOutPath, outputDir, romdataConfig) => {
  readMameJson(jsonOutPath).then( sysObj => {
    const {arcade} = sysObj 
    manualOutput(`${outputDir}/MAME`, romdataConfig)(arcade) 
    romdataConfig.emu = `Retroarch Arcade (Mame) Win32`
    manualOutput(`${outputDir}/RetroArch`, romdataConfig)(arcade) 
    return sysObj
  })
  .catch(err => _throw(err) )
}




module.exports = {testArcadeRun, manualOutput}
