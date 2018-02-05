'use strict'

/*   After determining that we have a gamename clash with a system's softlists, we need to prepare
 *   the new parameters that are going to fix each name clash by being more specific about what to call
 *   The best plan seems to be to look at the device type of the first 'part' of a software list entry
 *   (a part is like a single disk in a box of 4 that the game came on). TODO: however it was noted
 *   somewhere that some c64 cart softlist entries consisted of a cart AND a flop
 *
 *   It would be tempting to think that the postfix of the first part's device name in a softlist entry
 *   is the same as how the emulator would call it, but flop1 in the softlist part name means its the first
 *   disk in the box, not that it loads in its repsective emulators by using device -'flop1' */

const theLastChar = str => str.slice(-1)
const isTheLastCharAOne = str => theLastChar(str) === `1`
const isTheLastCharAZero = str => theLastChar(str) === `0`
const postfixLastDigitIfNecessary = str => { 
  return  isTheLastCharAOne(str)? str 
    : isTheLastCharAZero(str)? `${str.slice(0, -1)}1`
      : `${str}1`
}
const addHypen = str => `-${str}`
const partNameToDeviceCall = str => addHypen(postfixLastDigitIfNecessary(str))

// TODO: same code as in src/scan/datAndEfind/printEfind
const exceptions = {
    nes_ade : "ade"
  , nes_ntbrom : "ntb"
  , nes_kstudio : "karaoke"
  , nes_datach: "datach"
  , snes_bspack: "bsx"
  , snes_strom: "sufami"
  , snes_vkun: "tbc - not found"
}

// If a gamename clashes with another game on a softlist for this system, we'll replace the entire call made 
//   to the efinder soflist emulator, with what we'll prepare here, so we can specify device. This is complicated
//   by soflists like `nes_ade` which need a customised call we'll ahve to repeat
const makeParameters = (systemCall, softlistName, firstPartsDevice, log) => {
  const result =  softlistName in exceptions? 
      `${systemCall} -cart ${exceptions[softlistName]} -cart2 %ROMMAME%` 
    : `${systemCall} ${partNameToDeviceCall(firstPartsDevice)} %ROMMAME%`  
  log.otherGameConflicts && console.log(`   ---> disambiguate by printing overwrite params: ${result}`)
  return result
}



module.exports = {makeParameters}
