'use strict'

/*   After determining that we have a gamename clash with a system's softlists, we need to prepare
 *   the new parameters that are going to fix each name clash by being more specific about what to call
 *   The best plan seems to be to look at the device type of the first 'part' of a software list entry
 *   (a part is like a single disk in a box of 4 that the game came on). TODO: however it was noted
 *   somewhere that some c64 cart softlist entries consisted of a cart AND a flop
 *
 *   It would be tempting to think that the postfix of the first part's device name in a softlist entry
 *   is the same as how the emulator would call it, but flop1 in the softlist part name means its the first
 *   disk in the box, not that it loads in its respective emulators by using device -'flop1' */


// ensure $device-name01 is enforced
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

/* If a gamename clashes with another game on a softlist for this system, we'll replace the entire call made 
 *   to the efinder soflist emulator, with what we'll prepare here, so we can specify device. This is complicated
 *   by soflists like `nes_ade` which need a customised call we'll have to repeat. Remember the goal here is:
 *     every call that gets printed as an override in the romdata, must have a device call before the gamename 
 *
 *   if the loaderCall includes a call to a device already (as is the case with some of the nes and snes
 *   softlists, don't add another....this entailed adding a -cart2 call to nes_ade, when it didn't actually need it,
 *   (doesn't hurt). A proper fix would be to pass a flag for existing cart call down to here, but the data atm doesn't
 *   require this */
const makeParameters = (systemCall, softlistName, loaderCall, firstPartsDevice, log) => {
  const doesTheLoaderCallAlreadyIncludeASecondDeviceCall = loaderCall => loaderCall.match(/-.*-/) //two device calls 
  const result = loaderCall? 
    doesTheLoaderCallAlreadyIncludeASecondDeviceCall(loaderCall)?
        `${loaderCall} %ROMMAME%` 
      : `${loaderCall} ${partNameToDeviceCall(firstPartsDevice)} %ROMMAME%`
  : `${systemCall} ${partNameToDeviceCall(firstPartsDevice)} %ROMMAME%` 
  log.otherGameConflicts && console.log(`   ---> disambiguate by printing overwrite params: ${result}`)
  return result
}


module.exports = {makeParameters}
