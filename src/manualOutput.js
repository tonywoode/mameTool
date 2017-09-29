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
} = require('./filters.js') 


const {makeFilteredJson} = require('./filterMameJson.js')
const {generateRomdata}  = require('./printers.js')
const {Mame, RetroArch}  = require('./types.js') //TODO: this is for dev mode only, better to make it
const makeSplit          = require('./makeSplit.js')

module.exports = (mameJson, winIconDir, outputDir) => {
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
