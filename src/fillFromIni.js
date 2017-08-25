'use strict'

const R = require(`ramda`)
const {loadIni} = require(`./iniReader.js`)

// I think its faster to search the ini for a each mame game than to search for each ini entry in the mame json
const getEntryFromIni = ini => call => ini[call]

// pointfree takes the mame json
const fillFromIni = (typeOfIni, ini) => {

  const mameJsonFilled = R.map( game => {
    const settingForThisGame = getEntryFromIni(ini)(game[`call`])
    return settingForThisGame? R.assoc(typeOfIni, settingForThisGame, game) : game
  })
  
  return mameJsonFilled
}

// parse, format and incorporate an ini into our mame JSON,
//   note this works by the ini name being the same as they key in the json
const iniToJson = (iniName, iniType, sectionName) => {
  const parsedIni = loadIni(iniName, iniType, sectionName)
  return fillFromIni(iniName, parsedIni) 
}

module.exports = { iniToJson, getEntryFromIni, fillFromIni }
