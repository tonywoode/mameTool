'use strict'

const R                 = require('ramda')

const makeOtherSoftlists = (softlistParams, log) => {
  var originalOtherSoftlists = []
  //to start with we don't want to do any work if there are no other softlists
  if (softlistParams.thisEmulator.otherSoftlists.length) { 
    if (log.otherGameNames) {
      console.log(`   ----> ${softlistParams.thisEmulator.name} other softlists: ${R.keys(softlistParams.otherGameNames)}`)
    }
    //next remove the 'compatible' softlists for this system
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


  //next the function. so we need to say: for each of the softlists in originalOtherSoftlists, find that as a key in the softlist names, and see if it has our gamename
  
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


module.exports = { makeOtherSoftlists, checkOriginalSoftlistNames }
