'use strict'

const cleanSoftlists             = require('./cleanSoftlists.js')
const cleanDevices               = require('./cleanDevices.js')
const mungeCompanyAndSystemNames = require('./mungeCompanyAndSystemNames.js')
const mungeCompanyForType        = require('./mungeCompanyForType.js')   
const makeFinalSystemTypes       = require('./makeFinalSystemTypes.js')
const removeBoringSystems        = require('./removeBoringSystems.js')
const printEfind                 = require('./printEfind.js')
const printSystemsDat            = require('./printSystemsDat.js')
const {existingDatReaderAsync}   = require('./existingDatReader.js')

module.exports = {
    cleanSoftlists
  , cleanDevices
  , mungeCompanyAndSystemNames
  , mungeCompanyForType
  , makeFinalSystemTypes
  , removeBoringSystems
  , printEfind
  , printSystemsDat
  , existingDatReaderAsync 
}
