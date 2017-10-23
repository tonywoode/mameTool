'use strict'

const filters      = require('./filters.js')
const applyFilters = require('./filterMameJson.js').applyFilters
const applySplits  = require('./makeSplits.js').applySplits

const _throw            = m => { throw new Error(m) }
//fulfil a call to make an arcade set from a set of filter choices
const arcade = (settings, jsonOutDir, jsonOutName, outputDir, romdataConfig, readMameJson, generateRomdata) => {
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

  readMameJson(jsonOutDir, jsonOutName).then( sysObj => {
    const {arcade} = sysObj 
    const userFilteredArcade = applyFilters(tickObject, arcade)
    generateRomdata(outputDir, romdataConfig)(userFilteredArcade)
    applySplits(splitObject, outputDir, romdataConfig)(userFilteredArcade) //now use that romdata to make the splits the user wants 

    return sysObj
  })
  .catch(err => _throw(err) )
}


module.exports = {arcade, filters , applyFilters , applySplits}
