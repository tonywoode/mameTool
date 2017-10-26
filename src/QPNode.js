'use strict'

const fs                = require('fs')
const program           = require('commander')
const path              = require('path')
const _throw            = m => { throw new Error(m) }

const paths             = require('./paths.js')
//these two are used by multiple modules and are being passed in as dependecies
const {generateRomdata} = require('./romdata/printRomdata.js')
const readMameJson      = require('./romdata/readMameJson.js')

const scan              = require('./scan')
const {arcade}          = require('./arcade')
const {mfm}             = require('./mfm')
const {testArcadeRun}   = require('./testing')
const {softlists}       = require('./softlists')
const {embedded}        = require('./embeddedSystems')

//cmd-line options as parsed by commander
program
    .option('--output-dir [path]')
    //mameTool options
    .option(`--scan`)
    .option(`--arcade`)
    .option(`--mfm`)
    .option(`--dev`)
    .option(`--testArcadeRun`)
    //messTool options
    .option(`--softlists`)
    .option(`--embedded`)
    .parse(process.argv)

//TODO: inconsistent
if (!process.argv.slice(2).length) {
  console.log( 
`MAMETOOL TEST USAGE: 
npm run full -- --scan deletes the whole outputs folder, full must be run with scan
'npm start -- --scan' will make a mame json output file, which is used by the arcade and mfm flags
'npm start -- --arcade' will make an arcade set to the ini flags in settings.ini, and output to ./outputs
'npm start -- --mfm' will make an arcade set to a fatfile list output of mame file manager, and output to ./outputs
'npm debug -- --arcade' will break on ln1 of making an arcade set to the ini flags in settings.ini, and output to ./outputs)
'QPNode --datAndEfind' makes a mess Json, an efind set and a systems dat
'QPNode --softlists' makes a softlist set
'QPNode --embedded' makes the embedded mess romdata for mame
`
)
  process.exit()
}

//calculate these
const outputDir         = program.outputDir
const devMode           = program.dev
const jsonOutDir        = devMode? outputDir : `dats` //json will sit in the frontends config dir, or for dev in the passed-in dir
const jsonOutName       = `mame.json`
const jsonOutPath       = `${jsonOutDir}/${jsonOutName}`
const qpIni             = devMode? `./settings.ini`: `dats\\settings.ini` //settings from QP's ini file, or nix dev settings
const devExtrasOverride = devMode? `/Volumes/GAMES/MAME/EXTRAs/folders` : `` //on windows its specified in the above ini

console.log(
`Dev mode:               ${devMode? `on`: `off`}
Output dir:             ${outputDir}
MAME Json dir:          ${jsonOutDir}` 
)

//read these from the ini
const settings          = paths(qpIni, devExtrasOverride)
const romdataConfig     = { //these same settings get immutably passed to many things
    emu       : settings.mameExe
  , winIconDir: settings.winIconDir
  , devMode
} 

console.log(
`MAME extras dir:        ${settings.mameExtrasPath}
MAME icons dir:         ${settings.winIconDir} 
MAME exe:               ${settings.mameExe}
MAME exe path:          ${settings.mameExePath}`
)

const log = {
  //datAndEfind
    efind      : false 
  , dat        : false 
  , json       : false
  //softlist
  , games      : false 
  , choices    : false 
  , regions    : false 
  , exclusions : false 
  , printer    : false
}

//mess paths
const mameEmu = { isItRetroArch : path.win32.basename(settings.mameExePath).match(/retroarch/i) } //best bet is to limit ourselves to what the emu file is called for this

//determine that location of the systems.dat
const datInPath       = devMode? `inputs/systems.dat` : `dats\\systems.dat`
const datOutPath      = devMode? `${outputDir}/systems.dat` : `dats\\systems.dat`
const efindOutName    = mameEmu.isItRetroArch? `Mess_Retroarch.ini` : `Mess_Mame.ini` 
const efindOutPath    = `${outputDir}/${efindOutName}`

console.log(`EFind Ini output Path   ${efindOutPath}`)

//softlist paths
//determine that hash directory
const mameEmuDir      = path.win32.dirname(settings.mameExePath)
const liveHashDir     = mameEmu.isItRetroArch? `${mameEmuDir}\\system\\mame\\hash` : `${mameEmuDir}\\hash`
const hashDir         = devMode? `inputs/hash/` : liveHashDir

//embedded systemes
const messXMLInPathEmbedded = `inputs/mess.xml`
  
//TODO: give mess systems a proper mock
const mockSystems = (jsonOutPath, callback) => {
  const input = fs.readFileSync(jsonOutPath)
  const systems = JSON.parse(input)
    
  callback(systems, callback)
}

//TODO: promisify these so you can run combinations
program.scan          && scan(settings, jsonOutPath, qpIni, efindOutPath, datInPath, datOutPath, mameEmu, log)
program.mfm           && mfm(settings, readMameJson, jsonOutPath, generateRomdata, outputDir, romdataConfig)
program.arcade        && arcade(settings, jsonOutPath, outputDir, romdataConfig, readMameJson, generateRomdata)
program.testArcadeRun && testArcadeRun(readMameJson, jsonOutPath, outputDir, romdataConfig)
//messtool options
program.softlists     && softlists(mameEmu, jsonOutPath, hashDir, outputDir, log)
program.embedded      && embedded(messXMLInPathEmbedded)
