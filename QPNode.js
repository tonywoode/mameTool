'use strict'

const R                            = require('ramda')
const {readFile}                   = require('fs')
const program                      = require('commander')
const _throw                       = m => { throw new Error(m) }

const {cleanJson}                  = require('./src/cleanJson.js')
const {iniToJson}                  = require('./src/fillFromIni.js')
const {makeSystemsAsync}           = require('./src/readMameXml.js')
const {mfmReaderAsync, mfmFilter}  = require('./src/mfmReader.js')
const {printJson, generateRomdata} = require('./src/printers.js')
const {makeFilteredJson} = require('./src/filterMameJson.js')
const {makeEmu}                    = require('./src/types.js')
const makeSplit                    = require('./src/makeSplit.js')

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
const emu                = makeEmu(mameExe, outputDir);              console.log(`so emu is ${emu.toString()}`)
const jsonOutName        = `mame.json`

//TODO: dry this up, its silly. All the tickboxes
const tickBios             = strategy.tickBios         
const tickCasino           = strategy.tickCasino
const tickClones           = strategy.tickClones
const tickMature           = strategy.tickMature
const tickMechanical       = strategy.tickMechanical
const tickMess             = strategy.tickMess
const tickPreliminary      = strategy.tickPreliminary
const tickPrintClub        = strategy.tickPrintClub
const tickSimulator        = strategy.tickSimulator
const tickTableTop         = strategy.tickTableTop
const tickQuiz             = strategy.tickQuiz
const tickUtilities        = strategy.tickUtilities

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
   { name: `noBios`       , value: parseInt(tickBios)       , filter: biosFilter        }      
 , { name: `noCasino`     , value: parseInt(tickCasino)     , filter: casinoFilter      }    
 , { name: `noClones`     , value: parseInt(tickClones)     , filter: clonesFilter      }    
 , { name: `noMature`     , value: parseInt(tickMature)     , filter: matureFilter      }    
 , { name: `noMechanical` , value: parseInt(tickMechanical) , filter: mechanicalFilter  }
 , { name: `noMess`       , value: parseInt(tickMess)       , filter: messFilter        }      
 , { name: `noPreliminary`, value: parseInt(tickPreliminary), filter: preliminaryFilter }
 , { name: `noPrintClub`  , value: parseInt(tickPrintClub)  , filter: printClubFilter   }
 , { name: `noSimulator`  , value: parseInt(tickSimulator)  , filter: simulatorFilter   }
 , { name: `noTableTop`   , value: parseInt(tickTableTop)   , filter: tableTopFilter    }
 , { name: `noQuiz`       , value: parseInt(tickQuiz)       , filter: quizFilter        }
 , { name: `noUtilities`  , value: parseInt(tickUtilities)  , filter: utilitiesFilter   }
]

//and the splits
const tickSplitCompany     = strategy.tickSplitCompany
const tickSplitGenre       = strategy.tickSplitGenre   
const tickSplitNPlayers    = strategy.tickSplitNPlayers
const tickSplitRating      = strategy.tickSplitRating
const tickSplitSeries      = strategy.tickSplitSeries
const tickSplitVersion     = strategy.tickSplitVersion
const tickSplitYear        = strategy.tickSplitYear    

const splitObject = [
   { name: `company`  , value: parseInt(tickSplitCompany )}
 , { name: `genre`    , value: parseInt(tickSplitGenre   )}
 , { name: `nplayers` , value: parseInt(tickSplitNPlayers)}
 //, { name: `bestgames`, value: parseInt(tickSplitRating  )}
 //, { name: `series`   , value: parseInt(tickSplitSeries  )}
 , { name: `version`  , value: parseInt(tickSplitVersion )}
 , { name: `year`     , value: parseInt(tickSplitYear    )}
]

const {Mame, RetroArch}    = require('./src/types.js') //TODO: this is for dev mode only, better to make it
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

