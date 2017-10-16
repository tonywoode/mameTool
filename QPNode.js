'use strict'

const R                                = require('ramda')
const program                          = require('commander')
const fs                               = require('fs')
const ini                              = require('ini')
const _throw                           = m => { throw new Error(m) }

const {cleanJson}                      = require('./src/cleanJson.js')
const {iniToJson}                      = require('./src/fillFromIni.js')
const {makeSystemsAsync}               = require('./src/readMameXml.js')
const {mfmReaderAsync, mfmFilter}      = require('./src/mfmReader.js')
const {printJson, generateRomdata}     = require('./src/printers.js')
const {applyFilters}                   = require('./src/filterMameJson.js')
const {applySplits}                    = require('./src/makeSplits.js')
const manualOutput                     = require('./src/manualOutput.js')
const filters                          = require('./src/filters.js') 
const paths                            = require('./src/paths.js')
const inis                             = require('./src/inis.json') 

program
    .option('--output-dir [path]')
    .option(`--mfm`) //so to make a dev mfm run: npm start -- --dev
    .option(`--arcade`)
    .option(`--dev`)
    .option(`--scan`)
    .option(`--testArcadeIntegration`)
    .parse(process.argv)

const mfm               = program.mfm
const arcade            = program.arcade
const scan              = program.scan
const devMode           = program.dev
const outputDir         = program.outputDir
const testArcadeIntegration = program.testArcadeIntegration 

//json will sit in the frontends config dir
const jsonOutName       = `mame.json`
const jsonOutDir        = devMode? outputDir : `dats`

// Bring in settings from quickplay's ini file, or use the nix dev settings
const qpIni             = devMode? `./settings.ini`: `dats\\settings.ini`
const devExtrasOverride = devMode? `/Volumes/GAMES/MAME/EXTRAs/folders` : `` //on windows its specified in the above ini
const settings          = paths(qpIni, devExtrasOverride)

const tickObject = [
   { name: `noBios`       , value: parseInt(settings.tickBios)       , filter: filters.biosFilter        }      
 , { name: `noCasino`     , value: parseInt(settings.tickCasino)     , filter: filters.casinoFilter      }    
 , { name: `noClones`     , value: parseInt(settings.tickClones)     , filter: filters.clonesFilter      }    
 , { name: `noMature`     , value: parseInt(settings.tickMature)     , filter: filters.matureFilter      }    
 , { name: `noMechanical` , value: parseInt(settings.tickMechanical) , filter: filters.mechanicalFilter  }
 , { name: `noMess`       , value: parseInt(settings.tickMess)       , filter: filters.messFilter        }      
 , { name: `noPreliminary`, value: parseInt(settings.tickPreliminary), filter: filters.preliminaryFilter }
 , { name: `noPrintClub`  , value: parseInt(settings.tickPrintClub)  , filter: filters.printClubFilter   }
 , { name: `noSimulator`  , value: parseInt(settings.tickSimulator)  , filter: filters.simulatorFilter   }
 , { name: `noTableTop`   , value: parseInt(settings.tickTableTop)   , filter: filters.tableTopFilter    }
 , { name: `noQuiz`       , value: parseInt(settings.tickQuiz)       , filter: filters.quizFilter        }
 , { name: `noUtilities`  , value: parseInt(settings.tickUtilities)  , filter: filters.utilitiesFilter   }
]

const splitObject = [
   { name: `company`  , value: parseInt(settings.tickSplitCompany )}
 , { name: `genre`    , value: parseInt(settings.tickSplitGenre   )}
 , { name: `nplayers` , value: parseInt(settings.tickSplitNPlayers)}
 , { name: `bestgames`, value: parseInt(settings.tickSplitRating  )}
 , { name: `series`   , value: parseInt(settings.tickSplitSeries  )}
 , { name: `version`  , value: parseInt(settings.tickSplitVersion )}
 , { name: `year`     , value: parseInt(settings.tickSplitYear    )}
]


