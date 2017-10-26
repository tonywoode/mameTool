'use strict'

const cleanJson        = require('./cleanJson.js').cleanJson
const iniToJson        = require('./fillFromIni.js').iniToJson
const inis             = require('./inis.json')

module.exports = {
    cleanJson
  , iniToJson
  , inis
}
