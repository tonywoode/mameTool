'use strict'

const outputDir          = require(`./getDir.js`).getOutputDir() //also needs changing in package.json config

const {tagged}           = require('daggy')
const Emu = tagged(`Emu`, [`EmuName`,                 `RomdataOutParDir`,          `Icon`] )
exports.Mame         = Emu(`Mame64`,                  `${outputDir}/mame`,         `mame`)
exports.RetroArch    = Emu(`Retroarch Arcade (Mame)`, `${outputDir}/retroarch`,    `RetroArch`)


