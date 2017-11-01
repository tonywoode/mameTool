'use strict'

const R                              = require('ramda')
const {embeddedSystemsBoringSystems} = require('../../messFilters.json')

module.exports = systems => {

  const isItBoring = obj => { 
    const name = obj.company? `${obj.company} ${obj.system}`: `${obj.system}`
    return embeddedSystemsBoringSystems.includes(name) 
  }
  const systemsWithGames = R.reject(obj => isItBoring(obj), systems)

  return systemsWithGames
}
