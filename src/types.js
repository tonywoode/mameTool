'use strict'

const outputDir          = require(`./getDir.js`).getOutputDir()

const {tagged}           = require('daggy')
const Emu = tagged(`Emu`, [`EmuName`,                 `RomdataOutParDir`,          `Icon`] )
exports.Mame         = Emu(`mame64`,                  `${outputDir}mame`,          `mame`)
exports.RetroArch    = Emu(`Retroarch Arcade (Mame)`, `${outputDir}retroarch`,     `RetroArch`)


