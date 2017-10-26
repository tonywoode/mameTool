'use strict'

const fs               = require('fs')
const ini              = require('ini')
const R                = require('ramda')
const _throw           = m => { throw new Error(m) }

//these will run standalone scans for arcade-mame & mess respectively
const {arcadeScan}  = require('./arcadeScan')
const {datAndEfind} = require('./datAndEfind')

//originally arcade scan's modules
const makeSystemsAsync = require('./readMameXml.js').makeSystemsAsync
const cleanJson        = require('./arcadeScan/cleanJson.js').cleanJson
const iniToJson        = require('./arcadeScan/fillFromIni.js').iniToJson
const inis             = require('./arcadeScan/inis.json')
const printJson        = require('./arcadeScan/printJson')

//originally mess' modules
//const {makeMessSystemsAsync}     = require('./datAndEfind/readMameXML.js')
const cleanSoftlists             = require('./datAndEfind/cleanSoftlists.js')
const cleanDevices               = require('./datAndEfind/cleanDevices.js')
const mungeCompanyAndSystemNames = require('./datAndEfind/mungeCompanyAndSystemNames.js')
const mungeCompanyForType        = require('./datAndEfind/mungeCompanyForType.js')   
const makeFinalSystemTypes       = require('./datAndEfind/makeFinalSystemTypes.js')
const removeBoringSystems        = require('./datAndEfind/removeBoringSystems.js')
const print                      = require('./datAndEfind/print.js')
const printSysdatAndJson         = require('./datAndEfind/printSysdatAndJson.js')
const {existingDatReaderAsync}   = require('./datAndEfind/existingDatReader.js')

//originally embedded's modules
const mungeCompanyAndSystemNamesEmbedded = require('./embeddedSystems/mungeCompanyAndSystemNames.js')
const removeBoringSystemsEmbedded        = require('./embeddedSystems/removeBoringSystems.js')


//scanning means filter a mame xml into json, add inis to the json, then make a file of it
const scan = (settings, jsonOutPath, qpIni, efindOutPath, datInPath, datOutPath, mameEmu, log) => {
  console.log(
`MAME xml file:          ${settings.mameXMLInPath}  
MAME ini dir:           ${settings.iniDir}`
  )
  const iniDir            = settings.iniDir
  settings.mameXMLInPath  || _throw(`there's no MAME XML`)
  const  mameXMLStream    = fs.createReadStream(settings.mameXMLInPath)
  const datInStream       = fs.createReadStream(datInPath)

  //first make the promises
  const existingSystemsDatPromise = existingDatReaderAsync(datInStream)
  const sysObjPromise =  makeSystemsAsync(mameXMLStream)  
  //const messJsonPromise =  makeMessSystemsAsync(stream)

  Promise.all([sysObjPromise, existingSystemsDatPromise])
    .then( ([sysObj, existingSystemsDat]) => { 
      //post process the arcade scrape
      const {arcade}   = sysObj 
      const messJson   = sysObj.systems 
      const {embedded} = sysObj
      /* process all the inis into the json we specify their type (and their internal name if necessary)
       *   there are three types of ini file (see iniReader.js)
       *   n.b.: to add an ini to romdata, also populate it in makeRomdata */
      const mameJson = R.pipe( arcade =>
        inis.reduce( (systems, ini) => iniToJson(iniDir, ini)(systems), arcade), cleanJson
      )(arcade) 

      //post process the mess json
      const processedMessJson =  R.pipe(
           cleanSoftlists
        ,  cleanDevices
        ,  mungeCompanyAndSystemNames
        ,  mungeCompanyForType
        ,  makeFinalSystemTypes
        ,  removeBoringSystems
        ,  print(efindOutPath, mameEmu, log)
        ,  printSysdatAndJson(log, existingSystemsDat, datOutPath, jsonOutPath + 'mess')
        )(messJson)

      //post process the embedded json
      /* here we pair down the imp elsewhere to print us a set of embedded systems in mess
       * TODO: a correct output probably needs an IsMess filter (there are 
       * about 20 items that seem too arcadey when run against mame.xml rather than mess.xml */
      const processedEmbeddedJson = R.pipe(
          mungeCompanyAndSystemNamesEmbedded
        , removeBoringSystemsEmbedded
      )(embedded)


      const newSysObj = { versionInfo: sysObj.versionInfo, arcade: mameJson, systems : processedMessJson, embedded: processedEmbeddedJson }
      printJson(jsonOutPath)(newSysObj) //print out json with inis included, and also version info
     
      //save the version information into quickplay's ini file, do it last then a throw will end up least contradictory
      const config = ini.parse(fs.readFileSync(qpIni, `utf-8`))
      config.MAME.MameXMLVersion = sysObj.versionInfo.mameVersion
      fs.writeFileSync(qpIni, ini.stringify(config)) 
      console.log(`Success: Read XML ${sysObj.versionInfo.mameVersion}`)
      return newSysObj
    })
    .catch(err => _throw(err) )



}


module.exports = { scan, arcadeScan, datAndEfind}
