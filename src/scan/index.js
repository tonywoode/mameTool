'use strict'

const fs               = require('fs')
const ini              = require('ini')
const R                = require('ramda')
const _throw           = m => { throw new Error(m) }

//TODO: this is in arcadeScan's readMameXML
const XmlStream = require('xml-stream')

//these will run standalone scans for arcade-mame & mess respectively
const {arcadeScan}  = require('./arcadeScan')
const {datAndEfind} = require('./datAndEfind')


const makeSystemsAsync = require('./arcadeScan/readMameXml.js').makeSystemsAsync
const cleanJson        = require('./arcadeScan/cleanJson.js').cleanJson
const iniToJson        = require('./arcadeScan/fillFromIni.js').iniToJson
const inis             = require('./arcadeScan/inis.json')
const printJson        = require('./arcadeScan/printJson')

const readMameXML                = require('./datAndEfind/readMameXML.js')
const cleanSoftlists             = require('./datAndEfind/cleanSoftlists.js')
const cleanDevices               = require('./datAndEfind/cleanDevices.js')
const mungeCompanyAndSystemNames = require('./datAndEfind/mungeCompanyAndSystemNames.js')
const mungeCompanyForType        = require('./datAndEfind/mungeCompanyForType.js')   
const makeFinalSystemTypes       = require('./datAndEfind/makeFinalSystemTypes.js')
const removeBoringSystems        = require('./datAndEfind/removeBoringSystems.js')
const print                      = require('./datAndEfind/print.js')
const printSysdatAndJson         = require('./datAndEfind/printSysdatAndJson.js')



//scanning means filter a mame xml into json, add inis to the json, then make a file of it
const scan = (settings, jsonOutPath, qpIni, efindOutPath, datInPath, datOutPath, mameEmu, log) => {
  console.log(
`MAME xml file:          ${settings.mameXMLInPath}  
MAME ini dir:           ${settings.iniDir}`
  )
  const iniDir            = settings.iniDir
  settings.mameXMLInPath  || _throw(`there's no MAME XML`)
  const  mameXMLStream    = fs.createReadStream(settings.mameXMLInPath)
  makeSystemsAsync(mameXMLStream) 
    .then( sysObj => {
      const {arcade} = sysObj 
     
      /* process all the inis into the json we specify their type (and their internal name if necessary)
       *   there are three types of ini file (see iniReader.js)
       *   n.b.: to add an ini to romdata, also populate it in makeRomdata */
      const mameJson = R.pipe( arcade =>
        inis.reduce( (systems, ini) => iniToJson(iniDir, ini)(systems), arcade ) 
        , cleanJson 
      )(arcade)
  
      const newSysObj = { versionInfo: sysObj.versionInfo, arcade: mameJson }
      printJson(jsonOutPath)(newSysObj) //print out json with inis included, and also version info

      //save the version information into quickplay's ini file, do it last then a throw will end up least contradictory
      const config = ini.parse(fs.readFileSync(qpIni, `utf-8`))
      config.MAME.MameXMLVersion = sysObj.versionInfo.mameVersion
      fs.writeFileSync(qpIni, ini.stringify(config)) 

      return newSysObj
    })
    .then( newSysObj => {
      const datInStream     = fs.createReadStream(datInPath)
      const stream          = fs.createReadStream(settings.mameXMLInPath)
      const xml             = new XmlStream(stream)
      readMameXML( xml, systems => {
        R.pipe(
           cleanSoftlists
        ,  cleanDevices
        ,  mungeCompanyAndSystemNames
        ,  mungeCompanyForType
        ,  makeFinalSystemTypes
        ,  removeBoringSystems
        ,  print(efindOutPath, mameEmu, log)
        ,  printSysdatAndJson(log, datInStream, datOutPath, jsonOutPath + 'mess')
        )(systems)
      
      })
    })
    .catch(err => _throw(err) )
}


module.exports = { scan, arcadeScan, datAndEfind}
