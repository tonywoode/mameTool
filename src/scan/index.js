'use strict'

const fs     = require('fs')
const ini    = require('ini')
const R      = require('ramda')
const _throw = m => { throw new Error(m) }

const {makeSystemsAsync} = require('./readMameXml.js')

//arcade scan's modules
const {cleanJson, iniToJson, inis} = require('./arcadeScan')

//originally mess' modules
const { cleanSoftlists, cleanDevices, mungeCompanyAndSystemNames
      , mungeCompanyForType, makeFinalSystemTypes, removeBoringSystems
      , insertLoadingCalls, printEfind, printSystemsDat, existingDatReaderAsync} = require('./datAndEfind')

//embedded's modules
const {mungeCompanyAndSystemNamesEmbedded, removeBoringSystemsEmbedded} = require('./embeddedSystems')

//scanning means parse, clean and filter a mame xml, 
//  add inis to the json, print some additional files, then make a file of it
module.exports = (settings, jsonOutPath, qpIni, efindOutPath, datInPath, datOutPath, log) => {
  console.log(
`MAME xml file:          ${settings.mameXMLInPath}  
MAME ini dir:           ${settings.iniDir}`
  )
  const iniDir           = settings.iniDir
  settings.mameXMLInPath || _throw(`there's no MAME XML`)
  const mameXMLStream    = fs.createReadStream(settings.mameXMLInPath)
  const datInStream      = fs.createReadStream(datInPath)

  //first make the promises
  const sysObjPromise             = makeSystemsAsync(mameXMLStream)  
  const existingSystemsDatPromise = existingDatReaderAsync(datInStream)

  Promise.all([sysObjPromise, existingSystemsDatPromise])
    .then( ([sysObj, existingSystemsDat]) => { 
      const {versionInfo, arcade, messSystems, embedded} = sysObj 

      //post process the arcade scrape
      /* process all the inis into the json. We specify their type (and their internal name if necessary)
       *   there are three types of ini file (see iniReader.js)
       *   n.b.: to add an ini to romdata, also populate it in makeRomdata */
      const mungedArcade = R.pipe( arcade =>
        inis.reduce( (systems, ini) => iniToJson(iniDir, ini)(systems), arcade), cleanJson
      )(arcade) 

      //do the same for the embedded ini
      const mungedEmbedded = R.pipe( arcade =>
        inis.reduce( (systems, ini) => iniToJson(iniDir, ini)(systems), arcade), cleanJson
      )(embedded) 

      //post process the mess json, printing out an Efind and a refreshed systems.dat along the way
      const mungedMessSystems = R.pipe(
           cleanSoftlists
        ,  cleanDevices
        ,  mungeCompanyAndSystemNames
        ,  mungeCompanyForType
        ,  makeFinalSystemTypes(log)
        ,  removeBoringSystems(log)
        ,  insertLoadingCalls(log)
        ,  printEfind(efindOutPath, settings, log)
        ,  printSystemsDat(log, existingSystemsDat, datOutPath)
        )(messSystems)

      //post process the embedded json - here we pair down the imp elsewhere to print us a set of embedded systems in mess
      const interestingEmbedded = R.pipe(mungeCompanyAndSystemNamesEmbedded, removeBoringSystemsEmbedded)(mungedEmbedded)

      //this will be the json that gets printed and used
      const newSysObj = {versionInfo, arcade: mungedArcade, messSystems: mungedMessSystems, embedded: interestingEmbedded}
      console.log(`Printing mame.json for version ${sysObj.versionInfo.mameVersion} to ${jsonOutPath}`) 
      fs.writeFileSync(jsonOutPath, JSON.stringify(newSysObj, null, `\t`))


      log.json && console.log(fs.readFileSync(jsonOutPath, `utf-8`)) 

      //save the version information into quickplay's ini file, do it last then a throw will end up least contradictory
      const config = ini.parse(fs.readFileSync(qpIni, `utf-8`))
      config.MAME.MameXMLVersion = sysObj.versionInfo.mameVersion
      fs.writeFileSync(qpIni, ini.stringify(config)) 
      console.log(`Success: Read XML ${sysObj.versionInfo.mameVersion}`)
      return newSysObj
    })
    .catch(err => _throw(err) )

}
