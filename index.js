'use strict'

const R = require(`ramda`)
const {readFile, createReadStream} = require(`fs`)
const _throw             = m => { throw new Error(m) }

const {cleanJson}        = require(`./src/cleanJson.js`)
const {iniToJson}        = require(`./src/fillFromIni.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {makeSystemsAsync} = require(`./src/readMameXml.js`)
const {printJson, printRomdataFolder, prepareBaseDir} 
                         = require(`./src/printers.js`)
const {sublist, getUniqueProps} = require(`./src/filterMameJson.js`)
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

// these are the available inis, specifying their type (and their internal name if necessary)
//   there are three types of ini file (see iniReader.js)
//   n.b.: to add an ini to romdata, also populate it in makeRomdata
const inis = [
    { iniName: `arcade`,        iniType: `bare`}
  , { iniName: `arcade_NOBIOS`, iniType: `bare`}
  , { iniName: `bestgames`,     iniType: `section`}
  , { iniName: `category`,      iniType: `section`}
  , { iniName: `catlist`,       iniType: `section`}
  , { iniName: `genre`,         iniType: `section`}
  , { iniName: `languages`,     iniType: `section`}
  , { iniName: `mamescore`,     iniType: `kv`,     sectionName: `MAMESCORE`}
  , { iniName: `mess`,          iniType: `bare`}
  , { iniName: `monochrome`,    iniType: `section`}
  , { iniName: `nplayers`,      iniType: `kv`,     sectionName: `NPlayers`}
  , { iniName: `screenless`,    iniType: `bare`}
  , { iniName: `series`,        iniType: `section`}
  , { iniName: `version`,       iniType: `section`}
]

decideWhetherToXMLAsync()
  
  .then( systems => {
    // process all the inis into the json
    const filledSystems = inis.reduce( (systems, ini) => 
      iniToJson(ini.iniName, ini.iniType, ini.sectionName)(systems), systems ) 
    // post-process the data-complete json, printing it becomes a gatepost
    const mameJson = R.pipe(
       cleanJson
     , printJson(jsonOutPath) 
    )(filledSystems) 
  
   return mameJson
  })
  
  .then( mameJson => {
    prepareBaseDir(romdataOutBaseDir, `mame`)

    // make the initial full thing
    const fullRomdata = makeRomdata(`Mame64`)(mameJson)
    printRomdataFolder(`${romdataOutBaseDir}/full`, `romdata.dat`, winIconDir, `mame`)(fullRomdata)

    // then its time to make a filter, lets take out all mechanical games
    const nonMechanicalJson = sublist(`remove`, [`ismechanical`] )(mameJson)
    const nonMechanicalRomdata = makeRomdata(`Mame64`)(nonMechanicalJson)
    printRomdataFolder(`${romdataOutBaseDir}/nonMechanical`, `romdata.dat`, winIconDir, `mame`)(nonMechanicalRomdata)

    // now see what a decloned full romdata looks like 
    const deClonedJson = sublist(`remove`, [`cloneof`] )(mameJson)
    const deClonedRomdata = makeRomdata(`Mame64`)(deClonedJson)
    printRomdataFolder(`${romdataOutBaseDir}/deCloned`, `romdata.dat`, winIconDir, `mame`)(deClonedRomdata)

    // then filter out casino games
    const noCasinoJson = sublist(`remove`, [`genre`], `Casino`)(mameJson)
    const noCasinoRomdata = makeRomdata(`Mame64`)(noCasinoJson)
    printRomdataFolder(`${romdataOutBaseDir}/noCasino`, `romdata.dat`, winIconDir, `mame`)(noCasinoRomdata)

    // then filter out Driving games
    const onlyDrivingJson = sublist(`keep`, [`genre`], `Driving`)(mameJson)
    const onlyDrivingRomdata = makeRomdata(`Mame64`)(onlyDrivingJson)
    printRomdataFolder(`${romdataOutBaseDir}/onlyDriving`, `romdata.dat`, winIconDir, `mame`)(onlyDrivingRomdata)

    /* now make a naive no-mature set. Analysing the data shows we need to filter 
     *  BOTH by regex of Mature in catlist AND category. There's no point filtering
     *  by the genre "Mature" (its a tiny subset of those two), but we also need 
     *  to look for !word-separated "Adult" and "Sex" in game title
     *  There is a mature.ini available here: http://www.progettosnaps.net/catver/
     *  but in my experience, it doesn't filter out all of this...
     */

    const noMatureCategoryJson = sublist(`remove`, [`category`], /Mature/)(mameJson)
    const noMatureCatlistAndCategoryJson = sublist(`remove`, [`catlist`], /Mature/)(noMatureCategoryJson)
    const noMatureIniOrAdultJson = sublist(`remove`, [`system`], /\WAdult\W/i)(noMatureCatlistAndCategoryJson)
    const noMatureIniOrAdultOrSexJson = sublist(`remove`, [`system`], /\WSex\W/i)(noMatureIniOrAdultJson)

    const noMatureRomdata = makeRomdata(`Mame64`)(noMatureIniOrAdultOrSexJson)
    printRomdataFolder(`${romdataOutBaseDir}/noMature`, `romdata.dat`, winIconDir, `mame`)(noMatureRomdata)


    return fullRomdata
  })

  .catch(err => _throw(err) )
