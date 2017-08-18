'use strict'

const R = require(`ramda`)
const {readFile, createReadStream} = require(`fs`)

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

// LHS = fills json with named kv, RHS = resolves to a parsed ini file,
//   there are three types of ini file (see iniReader.js)
//   n.b.: to add an ini to romdata, also populate it in makeRomdata
decideWhetherToXMLAsync()
  
  .then( systems => {
    const mameJson = R.pipe(
       fillFromIni(`arcade`      , loadIni(`bare`,    `arcade`) )
     , fillFromIni(`arcadeNoBios`, loadIni(`bare`,    `arcade_NOBIOS`) )
     , fillFromIni(`rating`      , loadIni(`section`, `bestgames`) )
     , fillFromIni(`category`    , loadIni(`section`, `category`) )
     , fillFromIni(`catlist`     , loadIni(`section`, `catlist`) )
     , fillFromIni(`genre`       , loadIni(`section`, `genre`) )
     , fillFromIni(`language`    , loadIni(`section`, `languages`))
     , fillFromIni(`mamescore`   , loadIni(`kv`,      `mamescore`, `MAMESCORE`) )
     , fillFromIni(`mess`        , loadIni(`bare`,    `mess`) )
     , fillFromIni(`monochrome`  , loadIni(`section`, `monochrome`) )
     , fillFromIni(`players`     , loadIni(`kv`,      `nplayers`, `NPlayers`) )
     , fillFromIni(`screenless`  , loadIni(`bare`,    `screenless`) )
     , fillFromIni(`series`      , loadIni(`section`, `series`) )
     , fillFromIni(`version`     , loadIni(`section`, `version`) )
     , cleanJson
     , printJson(jsonOutPath) 
    )(systems) 
  
   return mameJson
  })
  
  .then( mameJson => {
    prepareBaseDir(romdataOutBaseDir, `mame`)
    const romdata = makeRomdata(`Mame64`)(mameJson)
    printRomdata(`${romdataOutBaseDir}/full`, `romdata.dat`)(romdata)
    printIconFile(`${romdataOutBaseDir}/full`, winIconDir, `mame`)
  })
  
