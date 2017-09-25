'use strict'

const outputDir          = require(`./getDir.js`).getOutputDir() //also needs changing in package.json config

const {tagged}           = require('daggy')
const Emu = tagged(`Emu`, [`EmuName`,                 `Icon`] )
exports.Mame         = Emu(`Mame64`,                  `Mame`)
exports.RetroArch    = Emu(`Retroarch Arcade (Mame)`, `RetroArch`)

exports.makeEmu = mameExe  => {
  const emuChoice = /RetroArch/i.test(mameExe)? `RetroArch` : `Mame`
  return Emu(mameExe, emuChoice)
}
