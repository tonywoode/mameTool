'use strict'

const R = require(`ramda`)

// I think its faster to search the ini for a each mame game than to search for each ini entry in the mame json
const getCategories = ini => call => ini[call]

const fillCategories = (mameJson, ini) => {

  const loadedGetCategories = getCategories(ini)
  const mameJsonWithCategories = R.map( game => {
    const category = loadedGetCategories(game.call)
    return category? R.assoc(`category`, category, game) : game
  }, mameJson)
  
  return mameJsonWithCategories
}

module.exports = { getCategories, fillCategories }
