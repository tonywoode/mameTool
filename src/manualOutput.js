const filters            = require('./arcade/filters.js') 
const {makeFilteredJson} = require('./arcade/filterMameJson.js')
const {generateRomdata}  = require('./printers.js')
const {applySplits}      = require('./arcade/makeSplits.js')

// this was the original scripted output, it could be an integration test

module.exports = (outputDir, romdataConfig) => mameJson => {
    const noMatureJson                = makeFilteredJson(filters.matureFilter)(mameJson)
    const noPreliminaryFullJson       = makeFilteredJson(filters.preliminaryFilter)(mameJson)
    const arcadeFullJson              = makeFilteredJson(filters.arcadeFilter)(mameJson)
    generateRomdata(`${outputDir}/full/allGames`, romdataConfig)(mameJson)

    const noPreliminaryNoMatureJson   = makeFilteredJson(filters.preliminaryFilter)(noMatureJson)
    const arcadeNoMatureJson          = makeFilteredJson(filters.arcadeFilter)(noMatureJson)
    generateRomdata(`${outputDir}/noMature/allGames`, romdataConfig)(noMatureJson)

    const arcadeFullWorkingJson       = makeFilteredJson(filters.arcadeFilter)(noPreliminaryFullJson)
    generateRomdata(`${outputDir}/full/workingOnly`, romdataConfig)(noPreliminaryFullJson)

    const arcadeNoMatureWorkingJson   = makeFilteredJson(filters.arcadeFilter)(noPreliminaryNoMatureJson)
    generateRomdata(`${outputDir}/noMature/workingOnly`, romdataConfig)(noPreliminaryNoMatureJson)
    
    const noClonesFullJson            = makeFilteredJson(filters.clonesFilter)(mameJson)
    generateRomdata(`${outputDir}/full/allGames/noClones`, romdataConfig)(noClonesFullJson)

    const noClonesNoMatureJson        = makeFilteredJson(filters.clonesFilter)(noMatureJson)
    generateRomdata(`${outputDir}/noMature/allGames/noClones`, romdataConfig)(noClonesNoMatureJson)

    const noClonesFullWorkingJson     = makeFilteredJson(filters.clonesFilter)(noPreliminaryFullJson)
    generateRomdata(`${outputDir}/full/workingOnly/noClones`, romdataConfig)(noClonesFullWorkingJson)

    const noClonesNoMatureWorkingJson = makeFilteredJson(filters.clonesFilter)(noPreliminaryNoMatureJson)
    generateRomdata(`${outputDir}/noMature/workingOnly/noClones`, romdataConfig)(noClonesNoMatureWorkingJson)
    
    generateRomdata(`${outputDir}/full/allGames/originalVideoGames`,        romdataConfig)(arcadeFullJson)
    generateRomdata(`${outputDir}/noMature/allGames/originalVideoGames`,    romdataConfig)(arcadeNoMatureJson)
    generateRomdata(`${outputDir}/full/workingOnly/originalVideoGames`,     romdataConfig)(arcadeFullWorkingJson)
    generateRomdata(`${outputDir}/noMature/workingOnly/originalVideoGames`, romdataConfig)(arcadeNoMatureWorkingJson)
    applySplits(`genre`, `${outputDir}/full/allGames`,        romdataConfig)(mameJson)
    applySplits(`genre`, `${outputDir}/noMature/allGames`,    romdataConfig)(noMatureJson)
    applySplits(`genre`, `${outputDir}/full/workingOnly`,     romdataConfig)(noPreliminaryFullJson)
    applySplits(`genre`, `${outputDir}/noMature/workingOnly`, romdataConfig)(noPreliminaryNoMatureJson)

  }