const manualOutput = mameJson => {
    const noMatureJson              = makeFilteredJson(matureFilter)(mameJson)
    const noPreliminaryFullJson     = makeFilteredJson(preliminaryFilter)(mameJson)
    const arcadeFullJson            = makeFilteredJson(arcadeFilter)(mameJson)
    generateRomdata(Mame,      `${outputDir}/full/allGames`, winIconDir)(mameJson)
    generateRomdata(RetroArch, `${outputDir}/full/allGames`, winIconDir)(mameJson)

    const noPreliminaryNoMatureJson = makeFilteredJson(preliminaryFilter)(noMatureJson)
    const arcadeNoMatureJson        = makeFilteredJson(arcadeFilter)(noMatureJson)
    generateRomdata(Mame,      `${outputDir}/noMature/allGames`, winIconDir)(noMatureJson)
    generateRomdata(RetroArch, `${outputDir}/noMature/allGames`, winIconDir)(noMatureJson)

    const arcadeFullWorkingJson     = makeFilteredJson(arcadeFilter)(noPreliminaryFullJson)
    generateRomdata(Mame,      `${outputDir}/full/workingOnly`,     winIconDir)(noPreliminaryFullJson)
    generateRomdata(RetroArch, `${outputDir}/full/workingOnly`,     winIconDir)(noPreliminaryFullJson)

    const arcadeNoMatureWorkingJson = makeFilteredJson(arcadeFilter)(noPreliminaryNoMatureJson)
    generateRomdata(Mame,      `${outputDir}/noMature/workingOnly`, winIconDir)(noPreliminaryNoMatureJson)
    generateRomdata(RetroArch, `${outputDir}/noMature/workingOnly`, winIconDir)(noPreliminaryNoMatureJson)
    
    const noClonesFullJson          = makeFilteredJson(clonesFilter)(mameJson)
    generateRomdata(Mame,      `${outputDir}/full/allGames/noClones`,        winIconDir)(noClonesFullJson)
    generateRomdata(RetroArch, `${outputDir}/full/allGames/noClones`,        winIconDir)(noClonesFullJson)

    const noClonesNoMatureJson        = makeFilteredJson(clonesFilter)(noMatureJson)
    generateRomdata(Mame,      `${outputDir}/noMature/allGames/noClones`,    winIconDir)(noClonesNoMatureJson)
    generateRomdata(RetroArch, `${outputDir}/noMature/allGames/noClones`,    winIconDir)(noClonesNoMatureJson)

    const noClonesFullWorkingJson     = makeFilteredJson(clonesFilter)(noPreliminaryFullJson)
    generateRomdata(Mame,      `${outputDir}/full/workingOnly/noClones`,     winIconDir)(noClonesFullWorkingJson)
    generateRomdata(RetroArch, `${outputDir}/full/workingOnly/noClones`,     winIconDir)(noClonesFullWorkingJson)

    const noClonesNoMatureWorkingJson = makeFilteredJson(clonesFilter)(noPreliminaryNoMatureJson)
    generateRomdata(Mame,      `${outputDir}/noMature/workingOnly/noClones`, winIconDir)(noClonesNoMatureWorkingJson)
    generateRomdata(RetroArch, `${outputDir}/noMature/workingOnly/noClones`, winIconDir)(noClonesNoMatureWorkingJson)
    

    generateRomdata(Mame,      `${outputDir}/full/allGames/originalVideoGames`,        winIconDir)(arcadeFullJson)
    generateRomdata(RetroArch, `${outputDir}/full/allGames/originalVideoGames`,        winIconDir)(arcadeFullJson)

    generateRomdata(Mame,      `${outputDir}/noMature/allGames/originalVideoGames`,    winIconDir)(arcadeNoMatureJson)
    generateRomdata(RetroArch, `${outputDir}/noMature/allGames/originalVideoGames`,    winIconDir)(arcadeNoMatureJson)

    generateRomdata(Mame,      `${outputDir}/full/workingOnly/originalVideoGames`,     winIconDir)(arcadeFullWorkingJson)
    generateRomdata(RetroArch, `${outputDir}/full/workingOnly/originalVideoGames`,     winIconDir)(arcadeFullWorkingJson)

    generateRomdata(Mame,      `${outputDir}/noMature/workingOnly/originalVideoGames`, winIconDir)(arcadeNoMatureWorkingJson)
    generateRomdata(RetroArch, `${outputDir}/noMature/workingOnly/originalVideoGames`, winIconDir)(arcadeNoMatureWorkingJson)

    makeSplit(`genre`, `${outputDir}/full/allGames`, Mame, winIconDir, mameJson)
    makeSplit(`genre`, `${outputDir}/full/allGames`, RetroArch, winIconDir, mameJson)

    makeSplit(`genre`, `${outputDir}/noMature/allGames`, Mame, winIconDir, noMatureJson)
    makeSplit(`genre`, `${outputDir}/noMature/allGames`, RetroArch, winIconDir, noMatureJson)

    makeSplit(`genre`, `${outputDir}/full/workingOnly`, Mame, winIconDir, noPreliminaryFullJson)
    makeSplit(`genre`, `${outputDir}/full/workingOnly`, RetroArch, winIconDir, noPreliminaryFullJson)

    makeSplit(`genre`, `${outputDir}/noMature/workingOnly`, Mame, winIconDir, noPreliminaryNoMatureJson)
    makeSplit(`genre`, `${outputDir}/noMature/workingOnly`, RetroArch, winIconDir, noPreliminaryNoMatureJson) 

  }

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

  //manualOutput(mameJson)

  /* make the romdata the user selected. its a reduce 
   * what to operate on =  tickObject. what the accumulator is = mameJson
   * what to do to accum each time around =  if (filterThisProp) makeFilteredJson(thisProp'sFilter)(mameJson)*/

  //so put that together
  const applyFilter = (tick, mameJson) => tick.value? makeFilteredJson(tick.filter)(mameJson): mameJson
    
  const applyFilters = (tickObject, mameJson) =>
    R.reduce( (newJson, tick) => applyFilter(tick, newJson), mameJson, tickObject )

  const userFilteredJson = applyFilters(tickObject, mameJson)
  generateRomdata(emu, outputDir, winIconDir)(userFilteredJson)

  //now use that romdata to make the splits the user wants
  //this isn't a reduce because we no longer wish to reduce on the json, we use the same (filtered) json for each filter 
  const applySplit = (tick, mameJson) => tick.value? makeSplit(tick.name, outputDir, emu, winIconDir, mameJson):``
  const applySplits = (splitObject, mameJson) =>
    R.map( tick => applySplit(tick, mameJson), splitObject )
  applySplits(splitObject, userFilteredJson)


  return userFilteredJson
  })
  .catch(err => _throw(err) )
}
