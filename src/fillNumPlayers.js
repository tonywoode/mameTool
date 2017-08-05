'use strict'

const R = require(`ramda`)

// I think its faster to search the ini for a each mame game than to search for each ini entry in the mame json
const getNumPlayers = ini => call => ini.NPlayers[call]

const fillNumPlayers = (mameJson, ini) => {

  const loadedGetNumPlayers = getNumPlayers(ini)
  const mameJsonWithNPlayers = R.map( game => {
    const numPlayers = loadedGetNumPlayers(game.call)
    return numPlayers? R.assoc(`players`, numPlayers, game) : game
  }, mameJson)
  
  return mameJsonWithNPlayers
}

module.exports = { getNumPlayers, fillNumPlayers }
