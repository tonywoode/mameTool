'use strict'

const R                                = require('ramda')
const {readFile}                       = require('fs')
const program                          = require('commander')
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

/*bring in settings from quickplay's ini file, or use the nix dev settings
 * paths takes the qp ini file path, and will set the mame extras inis path to a computed value, unless you
 * specify a value (to cope with nix dev being an entirely different rooted path) */

const settings = devMode? 
    paths(`./settings.ini`, `/Volumes/GAMES/MAME/EXTRAs/folders`)
  : paths(`dats\\settings.ini`)

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
const jsonOutName       = `mame.json`

const romdataConfig = {emu: settings.mameExe, winIconDir: settings.winIconDir, devMode}
console.log(romdataConfig)
// If there's an xml that parses in the jsonOutDir, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(`${outputDir}/${jsonOutName}`, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : (  
        console.log(`existing MAME XML data found...`)
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
  .then( systems => {
    // process all the inis into the json
    const filledSystems = inis.reduce( (systems, ini) => 
      iniToJson(iniDir, ini)(systems), systems ) 
    // post-process the data-complete json, printing it becomes a gatepost
    const mameJson = R.pipe(
        cleanJson 
      , printJson(outputDir, jsonOutName)
    )(filledSystems) 
 
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

if (arcade) {
  makeMameJsonPromise.then( mameJson => {

  //manualOutput(`Mame64 Win32`, mameJson, winIconDir, outputDir) //these manual tests could be an integration test
  //manualOutput(`Retroarch Arcade (Mame) Win32`, mameJson, winIconDir, outputDir) //these manual tests could be an integration test

  const userFilteredJson = applyFilters(tickObject, mameJson)
  generateRomdata(outputDir, romdataConfig)(userFilteredJson)

  //now use that romdata to make the splits the user wants
  applySplits(splitObject, outputDir, romdataConfig, userFilteredJson)

  return userFilteredJson
  })
  .catch(err => _throw(err) )
}
