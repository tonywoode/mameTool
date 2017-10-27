const filters            = require('../arcade/filters.js') 
const {makeFilteredJson} = require('../arcade/filterMameJson.js')
const {generateRomdata}  = require('../romdata/printRomdata.js')
const {applySplits}      = require('../arcade/makeSplits.js')

// this was the original scripted output, it could be an integration test

module.exports = (outputDir, settings) => mameJson => {
    const noMatureJson                = makeFilteredJson(filters.matureFilter)(mameJson)
    const noPreliminaryFullJson       = makeFilteredJson(filters.preliminaryFilter)(mameJson)
    const arcadeFullJson              = makeFilteredJson(filters.arcadeFilter)(mameJson)
    generateRomdata(`${outputDir}/full/allGames`, settings)(mameJson)

    const noPreliminaryNoMatureJson   = makeFilteredJson(filters.preliminaryFilter)(noMatureJson)
    const arcadeNoMatureJson          = makeFilteredJson(filters.arcadeFilter)(noMatureJson)
    generateRomdata(`${outputDir}/noMature/allGames`, settings)(noMatureJson)

    const arcadeFullWorkingJson       = makeFilteredJson(filters.arcadeFilter)(noPreliminaryFullJson)
    generateRomdata(`${outputDir}/full/workingOnly`, settings)(noPreliminaryFullJson)

    const arcadeNoMatureWorkingJson   = makeFilteredJson(filters.arcadeFilter)(noPreliminaryNoMatureJson)
    generateRomdata(`${outputDir}/noMature/workingOnly`, settings)(noPreliminaryNoMatureJson)
    
    const noClonesFullJson            = makeFilteredJson(filters.clonesFilter)(mameJson)
    generateRomdata(`${outputDir}/full/allGames/noClones`, settings)(noClonesFullJson)

    const noClonesNoMatureJson        = makeFilteredJson(filters.clonesFilter)(noMatureJson)
    generateRomdata(`${outputDir}/noMature/allGames/noClones`, settings)(noClonesNoMatureJson)

    const noClonesFullWorkingJson     = makeFilteredJson(filters.clonesFilter)(noPreliminaryFullJson)
    generateRomdata(`${outputDir}/full/workingOnly/noClones`, settings)(noClonesFullWorkingJson)

    const noClonesNoMatureWorkingJson = makeFilteredJson(filters.clonesFilter)(noPreliminaryNoMatureJson)
    generateRomdata(`${outputDir}/noMature/workingOnly/noClones`, settings)(noClonesNoMatureWorkingJson)
    
    generateRomdata(`${outputDir}/full/allGames/originalVideoGames`,        settings)(arcadeFullJson)
    generateRomdata(`${outputDir}/noMature/allGames/originalVideoGames`,    settings)(arcadeNoMatureJson)
    generateRomdata(`${outputDir}/full/workingOnly/originalVideoGames`,     settings)(arcadeFullWorkingJson)
    generateRomdata(`${outputDir}/noMature/workingOnly/originalVideoGames`, settings)(arcadeNoMatureWorkingJson)
    applySplits(`genre`, `${outputDir}/full/allGames`,        settings)(mameJson)
    applySplits(`genre`, `${outputDir}/noMature/allGames`,    settings)(noMatureJson)
    applySplits(`genre`, `${outputDir}/full/workingOnly`,     settings)(noPreliminaryFullJson)
    applySplits(`genre`, `${outputDir}/noMature/workingOnly`, settings)(noPreliminaryNoMatureJson)

  }
