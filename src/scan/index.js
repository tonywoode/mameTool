'use strict'

const fs               = require('fs')
const ini              = require('ini')
const R                = require('ramda')
const _throw           = m => { throw new Error(m) }

const makeSystemsAsync = require('./readMameXml.js').makeSystemsAsync
const cleanJson        = require('./cleanJson.js').cleanJson
const iniToJson        = require('./fillFromIni.js').iniToJson
const inis             = require('./inis.json')
const printJson        = require('./printJson')


//scanning means filter a mame xml into json, add inis to the json, then make a file of it
const scan = (settings, jsonOutPath, qpIni) => {
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
    .catch(err => _throw(err) )
}


module.exports = {
    makeSystemsAsync
  , cleanJson
  , iniToJson
  , inis
  , printJson
  , scan
}
