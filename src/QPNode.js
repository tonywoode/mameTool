'use strict'

const program           = require('commander')
const fs                = require('fs')
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

program //cmd-line options as parsed by commander
    .option('--output-dir [path]')
    .option(`--scan`)
    .option(`--dev`)
    //mameTool options
    .option(`--arcade`)
    .option(`--mfm`)
    .option(`--testArcadeRun`)
    //messTool options
    .option(`--softlists`)
    .parse(process.argv)

if (!process.argv.slice(2).length) {
  console.log( 
`MAMETOOL TEST USAGE: 
'npm start -- --scan'          make a mame json output file, which is used by the arcade and mfm flags
'npm start -- --arcade'        make an arcade set to the ini flags in settings.ini, and output to outputsDir in package.json
'npm start -- --mfm'           make an arcade set to a flatfile list output of mame file manager, and output to outputsDir in package.json
'npm start -- --testArcadeRun' makes a set of both Mame and RetroArch romdata and splits from a canned list
'npm start -- --softlists'     makes a softlist set
'npm run full'                 deletes the outputs folder, scans, makes an arcade set, and softlists plus embedded (according to config settings)
'npm run mess-start            doesn't delete output dir, just runs scan and softlist/embedded generation
'npm run debug -- --arcade'    break on ln1 of making an arcade set to the ini flags in settings.ini, and output to outputsDir in package.json)
`
)
  process.exit()
}

//calculate these
const outputDir         = program.outputDir
!program.scan && (fs.existsSync(outputDir) || _throw(`output directory ${outputDir} doesn't exist, so Mametool can't output any romdatas`))
const devMode           = program.dev
const jsonOutDir        = devMode? outputDir : `dats` //json will sit in the frontends config dir, or for dev in the passed-in dir
const jsonOutName       = `mame.json`
const jsonOutPath       = `${jsonOutDir}/${jsonOutName}`
const qpIni             = devMode? `./settings.ini`: `dats\\settings.ini` //settings from QP's ini file, or nix dev settings
const devExtrasOverride = devMode? `/Volumes/GAMES/MAME/EXTRAs/folders` : `` //on windows its specified in the above ini

devMode      && console.log(`\t*** Mametool is in Dev mode ***\n`)
program.scan && !devMode || console.log(`Output dir:             ${outputDir}`) 
console.log(`MAME Json dir:          ${jsonOutDir}`)

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
    efindProblems      : devMode 
  //the data/efind/scan artifacts
  , dat                : false 
  , efind              : false 
  , json               : false
  //softlist
  , printer            : true //prints softlist names as syncrhonously printed, leave on
  , choices            : false
  , softlistProblems   : false
  , otherSoftlists     : true
  , otherGameNames     : true
  , otherGameConflicts : true
  , regions            : false 
  , regionsGames       : false 
  , exclusions         : false 
}

//determine that location of the systems.dat
const devInputsDir    = `inputs/current`
const datInPath       = devMode? `${devInputsDir}/systems.dat` : `dats\\systems.dat`
const datOutPath      = devMode? `${outputDir}/systems.dat` : `dats\\systems.dat`
//are we making a mess or retroarch efinder file? to make both the users has to go through the menu again and select the appropriate emu
const efindOutName    = settings.isItRetroArch? `Mess_Retroarch.ini` : `Mess_Mame.ini` 
const efindOutPath    = devMode? `${outputDir}/${efindOutName}` : `EFind\\${efindOutName}`
console.log(`EFind Ini output Path   ${efindOutPath}`)

//softlist paths
const mameEmuDir      = path.win32.dirname(settings.mameExePath)
//mess hash dir is determinable realtive to mame exe dir (mame is distributed that way/retroarch users must place it here to work)
const liveHashDir     = settings.isItRetroArch? `${mameEmuDir}\\system\\mame\\hash\\` : `${mameEmuDir}\\hash\\`
const hashDir         = devMode? `${devInputsDir}/hash/` : liveHashDir
  
//TODO: promisify these so you can run combinations
program.scan          && scan(settings, jsonOutPath, qpIni, efindOutPath, datInPath, datOutPath, log)
program.mfm           && mfm(settings, readMameJson, jsonOutPath, generateRomdata, outputDir)
program.arcade        && arcade(settings, jsonOutPath, outputDir, readMameJson, generateRomdata)
program.testArcadeRun && testArcadeRun(settings, readMameJson, jsonOutPath, outputDir)
program.softlists     && softlists(settings, jsonOutPath, hashDir, outputDir, log)
