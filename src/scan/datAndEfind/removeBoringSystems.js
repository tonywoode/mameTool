'use strict'

const R                    = require('ramda')
const {efindBoringSystems} = require('../../messFilters.json')

/* Many systems aren't of interest since they're never going to have enjoyable games
 *  it was easiest to specify the fully munged system types (that's why i'm removing these as a last step) */
module.exports = log => systems => {

  const isItBoring = systemType => { 
    if ( efindBoringSystems.includes(systemType) ) log.efindProblems && console.log( `removing an emu of type ${systemType} - there will likely never be any games`)
    return efindBoringSystems.includes(systemType) 
  }
  
  const systemsWithGames = R.reject(obj => isItBoring(obj.systemType), systems)

  return systemsWithGames
}


