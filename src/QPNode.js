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
'npm run full'                 deletes the whole outputs folder, full must be run with scan
'npm start -- --scan'          make a mame json output file, which is used by the arcade and mfm flags
'npm start -- --arcade'        make an arcade set to the ini flags in settings.ini, and output to ./outputs
'npm start -- --mfm'           make an arcade set to a fatfile list output of mame file manager, and output to ./outputs
'npm start -- --testArcadeRun' makes a set of both Mame and RetroArch romdata and splits from a canned list
'npm start -- --softlists'     makes a softlist set
'npm debug -- --arcade'        break on ln1 of making an arcade set to the ini flags in settings.ini, and output to ./outputs)
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
settings.devMode        = devMode
settings.isItRetroArch  = path.win32.basename(settings.mameExePath).match(/retroarch/i) //best bet is to limit ourselves to what the emu file is called for this

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

//determine that location of the systems.dat
const datInPath       = devMode? `inputs/systems.dat` : `dats\\systems.dat`
const datOutPath      = devMode? `${outputDir}/systems.dat` : `dats\\systems.dat`
//are we making a mess or retroarch efinder file? to make both the users has to go through the menu again and select the appropriate emu
const efindOutName    = settings.isItRetroArch? `Mess_Retroarch.ini` : `Mess_Mame.ini` 
const efindOutPath    = `${outputDir}/${efindOutName}`

console.log(`EFind Ini output Path   ${efindOutPath}`)

//softlist paths
const mameEmuDir      = path.win32.dirname(settings.mameExePath)
//mess hash dir is determinable realtive to mame exe dir (mame is distributed that way/retroarch users must place it here to work)
const liveHashDir     = settings.isItRetroArch? `${mameEmuDir}\\system\\mame\\hash` : `${mameEmuDir}\\hash`
const hashDir         = devMode? `inputs/hash/` : liveHashDir

//embedded systemes
const messXMLInPathEmbedded = `inputs/mess.xml`
  
//TODO: promisify these so you can run combinations
program.scan          && scan(settings, jsonOutPath, qpIni, efindOutPath, datInPath, datOutPath, log)
program.mfm           && mfm(settings, readMameJson, jsonOutPath, generateRomdata, outputDir)
program.arcade        && arcade(settings, jsonOutPath, outputDir, readMameJson, generateRomdata)
program.testArcadeRun && testArcadeRun(settings, readMameJson, jsonOutPath, outputDir)
program.softlists     && softlists(settings, jsonOutPath, hashDir, outputDir, log)
