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
const {makeEmu}                        = require('./src/types.js')
const {applySplits}                    = require('./src/makeSplit.js')
const manualOutput                     = require('./src/manualOutput.js')

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
//bring in settings from quickplay's ini file, or use the nix dev settings
const strategy = devMode? require('./src/devPaths') : require('./src/livePaths.js')
const mameXMLStream      = strategy.mameXMLStream
const mfmTextFileStream  = strategy.mfmTextFileStream
const winIconDir         = strategy.winIconDir    
const iniDir             = strategy.iniDir
const mameExe            = strategy.mameExe //dev mode is going to give undef
const emu                = makeEmu(mameExe); console.log(`so emu is ${emu.toString()}`)
const jsonOutName        = `mame.json`

const {
   arcadeFilter 
 , biosFilter   
 , casinoFilter      
 , clonesFilter      
 , matureFilter      
 , mechanicalFilter  
 , messFilter        
 , preliminaryFilter 
 , printClubFilter   
 , simulatorFilter   
 , tableTopFilter    
 , quizFilter        
 , utilitiesFilter    
} = require('./src/filters.js') 

const tickObject = [
   { name: `noBios`       , value: parseInt(strategy.tickBios)       , filter: biosFilter        }      
 , { name: `noCasino`     , value: parseInt(strategy.tickCasino)     , filter: casinoFilter      }    
 , { name: `noClones`     , value: parseInt(strategy.tickClones)     , filter: clonesFilter      }    
 , { name: `noMature`     , value: parseInt(strategy.tickMature)     , filter: matureFilter      }    
 , { name: `noMechanical` , value: parseInt(strategy.tickMechanical) , filter: mechanicalFilter  }
 , { name: `noMess`       , value: parseInt(strategy.tickMess)       , filter: messFilter        }      
 , { name: `noPreliminary`, value: parseInt(strategy.tickPreliminary), filter: preliminaryFilter }
 , { name: `noPrintClub`  , value: parseInt(strategy.tickPrintClub)  , filter: printClubFilter   }
 , { name: `noSimulator`  , value: parseInt(strategy.tickSimulator)  , filter: simulatorFilter   }
 , { name: `noTableTop`   , value: parseInt(strategy.tickTableTop)   , filter: tableTopFilter    }
 , { name: `noQuiz`       , value: parseInt(strategy.tickQuiz)       , filter: quizFilter        }
 , { name: `noUtilities`  , value: parseInt(strategy.tickUtilities)  , filter: utilitiesFilter   }
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

  //manualOutput(mameJson, winIconDir, outputDir) //these manual tests could be an integration test

  const userFilteredJson = applyFilters(tickObject, mameJson)
  generateRomdata(emu, outputDir, winIconDir)(userFilteredJson)

  //now use that romdata to make the splits the user wants
  applySplits(splitObject, outputDir, emu, winIconDir, userFilteredJson)

  return userFilteredJson
  })
  .catch(err => _throw(err) )
}
