'use strict'

const R = require(`ramda`)

const {readFileSync, createReadStream } = require(`fs`)
const {fillNumPlayers}   = require(`./src/fillNumPlayers.js`)
const {fillCategories}   = require(`./src/fillCategories.js`)
const iniReader          = require(`./src/iniReader.js`)
const makeSystemsAsync   = require(`./src/readMameXml.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {printJsonToFile, printRomdata 
        , printIconFile} = require(`./src/printers.js`)
const iniFlattener       = require('./src/iniFlattener.js')

const mameXMLInPath      = `./inputs/mame187.xml`
const jsonOutPath        = `./outputs/mame.json`
const romdataOutDir      = `./outputs/mame`
const mameExtrasDir      = `F:\\Mame\\Extras\\Icons`
const iniDir             = `/Volumes/GAMES/MAME/EXTRAs/folders/`
const nplayers           = iniReader(readFileSync(`${iniDir}/nplayers.ini`, `utf-8`) )
const nplayersFlat       = R.prop(`NPlayers`, nplayers)
const categories         = iniReader(readFileSync(`${iniDir}/category.ini`, `utf-8`) )
const categoriesFlat     = iniFlattener(categories)
const mameXMLStream      = createReadStream(mameXMLInPath)

//flow
makeSystemsAsync(mameXMLStream).then( systems => { 
  const systemsWithPlayers = fillNumPlayers(systems, nplayersFlat)
  const systemsWithCategories = fillCategories(systemsWithPlayers, categoriesFlat) 
  const romdata = makeRomdata(systemsWithCategories, `Mame64`)
  
  printJsonToFile(systemsWithCategories, jsonOutPath) 
  printRomdata(romdata, romdataOutDir, `romdata.dat`)
  printIconFile(romdataOutDir, mameExtrasDir, `mame`)
})

