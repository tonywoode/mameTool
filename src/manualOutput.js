const filters            = require('./filters.js') 
const {makeFilteredJson} = require('./filterMameJson.js')
const {generateRomdata}  = require('./printers.js')
const {applySplits}      = require('./makeSplits.js')

module.exports = (emu, mameJson, winIconDir, outputDir) => {
    const noMatureJson                = makeFilteredJson(filters.matureFilter)(mameJson)
    const noPreliminaryFullJson       = makeFilteredJson(filters.preliminaryFilter)(mameJson)
    const arcadeFullJson              = makeFilteredJson(filters.arcadeFilter)(mameJson)
    generateRomdata(emu, `${outputDir}/full/allGames`, winIconDir)(mameJson)

    const noPreliminaryNoMatureJson   = makeFilteredJson(filters.preliminaryFilter)(noMatureJson)
    const arcadeNoMatureJson          = makeFilteredJson(filters.arcadeFilter)(noMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/allGames`, winIconDir)(noMatureJson)

    const arcadeFullWorkingJson       = makeFilteredJson(filters.arcadeFilter)(noPreliminaryFullJson)
    generateRomdata(emu, `${outputDir}/full/workingOnly`, winIconDir)(noPreliminaryFullJson)

    const arcadeNoMatureWorkingJson   = makeFilteredJson(filters.arcadeFilter)(noPreliminaryNoMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/workingOnly`, winIconDir)(noPreliminaryNoMatureJson)
    
    const noClonesFullJson            = makeFilteredJson(filters.clonesFilter)(mameJson)
    generateRomdata(emu, `${outputDir}/full/allGames/noClones`, winIconDir)(noClonesFullJson)

    const noClonesNoMatureJson        = makeFilteredJson(filters.clonesFilter)(noMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/allGames/noClones`, winIconDir)(noClonesNoMatureJson)

    const noClonesFullWorkingJson     = makeFilteredJson(filters.clonesFilter)(noPreliminaryFullJson)
    generateRomdata(emu, `${outputDir}/full/workingOnly/noClones`, winIconDir)(noClonesFullWorkingJson)

    const noClonesNoMatureWorkingJson = makeFilteredJson(filters.clonesFilter)(noPreliminaryNoMatureJson)
    generateRomdata(emu, `${outputDir}/noMature/workingOnly/noClones`, winIconDir)(noClonesNoMatureWorkingJson)
    
    generateRomdata(emu, `${outputDir}/full/allGames/originalVideoGames`,        winIconDir)(arcadeFullJson)
    generateRomdata(emu, `${outputDir}/noMature/allGames/originalVideoGames`,    winIconDir)(arcadeNoMatureJson)
    generateRomdata(emu, `${outputDir}/full/workingOnly/originalVideoGames`,     winIconDir)(arcadeFullWorkingJson)
    generateRomdata(emu, `${outputDir}/noMature/workingOnly/originalVideoGames`, winIconDir)(arcadeNoMatureWorkingJson)
    applySplits(`genre`, `${outputDir}/full/allGames`,        emu, winIconDir, mameJson)
    applySplits(`genre`, `${outputDir}/noMature/allGames`,    emu, winIconDir, noMatureJson)
    applySplits(`genre`, `${outputDir}/full/workingOnly`,     emu, winIconDir, noPreliminaryFullJson)
    applySplits(`genre`, `${outputDir}/noMature/workingOnly`, emu, winIconDir, noPreliminaryNoMatureJson)

  }
