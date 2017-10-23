'use strict'

const fs                = require('fs')
const R                 = require('ramda')
const XmlStream         = require('xml-stream')

const readMameXML                = require('./readMameXML.js')
const cleanSoftlists             = require('./cleanSoftlists.js')
const cleanDevices               = require('./cleanDevices.js')
const mungeCompanyAndSystemNames = require('./mungeCompanyAndSystemNames.js')
const mungeCompanyForType        = require('./mungeCompanyForType.js')   
const makeFinalSystemTypes       = require('./makeFinalSystemTypes.js')
const removeBoringSystems        = require('./removeBoringSystems.js')
const print                      = require('./print.js')
const printSysdatAndJson         = require('./printSysdatAndJson.js')

//JSON, DAT AND EFIND MAKER
const datAndEfind = () => {
 
  const 
      datInPath        = `inputs/systems.dat`
    , datInStream      = fs.createReadStream(datInPath)
    , mameXMLInPath    = `inputs/mame187.xml`
    , stream           = fs.createReadStream(mameXMLInPath)
    , xml              = new XmlStream(stream)
    , mameIniOutPath   = `outputs/Mess_Mame.ini`
    , rarchIniOutPath  = `outputs/Mess_Retroarch.ini`
    , datOutPath       = `outputs/systems.dat`
    , jsonOutPath      = `outputs/systems.json`
  
  //set simple console logging
  const
      logIni  = false
    , logDat  = false
    , logJSON = false
  
  //program flow
  readMameXML( xml, systems => {
  
    R.pipe(
       cleanSoftlists
    ,  cleanDevices
    ,  mungeCompanyAndSystemNames
    ,  mungeCompanyForType
    ,  makeFinalSystemTypes
    ,  removeBoringSystems
    ,  print(mameIniOutPath, rarchIniOutPath, logIni)
    ,  printSysdatAndJson(logDat, logJSON, datInStream, datOutPath, jsonOutPath)
    )(systems)
  
  })
  
  
  function mockSystems(jsonOutPath, callback) {
    const input   = fs.readFileSync(jsonOutPath)
        , systems = JSON.parse(input)
    
    callback(systems, callback)
  }

}

module.exports = {datAndEfind}
