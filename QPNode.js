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
const {makeFilteredJson, applyFilters} = require('./src/filterMameJson.js')
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

const strategy = devMode? 
    paths(`./settings.ini`, `/Volumes/GAMES/MAME/EXTRAs/folders`)
  : paths(`dats\\settings.ini`)

console.log(`mame xml path set to ${strategy.mameXMLInPath}`)  
console.log(`mame file manager path set to ${strategy.mfmTextFileInPath}`)  
console.log(`mame extras path set to ${strategy.mameExtrasPath}`)
console.log(`mame icons path set to ${strategy.winIconDir}`) 
console.log(`mame exe set to ${strategy.mameExe}` )

const mameXMLStream      = strategy.mameXMLStream
const mfmTextFileStream  = strategy.mfmTextFileStream
const winIconDir         = strategy.winIconDir    
const iniDir             = strategy.iniDir
const emu                = strategy.mameExe //dev mode is going to give undef
const jsonOutName        = `mame.json`

const tickObject = [
   { name: `noBios`       , value: parseInt(strategy.tickBios)       , filter: filters.biosFilter        }      
 , { name: `noCasino`     , value: parseInt(strategy.tickCasino)     , filter: filters.casinoFilter      }    
 , { name: `noClones`     , value: parseInt(strategy.tickClones)     , filter: filters.clonesFilter      }    
 , { name: `noMature`     , value: parseInt(strategy.tickMature)     , filter: filters.matureFilter      }    
 , { name: `noMechanical` , value: parseInt(strategy.tickMechanical) , filter: filters.mechanicalFilter  }
 , { name: `noMess`       , value: parseInt(strategy.tickMess)       , filter: filters.messFilter        }      
 , { name: `noPreliminary`, value: parseInt(strategy.tickPreliminary), filter: filters.preliminaryFilter }
 , { name: `noPrintClub`  , value: parseInt(strategy.tickPrintClub)  , filter: filters.printClubFilter   }
 , { name: `noSimulator`  , value: parseInt(strategy.tickSimulator)  , filter: filters.simulatorFilter   }
 , { name: `noTableTop`   , value: parseInt(strategy.tickTableTop)   , filter: filters.tableTopFilter    }
 , { name: `noQuiz`       , value: parseInt(strategy.tickQuiz)       , filter: filters.quizFilter        }
 , { name: `noUtilities`  , value: parseInt(strategy.tickUtilities)  , filter: filters.utilitiesFilter   }
]

const splitObject = [
   { name: `company`  , value: parseInt(strategy.tickSplitCompany )}
 , { name: `genre`    , value: parseInt(strategy.tickSplitGenre   )}
 , { name: `nplayers` , value: parseInt(strategy.tickSplitNPlayers)}
 , { name: `bestgames`, value: parseInt(strategy.tickSplitRating  )}
 , { name: `series`   , value: parseInt(strategy.tickSplitSeries  )}
 , { name: `version`  , value: parseInt(strategy.tickSplitVersion )}
 , { name: `year`     , value: parseInt(strategy.tickSplitYear    )}
]

console.log(`output dir is ${outputDir}`)
// If there's an xml that parses in the jsonOutDir, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(`${outputDir}/${jsonOutName}`, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : resolve(JSON.parse(data) )  
  )
)

// these are the available inis, specifying their type (and their internal name if necessary)
//   there are three types of ini file (see iniReader.js)
//   n.b.: to add an ini to romdata, also populate it in makeRomdata
const inis = require('./src/inis.json') 

//do thejson generation, processing etc that applies whichever optionsis chosen
const makeMameJsonPromise = decideWhetherToXMLAsync()
  .then( systems => {
    // process all the inis into the json
    const filledSystems = inis.reduce( (systems, ini) => 
      iniToJson(iniDir, ini.iniName, ini.iniType, ini.sectionName)(systems), systems ) 
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
        generateRomdata(emu, outputDir, winIconDir)(mfmFilteredJson)

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
  generateRomdata(emu, outputDir, winIconDir)(userFilteredJson)

  //now use that romdata to make the splits the user wants
  applySplits(splitObject, outputDir, emu, winIconDir, userFilteredJson)

  return userFilteredJson
  })
  .catch(err => _throw(err) )
}
