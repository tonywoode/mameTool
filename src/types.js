'use strict'

const outputDir          = require(`./getDir.js`).getOutputDir() //also needs changing in package.json config

const {tagged}           = require('daggy')
const Emu = tagged(`Emu`, [`EmuName`,                 `RomdataOutParDir`,          `Icon`] )
exports.Mame         = Emu(`Mame64`,                  `${outputDir}/Mame`,         `Mame`)
exports.RetroArch    = Emu(`Retroarch Arcade (Mame)`, `${outputDir}/RetroArch`,    `RetroArch`)

exports.makeEmu = (mameExe, outputDir) => {
  const emuChoice = /RetroArch/i.test(mameExe)? `RetroArch` : `Mame`
  return Emu(mameExe, `${outputDir}/${emuChoice}`, emuChoice)
}
