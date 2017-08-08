'use strict'

const R = require(`ramda`)

// I think its faster to search the ini for a each mame game than to search for each ini entry in the mame json
const getEntryFromIni = ini => call => ini[call]

const fillFromIni = (ini, typeOfIni) =>  mameJson => {

  const loadedGetEntryFromIni = getEntryFromIni(ini)
  const mameJsonFilled = R.map( game => {
    const settingForThisGame = loadedGetEntryFromIni(game.call)
    return settingForThisGame? R.assoc(typeOfIni, settingForThisGame, game) : game
  }, mameJson)
  
  return mameJsonFilled
}

module.exports = { getEntryFromIni, fillFromIni }
