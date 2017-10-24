'use strict'

const fs                         = require('fs')
const R                          = require('ramda')
const XmlStream                  = require('xml-stream')

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
const datAndEfind = (jsonOutDir, jsonOutName, datInPath, mameXMLInPath, mameIniOutPath, rarchIniOutPath, datOutPath, logIni, logDat, logJSON) => {
  const jsonOutPath     = `${jsonOutDir}/${jsonOutName}`
  const datInStream     = fs.createReadStream(datInPath)
  const stream          = fs.createReadStream(mameXMLInPath)
  const xml             = new XmlStream(stream)

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

}

module.exports = {datAndEfind}
