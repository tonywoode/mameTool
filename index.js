'use strict'

const R = require(`ramda`)
const {readFile, createReadStream} = require(`fs`)
const _throw             = m => { throw new Error(m) }

const {cleanJson}        = require(`./src/cleanJson.js`)
const {iniToJson}        = require(`./src/fillFromIni.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {makeSystemsAsync} = require(`./src/readMameXml.js`)
const {printJson, printRomdata, printIconFile, prepareBaseDir} 
                         = require(`./src/printers.js`)
const {rejectBool, getUniqueProps, filterProp, removeProp} = require(`./src/filterMameJson.js`)
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
    printRomdata(`${romdataOutBaseDir}/full`, `romdata.dat`)(fullRomdata)
    printIconFile(`${romdataOutBaseDir}/full`, winIconDir, `mame`)

    // then its time to make a filter, lets take out all mechanical games
    const nonMechanicalJson = rejectBool([`ismechanical`], mameJson)
    const nonMechanicalRomdata = makeRomdata(`Mame64`)(nonMechanicalJson)
    printRomdata(`${romdataOutBaseDir}/nonMechanical`, `romdata.dat`)(nonMechanicalRomdata)
    printIconFile(`${romdataOutBaseDir}/nonMechanical`, winIconDir, `mame`)

    // now see what a decloned full romdata looks like 
    const deClonedJson = rejectBool([`cloneof`], mameJson)
    const deClonedRomdata = makeRomdata(`Mame64`)(deClonedJson)
    printRomdata(`${romdataOutBaseDir}/deCloned`, `romdata.dat`)(deClonedRomdata)
    printIconFile(`${romdataOutBaseDir}/deCloned`, winIconDir, `mame`)

    // then filter out casino games
    const noCasinoJson = removeProp([`genre`], `Casino`, mameJson)
    const noCasinoRomdata = makeRomdata(`Mame64`)(noCasinoJson)
    printRomdata(`${romdataOutBaseDir}/noCasino`, `romdata.dat`)(noCasinoRomdata)
    printIconFile(`${romdataOutBaseDir}/noCasino`, winIconDir, `mame`)

    // then filter out Driving games
    const onlyDrivingJson = filterProp([`genre`], `Driving`, mameJson)
    const onlyDrivingRomdata = makeRomdata(`Mame64`)(onlyDrivingJson)
    printRomdata(`${romdataOutBaseDir}/onlyDriving`, `romdata.dat`)(onlyDrivingRomdata)
    printIconFile(`${romdataOutBaseDir}/onlyDriving`, winIconDir, `mame`)

    /* now make a naive no-mature set. Analysing the data shows we need to filter 
     *  BOTH by regex of Mature in catlist AND category. There's no point filtering
     *  by the genre "Mature" (its a tiny subset of those two), but We also need 
     *  to look for !word-separated "Adult" and "Sex" in game title
     */

    const noMatureCategoryJson = removeProp([`category`], /Mature/, mameJson)
    const noMatureCatlistAndCategoryJson = removeProp([`catlist`], /Mature/, noMatureCategoryJson)
    const noMatureIniOrAdultJson = removeProp([`system`], /\WAdult\W/i, noMatureCatlistAndCategoryJson)
    const noMatureIniOrAdultOrSexJson = removeProp([`system`], /\WSex\W/i, noMatureIniOrAdultJson)

    const noMatureRomdata = makeRomdata(`Mame64`)(noMatureIniOrAdultOrSexJson)
    printRomdata(`${romdataOutBaseDir}/noMature`, `romdata.dat`)(noMatureRomdata)
    printIconFile(`${romdataOutBaseDir}/noMature`, winIconDir, `mame`)


    return fullRomdata
  })

  .catch(err => _throw(err) )
