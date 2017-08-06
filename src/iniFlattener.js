'use strict'

/*
 * Many Mame ini files use section header as the value and the game the setting relates to as the key-in-section
 *  our ini reader nicely sets the value of these keys to true, but the lookup and match against the mameJson
 *  would be horrendous. Instead, flip the order for those inis and return a plain k-v of game to section
 */

const R = require('ramda')
const {readFileSync} = require(`fs`)
const iniReader          = require(`./iniReader.js`)
const iniDir             = `/Volumes/GAMES/MAME/EXTRAs/folders/`
const categories         = readFileSync(`${iniDir}/category.ini`, `utf-8`)

/* https://github.com/npm/ini/issues/60i, https://github.com/npm/ini/issues/22
 *  they are adament that dots are valid separators in ini file format, but is that really borne by the spec?
 *  I tried some other ini libraries, best to stick with this...
 */
const dotSafeCategories  = categories.replace(/\./g, `\\.`)
const parsedCategories   = iniReader(dotSafeCategories)

const flatInvert = {}

//key is the section, value is the object of that section, and game is each key in that object
const blessValuesWithParentKeyName = ( value, key ) => R.map( game => {
  flatInvert[game] = key 
}, R.keys(value))

R.forEachObjIndexed(blessValuesWithParentKeyName, parsedCategories)

console.log(flatInvert)

return flatInvert

