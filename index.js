'use strict'

const R = require(`ramda`)

const {readFile, createReadStream } = require(`fs`)
const {fillFromIni}      = require(`./src/fillFromIni.js`)
const {loadKVIni, loadSectionIni, loadBareIni} = require(`./src/iniReader.js`)
const makeSystemsAsync   = require(`./src/readMameXml.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {printJson, printRomdata, printIconFile} 
                         = require(`./src/printers.js`)
const mameXMLInPath      = `./inputs/mame187.xml`
const mameXMLStream      = createReadStream(mameXMLInPath)

const jsonOutPath        = `./outputs/mame.json`
const romdataOutDir      = `./outputs/mame`
const mameExtrasDir      = `F:\\Mame\\Extras\\Icons`
const iniDir             = `/Volumes/GAMES/MAME/EXTRAs/folders/`

// To add an ini, it must be loaded here as one of the two types, 
// then filled in the pipe below, then added to makeRomdata
const arcade             = loadBareIni(iniDir, `arcade`)
const arcadeNoBios       = loadBareIni(iniDir, `arcade_NOBIOS`)
const bestGames          = loadSectionIni( iniDir, `bestgames`)
const category           = loadSectionIni( iniDir, `category`)
const catlist            = loadSectionIni( iniDir, `catlist`)
const genre              = loadSectionIni( iniDir, `genre`)
const languages          = loadSectionIni( iniDir, `languages`)
const mamescore          = loadKVIni(iniDir, `mamescore`, `MAMESCORE`)
const mess               = loadBareIni(iniDir, `mess`)
const monochrome         = loadSectionIni(iniDir, `monochrome`)
const nplayers           = loadKVIni(iniDir, `nplayers`, `NPlayers`)
const screenless         = loadBareIni(iniDir, `screenless`)
const series             = loadSectionIni(iniDir, `series`)
const version            = loadSectionIni(iniDir, `version`)

// If there's an xml that parses in the json out location, use that, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(jsonOutPath, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : resolve(JSON.parse(data) )  
  )
)

//flow
decideWhetherToXMLAsync().then( systems => {
  const romdata = R.pipe(
     fillFromIni(arcade, `arcade`)
   , fillFromIni(arcadeNoBios, `arcadeNoBios`)
   , fillFromIni(bestGames, `rating`)
   , fillFromIni(category, `category`)
   , fillFromIni(catlist, `catlist`)
   , fillFromIni(genre, `genre`)
   , fillFromIni(languages, `language`)
   , fillFromIni(mamescore, `mamescore`)
   , fillFromIni(mess, `mess`)
   , fillFromIni(monochrome, `monochrome`)
   , fillFromIni(nplayers, `players`)
   , fillFromIni(screenless, `screenless`)
   , fillFromIni(series, `series`)
   , fillFromIni(version, `version`)
   , printJson(jsonOutPath) 
   , makeRomdata(`Mame64`)
   , printRomdata(romdataOutDir, `romdata.dat`)
  )(systems) 

  printIconFile(romdataOutDir, mameExtrasDir, `mame`)

})