console.log(
`Output dir:             ${outputDir}
MAME Json Out           ${jsonOutDir}
MAME xml file:          ${settings.mameXMLInPath}  
MAME file manager file: ${settings.mfmTextFileInPath}  
MAME extras dir:        ${settings.mameExtrasPath}
MAME ini dir:           ${settings.iniDir}
MAME icons dir:         ${settings.winIconDir} 
MAME exe:               ${settings.mameExe}
Dev mode:               ${devMode? `on`: `off`}
\n`
)
settings.mameXMLInPath  || _throw(`there's no MAME XML`)
const  mameXMLStream    = fs.createReadStream(settings.mameXMLInPath)

const iniDir            = settings.iniDir

//these same settings get immutably passed to many things now
const romdataConfig = {emu: settings.mameExe, winIconDir: settings.winIconDir, devMode}

//we must run with --scan before using another option
const readMameJson = () => new Promise( resolve =>
  fs.readFile(`${jsonOutDir}/${jsonOutName}`, (err, data) =>
    err? _throw(`can't find MAME JSON - run me first with '--scan' `) 
      : (console.log(`existing MAME XML scan found...${JSON.parse(data).versionInfo.mameVersion}`)
        , resolve(JSON.parse(data) )      
    )
  )
)


if (scan) {
//do thejson generation, processing etc that applies whichever options is chosen
  makeSystemsAsync(mameXMLStream) 
    .then( sysObj => {
      const {arcade} = sysObj 
      //save the version information into quickplay's ini file
      const config = ini.parse(fs.readFileSync(qpIni, 'utf-8'))
      config.MAME.MameXMLVersion = sysObj.versionInfo.mameVersion
      fs.writeFileSync(qpIni, ini.stringify(config)) //TODO: what happens if xml/json read didn't work?
     
      /* process all the inis into the json we specify their type (and their internal name if necessary)
       *   there are three types of ini file (see iniReader.js)
       *   n.b.: to add an ini to romdata, also populate it in makeRomdata */
      const mameJson = R.pipe( arcade =>
        inis.reduce( (systems, ini) => iniToJson(iniDir, ini)(systems), arcade ) 
        , cleanJson 
      )(arcade)
  
      const newSysObj = { versionInfo: sysObj.versionInfo, arcade: mameJson }
      printJson(jsonOutDir, jsonOutName)(newSysObj) //print out json with inis included, and also version info
      return mameJson
    })
    .catch(err => _throw(err) )
}

//fulfil a call to make a mame file manager filtered romdata
if (mfm) {
  settings.mfmTextFileInPath || _throw(`there's no MFM File`) //TODO: recover?
  const  mfmTextFileStream = fs.createReadStream(settings.mfmTextFileInPath)
  readMameJson().then( sysObj => {
    const {arcade} = sysObj 
    mfmReaderAsync(mfmTextFileStream) 
      .then( (mfmArray) => {
        const mfmFilteredJson = mfmFilter(mfmArray)(arcade) 
        generateRomdata(outputDir, romdataConfig)(mfmFilteredJson)

        return mfmFilteredJson
      })
  })
  .catch(err => _throw(err) )
}

//fulfil a call to make an arcade set from a set of filter choices
if (arcade) {
  readMameJson().then( sysObj => {
    const {arcade} = sysObj 
    const userFilteredArcade = applyFilters(tickObject, arcade)
    generateRomdata(outputDir, romdataConfig)(userFilteredArcade)
    //now use that romdata to make the splits the user wants
    applySplits(splitObject, outputDir, romdataConfig)(userFilteredArcade)

    return userFilteredArcade
  })
  .catch(err => _throw(err) )
}



if (testArcadeIntegration) {
  readMameJson().then( sysObj => {
    const {arcade} = sysObj 
    //romdataConfig.emu = `Retroarch Arcade (Mame) Win32`
    manualOutput(outputDir, romdataConfig)(arcade) //these manual tests could be an integration test

    return "Test Finished"
  })
  .catch(err => _throw(err) )
}
