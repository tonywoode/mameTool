'use strict'

const {map, assoc} = require('ramda')
const {loadIni} = require('./iniReader.js')

// I think its faster to search the ini for a each mame game than to search for each ini entry in the mame json
const getEntryFromIni = ini => call => ini[call]

// pointfree takes the mame json
const fillFromIni = (typeOfIni, ini) => map( game => {
  const settingForThisGame = getEntryFromIni(ini)(game[`call`])
  return settingForThisGame? assoc(typeOfIni, settingForThisGame, game) : game
})

// parse, format and incorporate an ini into our mame JSON,
//   note this works by the ini name being the same as they key in the json
const iniToJson = (iniDir, ini) => {
  const parsedIni = loadIni(iniDir, ini)
  return fillFromIni(ini.iniName, parsedIni) 
}

module.exports = { iniToJson, getEntryFromIni, fillFromIni }
