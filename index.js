'use strict'

const {readFileSync, createReadStream } = require(`fs`)
const {fillNumPlayers}   = require(`./src/fillNumPlayers.js`)
const iniReader          = require(`./src/iniReader.js`)
const makeSystemsAsync   = require(`./src/readMameXml.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {printJsonToFile, printRomdata 
        , printIconFile} = require(`./src/printers.js`)

const mameXMLInPath      = `./inputs/mame187.xml`
const jsonOutPath        = `./outputs/mame.json`
const romdataOutDir      = `./outputs/mame`
const mameExtrasDir      = `F:\\Mame\\Extras\\Icons`
const iniDir             = `/Volumes/GAMES/MAME/EXTRAs/folders/`
const nplayers           = iniReader(readFileSync(`${iniDir}/nplayers.ini`, `utf-8`) )
const mameXMLStream      = createReadStream(mameXMLInPath)

//flow
makeSystemsAsync(mameXMLStream).then( systems => { 
  const systemsWithPlayers = fillNumPlayers(systems, nplayers)
  const romdata = makeRomdata(systemsWithPlayers, `Mame64`)
  
  printJsonToFile(systemsWithPlayers, jsonOutPath) 
  printRomdata(romdata, romdataOutDir, `romdata.dat`)
  printIconFile(romdataOutDir, mameExtrasDir, `mame`)
})


