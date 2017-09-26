'use strict'

const {tagged}       = require('daggy')
const Emu = tagged(`Emu`, [`EmuName`,                       `Icon`] )
exports.Mame         = Emu(`Mame64 Win32`,                  `Mame`)
exports.RetroArch    = Emu(`Retroarch Arcade (Mame) Win32`, `RetroArch`)

exports.makeEmu      = mameExe => {
  const emuChoice = /RetroArch/i.test(mameExe)? `RetroArch` : `Mame`
  return Emu(mameExe, emuChoice)
}
