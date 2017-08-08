'use strict'

const R = require(`ramda`)

const {readFileSync, createReadStream } = require(`fs`)
const {fillFromIni}      = require(`./src/fillFromIni.js`)
const iniReader          = require(`./src/iniReader.js`)
const makeSystemsAsync   = require(`./src/readMameXml.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {printJsonToFile, printRomdata 
        , printIconFile} = require(`./src/printers.js`)
const iniFlattener       = require('./src/iniFlattener.js')

const mameXMLInPath      = `./inputs/mame187.xml`
const mameXMLStream      = createReadStream(mameXMLInPath)

const jsonOutPath        = `./outputs/mame.json`
const romdataOutDir      = `./outputs/mame`
const mameExtrasDir      = `F:\\Mame\\Extras\\Icons`
const iniDir             = `/Volumes/GAMES/MAME/EXTRAs/folders/`

// this will load an ini file using the ini reader...
const loadIni = (iniDir, iniName) => 
  iniReader(readFileSync(`${iniDir}/${iniName}.ini`, `utf-8`) )
// BUT, either that ini will have an annoying section header preventing it from being generic....
// (sectionName is the top-level-key to remove, since its different to the filename..sigh...)
const loadKVIni = (iniDir, iniName, sectionName) => 
  R.prop(sectionName, loadIni(iniDir, iniName) )
// OR, it will be section-to-key addressable, a nightmare to look up against....
const loadSectionIni = (iniDir, iniName) => 
  iniFlattener(loadIni(iniDir, iniName) )

const nplayers       = loadKVIni(iniDir, `nplayers`, `NPlayers`)
const categories     = loadSectionIni( iniDir, `category`)

//flow
makeSystemsAsync(mameXMLStream).then( systems => { 
  const systemsWithPlayers = fillFromIni(systems, nplayers, `players`)
  const systemsWithCategories = fillFromIni(systemsWithPlayers, categories, `category`) 
  const romdata = makeRomdata(systemsWithCategories, `Mame64`)
  
  printJsonToFile(systemsWithCategories, jsonOutPath) 
  printRomdata(romdata, romdataOutDir, `romdata.dat`)
  printIconFile(romdataOutDir, mameExtrasDir, `mame`)
})

