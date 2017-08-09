'use strict'

const R = require(`ramda`)

const {readFileSync, createReadStream } = require(`fs`)
const {fillFromIni}      = require(`./src/fillFromIni.js`)
const {loadKVIni, loadSectionIni} = require(`./src/iniReader.js`)
const makeSystemsAsync   = require(`./src/readMameXml.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {printJson, printRomdata, printIconFile} 
                         = require(`./src/printers.js`)
const iniFlattener       = require('./src/iniFlattener.js')

const mameXMLInPath      = `./inputs/mame187.xml`
const mameXMLStream      = createReadStream(mameXMLInPath)

const jsonOutPath        = `./outputs/mame.json`
const romdataOutDir      = `./outputs/mame`
const mameExtrasDir      = `F:\\Mame\\Extras\\Icons`
const iniDir             = `/Volumes/GAMES/MAME/EXTRAs/folders/`

const nplayers           = loadKVIni(iniDir, `nplayers`, `NPlayers`)
const languages          = loadSectionIni( iniDir, `languages`)
const categories         = loadSectionIni( iniDir, `category`)
const bestGames          = loadSectionIni( iniDir, `bestgames`)

//flow
makeSystemsAsync(mameXMLStream).then( systems => {
  const romdata = R.pipe(
     fillFromIni(nplayers, `players`)
   , fillFromIni(languages, `language`)
   , fillFromIni(categories, `category`)
   , fillFromIni(bestGames, `rating`)
   , printJson(jsonOutPath) 
   , makeRomdata(`Mame64`)
   , printRomdata(romdataOutDir, `romdata.dat`)
  )(systems) 

  printIconFile(romdataOutDir, mameExtrasDir, `mame`)

})

