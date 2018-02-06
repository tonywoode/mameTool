'use strict'

const R = require('ramda')

 /* MESS didn't enforce that its mamenames for games were unique in the right scope: different devices of the same 
   *   machine may have identical gamenames. And it gets worse: we can't just ALWAYS disambiguate by calling the
   *   device ("famicom -flop1 smb2), because MESS also performs other tricks like multi-disc loading when supplied
   *   just a mamename (so calling "-flop1" will break it). Even worse: we can't be sure which device MESS will treat
   *   any particular system's 'default' as - so if we don't specify a device flag, we don't know if this system will load
   *   cass or flop or cart. So atm it looks like the only option is to try not to specify a device, but if we must, we must
   *   specify the device on both sides of a conflict: "famicom -flop1 smb2" and "famicom -cass1 smb2". On a positive note,
   *   systems have 'compatible' and 'original' softlists, and it works fairly well to ignore 'compatible' ones: I don't
   *   think MESS will ever decide to load an msx1 game on an msx2 in preference to an msx2 game
   *
   * One limitation of this strategy is that you can no longer consider in future getting a rom path from the user and putting it in
   *   each romdata entry (so that other emulators can try and call mame's softlist game), since affected games will
   *   undergo parameter replacement irrespective of the emulator called. You'd have to make a new set of folders, or alter
   *   the softlist emulator definitions to include these calls instead, and introduce a 'mamename' emulator for each system
   *   for standard calls */

const makeOtherSoftlists = (softlistParams, log) => {
  let originalOtherSoftlists = []
  //don't do work if there are no other softlists
  if (softlistParams.thisEmulator.otherSoftlists.length) { 
    if (log.otherGameNames) {
      console.log(`   ----> ${softlistParams.thisEmulator.name} other softlists: ${R.keys(softlistParams.otherGameNames)}`)
    }
    //remove the 'compatible' softlists for this system
    const isOriginal = softlist => softlist.status === `original`
    originalOtherSoftlists = R.pluck('name', R.filter(isOriginal, softlistParams.thisEmulator.otherSoftlists))
    if (log.otherGameNames) {
      originalOtherSoftlists.length?  
        console.log(`        ----> ${softlistParams.thisEmulator.name}: Original softlists ${originalOtherSoftlists}`) 
       : 
        console.log(`      ----> ${softlistParams.thisEmulator.name}: No Original Softlists`)
    }
  }
  return originalOtherSoftlists
}


//this tests for equality
const match = (otherGameName, ourGameName) => otherGameName === ourGameName

//this will see if a gamename exists in a list of gamenames
const checkMameNameInNameList = (ourGameName, gameNames, otherSoftlistBeingChecked, softlistParams, log) => {
  const result = R.any(otherGameName => match(otherGameName, ourGameName))(gameNames)
  if ( result && log.otherGameConflicts ) {
    console.log(   ` **** SOFTLIST NAME CONFLICT: ${ourGameName} in ${softlistParams.thisEmulator.name} conflicts with ${otherSoftlistBeingChecked}`)
  }
  return result
}

//and this will check each original softlist in turn
const checkOriginalSoftlistNames = (ourGameName, originalOtherSoftlists, softlistParams, log) => {
  const result = R.map(otherSoftlistBeingChecked => 
    checkMameNameInNameList(ourGameName, softlistParams.otherGameNames[otherSoftlistBeingChecked], otherSoftlistBeingChecked, softlistParams, log), originalOtherSoftlists)
  //result will now be an array (because each other softlist has been compared to one game name from this softlist). if any of the items is true, we return true
  return result.includes(true)
}

//for each of the softlists in originalOtherSoftlists, find that as a key in the softlist names, and see if it has our gamename
const doWeNeedToSpecifyDevice = (originalOtherSoftlists, call, softlistParams, log) =>  
  originalOtherSoftlists.length? checkOriginalSoftlistNames(call, originalOtherSoftlists, softlistParams, log) : false


module.exports = { makeOtherSoftlists, doWeNeedToSpecifyDevice }
