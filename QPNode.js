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

program
    .option('--output-dir [path]')
    .option(`--mfm`) //so to make a dev mfm run: npm start -- --dev
    .option(`--arcade`)
    .option(`--dev`)
    .parse(process.argv)

const mfm               = program.mfm
const arcade            = program.arcade
const devMode           = program.dev
const outputDir         = program.outputDir

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
MAME xml file:          ${settings.mameXMLInPath}  
MAME file manager file: ${settings.mfmTextFileInPath}  
MAME extras dir:        ${settings.mameExtrasPath}
MAME ini dir:           ${settings.iniDir}
MAME icons dir:         ${settings.winIconDir} 
MAME exe:               ${settings.mameExe}
Dev mode:               ${devMode? `on`: `off`}
\n`
)

const mameXMLStream     = settings.mameXMLStream
const mfmTextFileStream = settings.mfmTextFileStream
const iniDir            = settings.iniDir

//these same settings get immutably passed to many things now
const romdataConfig = {emu: settings.mameExe, winIconDir: settings.winIconDir, devMode}

// If there's an xml that parses in the jsonOutDir, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  fs.readFile(`${jsonOutDir}/${jsonOutName}`, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) 
      : (console.log(`existing MAME XML data found...${JSON.parse(data).versionInfo.mameVersion}`)
        , resolve(JSON.parse(data) )      
    )
  )
)

/* these are the available inis, specifying their type (and their internal name if necessary)
 *   there are three types of ini file (see iniReader.js)
 *   n.b.: to add an ini to romdata, also populate it in makeRomdata */
const inis = require('./src/inis.json') 

//do thejson generation, processing etc that applies whichever options is chosen
const makeMameJsonPromise = decideWhetherToXMLAsync()
  .then( sysObj => {
    const systems = sysObj.systems //still referring to sysObj, so we'll print version info later 
      //save the version information into quickplay's ini file
      const config = ini.parse(fs.readFileSync(qpIni, 'utf-8'))
      config.MAME.MameXMLVersion = sysObj.versionInfo.mameVersion
      //TODO: if the xml read didn't work, we need to wipe this setting
      fs.writeFileSync(qpIni, ini.stringify(config))
   
    // process all the inis into the json
    const filledSystems = inis.reduce( (systems, ini) => 
      iniToJson(iniDir, ini)(systems), systems ) 
    // post-process the data-complete json, printing it becomes a gatepost
    const mameJson = R.pipe(
        cleanJson 
    )(filledSystems) 
 
   printJson(jsonOutDir, jsonOutName)(sysObj) //print out json with inis included, and also version info
   return mameJson
  })
  .catch(err => _throw(err) )

//fulfil a call to make a mame file manager filtered romdata
if (mfm) {
  makeMameJsonPromise.then( mameJson =>
    mfmReaderAsync(mfmTextFileStream) 
      .then( (mfmArray) => {
        const mfmFilteredJson = mfmFilter(mfmArray)(mameJson) 
        generateRomdata(outputDir, romdataConfig)(mfmFilteredJson)

        return mameJson
      })
  )
  .catch(err => _throw(err) )
}

//fulfil a call to make an arcade set from a set of filter choices
if (arcade) {
  makeMameJsonPromise.then( mameJson => {

  //manualOutput(outputDir, romdataConfig)(mameJson) //these manual tests could be an integration test
  //romdataConfig.emu = `Retroarch Arcade (Mame) Win32`
  //manualOutput(outputDir, romdataConfig)(mameJson) //these manual tests could be an integration test

  const userFilteredJson = applyFilters(tickObject, mameJson)
  generateRomdata(outputDir, romdataConfig)(userFilteredJson)

  //now use that romdata to make the splits the user wants
  applySplits(splitObject, outputDir, romdataConfig)(userFilteredJson)

  return userFilteredJson
  })
  .catch(err => _throw(err) )
}
