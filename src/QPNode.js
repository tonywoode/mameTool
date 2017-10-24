'use strict'

const fs                = require('fs')
const program           = require('commander')
const _throw            = m => { throw new Error(m) }

const paths             = require('./paths.js')
//these two are used by multiple modules and are being passed in as dependecies
const {generateRomdata} = require('./romdata/printRomdata.js')
const readMameJson      = require('./romdata/readMameJson.js')

const {scan}            = require('./scan')
const {arcade}          = require('./arcade')
const {mfm}             = require('./mfm')
const {testArcadeRun}   = require('./testing')
const {datAndEfind}     = require('./datAndEfind')
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
    .option(`--datAndEfind`)
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
const jsonOutName       = `mame.json`
const devMode           = program.dev
const jsonOutDir        = devMode? outputDir : `dats` //json will sit in the frontends config dir, or for dev in the passed-in dir
const qpIni             = devMode? `./settings.ini`: `dats\\settings.ini` //settings from QP's ini file, or nix dev settings
const devExtrasOverride = devMode? `/Volumes/GAMES/MAME/EXTRAs/folders` : `` //on windows its specified in the above ini
console.log(
`Dev mode:               ${devMode? `on`: `off`}
Output dir:             ${outputDir}
MAME Json dir:          ${jsonOutDir}` 
)

//read these from the ini
const settings          = paths(qpIni, devExtrasOverride)
const romdataConfig     = {emu: settings.mameExe, winIconDir: settings.winIconDir, devMode} //these same settings get immutably passed to many things
console.log(
`MAME extras dir:        ${settings.mameExtrasPath}
MAME icons dir:         ${settings.winIconDir} 
MAME exe:               ${settings.mameExe}`
)


//mess paths
//datAndEfind
const messJsonOutName = `systems.json` //temporary, so called jsonOutName in callee
const datInPath       = `inputs/systems.dat`
const mameXMLInPath   = `inputs/mame187.xml`
const mameIniOutPath  = `outputs/Mess_Mame.ini`
const rarchIniOutPath = `outputs/Mess_Retroarch.ini`
const datOutPath      = `outputs/systems.dat`
const logIni          = false
const logDat          = false
const logJSON         = false
  
//TODO: give mess systems a proper mock
  function mockSystems(jsonOutPath, callback) {
    const input   = fs.readFileSync(jsonOutPath)
        , systems = JSON.parse(input)
    
    callback(systems, callback)
  }

//TODO: promisify these so you can run combinations
program.scan          && scan(settings, jsonOutDir, jsonOutName, qpIni)
program.mfm           && mfm(settings, readMameJson, jsonOutDir, jsonOutName, generateRomdata, outputDir, romdataConfig)
program.arcade        && arcade(settings, jsonOutDir, jsonOutName, outputDir, romdataConfig, readMameJson, generateRomdata)
program.testArcadeRun && testArcadeRun(readMameJson, jsonOutDir, jsonOutName, outputDir, romdataConfig)
//messtool options
program.datAndEfind   && datAndEfind(jsonOutDir, messJsonOutName, datInPath, mameXMLInPath, mameIniOutPath, rarchIniOutPath, datOutPath, logIni, logDat, logJSON)
program.softlists     && softlists()
program.embedded      && embedded()
