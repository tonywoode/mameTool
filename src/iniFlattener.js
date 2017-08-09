'use strict'

/*
 * Many Mame ini files use section header as the value and the game the setting relates to as the key-in-section
 *  our ini reader nicely sets the value of these keys to true, but the lookup and match against the mameJson
 *  would be horrendous. Instead, flip the order for those inis and return a plain k-v of game to section
 */

const R = require('ramda')

const iniFlattener = ini => {
  const flatInvert = {}

  //key is the section, value is the object of that section, and game is each key in that object
  const sectionedIniToKV = ( value, key ) => R.map( game => {
    flatInvert[game] = key 
  }, R.keys(value))
  
  R.forEachObjIndexed(sectionedIniToKV, ini)
  
  return flatInvert
}

module.exports = iniFlattener
