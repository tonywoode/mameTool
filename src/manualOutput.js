const filters            = require('./filters.js') 
const {makeFilteredJson} = require('./filterMameJson.js')
const {generateRomdata}  = require('./printers.js')
const {applySplits}      = require('./makeSplits.js')

// this was the original scripted output, it could be an integration test

module.exports = (emu, mameJson, winIconDir, outputDir) => {
    const noMatureJson                = makeFilteredJson(filters.matureFilter)(mameJson)
    const noPreliminaryFullJson       = makeFilteredJson(filters.preliminaryFilter)(mameJson)
    const arcadeFullJson              = makeFilteredJson(filters.arcadeFilter)(mameJson)
    generateRomdata(emu, `${outputDir}/full/allGames`, winIconDir, true)(mameJson)

    const noPreliminaryNoMatureJson   = makeFilteredJson(filters.preliminaryFilter)(noMatureJson)
    const arcadeNoMatureJson          = makeFilteredJson(filters.arcadeFilter)(noMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/allGames`, winIconDir, true)(noMatureJson)

    const arcadeFullWorkingJson       = makeFilteredJson(filters.arcadeFilter)(noPreliminaryFullJson)
    generateRomdata(emu, `${outputDir}/full/workingOnly`, winIconDir, true)(noPreliminaryFullJson)

    const arcadeNoMatureWorkingJson   = makeFilteredJson(filters.arcadeFilter)(noPreliminaryNoMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/workingOnly`, winIconDir, true)(noPreliminaryNoMatureJson)
    
    const noClonesFullJson            = makeFilteredJson(filters.clonesFilter)(mameJson)
    generateRomdata(emu, `${outputDir}/full/allGames/noClones`, winIconDir, true)(noClonesFullJson)

    const noClonesNoMatureJson        = makeFilteredJson(filters.clonesFilter)(noMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/allGames/noClones`, winIconDir, true)(noClonesNoMatureJson)

    const noClonesFullWorkingJson     = makeFilteredJson(filters.clonesFilter)(noPreliminaryFullJson)
    generateRomdata(emu, `${outputDir}/full/workingOnly/noClones`, winIconDir, true)(noClonesFullWorkingJson)

    const noClonesNoMatureWorkingJson = makeFilteredJson(filters.clonesFilter)(noPreliminaryNoMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/workingOnly/noClones`, winIconDir, true)(noClonesNoMatureWorkingJson)
    
    generateRomdata(emu, `${outputDir}/full/allGames/originalVideoGames`,        winIconDir, true)(arcadeFullJson)
    generateRomdata(emu, `${outputDir}/noMature/allGames/originalVideoGames`,    winIconDir, true)(arcadeNoMatureJson)
    generateRomdata(emu, `${outputDir}/full/workingOnly/originalVideoGames`,     winIconDir, true)(arcadeFullWorkingJson)
    generateRomdata(emu, `${outputDir}/noMature/workingOnly/originalVideoGames`, winIconDir, true)(arcadeNoMatureWorkingJson)
    applySplits(`genre`, `${outputDir}/full/allGames`,        emu, winIconDir, true, mameJson)
    applySplits(`genre`, `${outputDir}/noMature/allGames`,    emu, winIconDir, true, noMatureJson)
    applySplits(`genre`, `${outputDir}/full/workingOnly`,     emu, winIconDir, true, noPreliminaryFullJson)
    applySplits(`genre`, `${outputDir}/noMature/workingOnly`, emu, winIconDir, true, noPreliminaryNoMatureJson)

  }
