'use strict'

const R = require(`ramda`)
const {readFile, createReadStream} = require(`fs`)
const _throw             = m => { throw new Error(m) }

const {cleanJson}        = require(`./src/cleanJson.js`)
const {fillFromIni}      = require(`./src/fillFromIni.js`)
const {loadIni}          = require(`./src/iniReader.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {makeSystemsAsync} = require(`./src/readMameXml.js`)
const {printJson, printRomdata, printIconFile, prepareBaseDir} 
                         = require(`./src/printers.js`)

const mameXMLInPath      = `./inputs/mame187.xml`
const mameXMLStream      = createReadStream(mameXMLInPath)
const jsonOutPath        = `./outputs/mame.json`
const romdataOutBaseDir  = `./outputs/mame`
const winIconDir         = require(`./src/getDir.js`).getWinIconDir()


// If there's an xml that parses in the jsonOutDir, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(jsonOutPath, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : resolve(JSON.parse(data) )  
  )
)

// parse, format and incorporate an ini into our mame JSON,
//   note this works by the ini name being the same as they key in the json
const iniToJson = (iniType, iniName, sectionName) => {
  const parsedIni = loadIni(iniType, iniName, sectionName)
  return fillFromIni(iniName, parsedIni) 
}

// these are the available inis, specifying their type (and their internal name if necessary)
//   there are three types of ini file (see iniReader.js)
//   n.b.: to add an ini to romdata, also populate it in makeRomdata
const inis = [
    [`bare`,    `arcade`]
  , [`bare`,    `arcade_NOBIOS`]
  , [`section`, `bestgames`]
  , [`section`, `category`]
  , [`section`, `catlist`]
  , [`section`, `genre`]
  , [`section`, `languages`]
  , [`kv`,      `mamescore`, `MAMESCORE`]
  , [`bare`,    `mess`]
  , [`section`, `monochrome`]
  , [`kv`,      `nplayers`,   `NPlayers`]
  , [`bare`,    `screenless`]
  , [`section`, `series`]
  , [`section`, `version`]
]

decideWhetherToXMLAsync()
  
  .then( systems => {
    // process all the inis into the json
    const filledSystems = inis.reduce( (systems, ini) => iniToJson(ini[0], ini[1], ini[2])(systems), systems ) 
    // post-process the data-complete json
    const mameJson = R.pipe(
       cleanJson
     , printJson(jsonOutPath) 
    )(filledSystems) 
  
   return mameJson
  })
  
  .then( mameJson => {
    prepareBaseDir(romdataOutBaseDir, `mame`)
    const romdata = makeRomdata(`Mame64`)(mameJson)
    printRomdata(`${romdataOutBaseDir}/full`, `romdata.dat`)(romdata)
    printIconFile(`${romdataOutBaseDir}/full`, winIconDir, `mame`)
    return romdata
  })

  .catch(err => _throw(err) )
