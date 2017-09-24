'use strict'

const R                            = require(`ramda`)
const {readFile, createReadStream} = require(`fs`)
const _throw                       = m => { throw new Error(m) }

const {cleanJson}                  = require(`./src/cleanJson.js`)
const {iniToJson}                  = require(`./src/fillFromIni.js`)
const {makeSystemsAsync}           = require(`./src/readMameXml.js`)
const {mfmReaderAsync, mfmFilter}  = require(`./src/mfmReader.js`)
const {printJson, generateRomdata} = require(`./src/printers.js`)
const {getUniqueProps, makeFilteredJson}   = require(`./src/filterMameJson.js`)

const strategy = process.argv.length > 2? require(`./src/livePaths`) : require(`./src/devPaths.js`)

const mfm                = strategy.mfm
const mameXMLInPath      = strategy.mameXMLInPath 
const mameXMLStream      = strategy.mameXMLStream
const mfmTextFileInPath  = strategy.mfmTextFileInPath 
const mfmTextFileStream  = strategy.mfmTextFileStream
const outputDir          = strategy.outputDir       
const jsonOutName        = strategy.jsonOutName    
const winIconDir         = strategy.winIconDir    
const Mame               = strategy.Mame 
const RetroArch          = strategy.RetroArch

// If there's an xml that parses in the jsonOutDir, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(`${outputDir}/${jsonOutName}`, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : resolve(JSON.parse(data) )  
  )
)

// these are the available inis, specifying their type (and their internal name if necessary)
//   there are three types of ini file (see iniReader.js)
//   n.b.: to add an ini to romdata, also populate it in makeRomdata
const inis = require(`./src/inis.json`) 

const {noMatureFilters, arcadeFilters, noPreliminaryFilter, noClonesFilter} = require(`./src/filters.js`) 

// next let's make folder split by genre, set type will be the folder name eg: 'full', 'mature'
const genreSplit = (mameSetType, emuType, winIconDir, json) => {
  const genreArray = getUniqueProps(`genre`)(json)
  //now for each genre we need to make a folder with a romdata in it
  R.map( genre => {
    const genreFilter = [ { name: genre, type: `keep`, path: [`genre`], value: genre } ]   
    const thisGenreJson = makeFilteredJson(genreFilter)(json)
    //make a folder per genre (but windows interprets the . in Misc. oddly) 
    const thisFolderName = `${mameSetType}/Genre/${genre.replace(`.`, ``)}`
    generateRomdata(emuType,      thisFolderName, winIconDir)(thisGenreJson)
  
  }, genreArray)
 
  return json
}

decideWhetherToXMLAsync()

  .then( systems => {
    // process all the inis into the json
    const filledSystems = inis.reduce( (systems, ini) => 
      iniToJson(ini.iniName, ini.iniType, ini.sectionName)(systems), systems ) 
    // post-process the data-complete json, printing it becomes a gatepost
    const mameJson = R.pipe(
      cleanJson , printJson(outputDir, jsonOutName)
    )(filledSystems) 
  
    const noMatureJson = makeFilteredJson(noMatureFilters)(mameJson)
    const noPreliminaryFullJson     = makeFilteredJson(noPreliminaryFilter)(mameJson)
    const arcadeFullJson            = makeFilteredJson(arcadeFilters)(mameJson)
    generateRomdata(Mame,      `full/allGames`, winIconDir)(mameJson)
    generateRomdata(RetroArch, `full/allGames`, winIconDir)(mameJson)

    const noPreliminaryNoMatureJson = makeFilteredJson(noPreliminaryFilter)(noMatureJson)
    const arcadeNoMatureJson        = makeFilteredJson(arcadeFilters)(noMatureJson)
    generateRomdata(Mame,      `noMature/allGames`, winIconDir)(noMatureJson)
    generateRomdata(RetroArch, `noMature/allGames`, winIconDir)(noMatureJson)

    const arcadeFullWorkingJson     = makeFilteredJson(arcadeFilters)(noPreliminaryFullJson)
    generateRomdata(Mame,      `full/workingOnly`,     winIconDir)(noPreliminaryFullJson)
    generateRomdata(RetroArch, `full/workingOnly`,     winIconDir)(noPreliminaryFullJson)

    const arcadeNoMatureWorkingJson = makeFilteredJson(arcadeFilters)(noPreliminaryNoMatureJson)
    generateRomdata(Mame,      `noMature/workingOnly`, winIconDir)(noPreliminaryNoMatureJson)
    generateRomdata(RetroArch, `noMature/workingOnly`, winIconDir)(noPreliminaryNoMatureJson)
    
    const noClonesFullJson          = makeFilteredJson(noClonesFilter)(mameJson)
    generateRomdata(Mame,      `full/allGames/noClones`,        winIconDir)(noClonesFullJson)
    generateRomdata(RetroArch, `full/allGames/noClones`,        winIconDir)(noClonesFullJson)

    const noClonesNoMatureJson        = makeFilteredJson(noClonesFilter)(noMatureJson)
    generateRomdata(Mame,      `noMature/allGames/noClones`,    winIconDir)(noClonesNoMatureJson)
    generateRomdata(RetroArch, `noMature/allGames/noClones`,    winIconDir)(noClonesNoMatureJson)

    const noClonesFullWorkingJson     = makeFilteredJson(noClonesFilter)(noPreliminaryFullJson)
    generateRomdata(Mame,      `full/workingOnly/noClones`,     winIconDir)(noClonesFullWorkingJson)
    generateRomdata(RetroArch, `full/workingOnly/noClones`,     winIconDir)(noClonesFullWorkingJson)

    const noClonesNoMatureWorkingJson = makeFilteredJson(noClonesFilter)(noPreliminaryNoMatureJson)
    generateRomdata(Mame,      `noMature/workingOnly/noClones`, winIconDir)(noClonesNoMatureWorkingJson)
    generateRomdata(RetroArch, `noMature/workingOnly/noClones`, winIconDir)(noClonesNoMatureWorkingJson)
    

    generateRomdata(Mame,      `full/allGames/originalVideoGames`,        winIconDir)(arcadeFullJson)
    generateRomdata(RetroArch, `full/allGames/originalVideoGames`,        winIconDir)(arcadeFullJson)

    generateRomdata(Mame,      `noMature/allGames/originalVideoGames`,    winIconDir)(arcadeNoMatureJson)
    generateRomdata(RetroArch, `noMature/allGames/originalVideoGames`,    winIconDir)(arcadeNoMatureJson)

    generateRomdata(Mame,      `full/workingOnly/originalVideoGames`,     winIconDir)(arcadeFullWorkingJson)
    generateRomdata(RetroArch, `full/workingOnly/originalVideoGames`,     winIconDir)(arcadeFullWorkingJson)

    generateRomdata(Mame,      `noMature/workingOnly/originalVideoGames`, winIconDir)(arcadeNoMatureWorkingJson)
    generateRomdata(RetroArch, `noMature/workingOnly/originalVideoGames`, winIconDir)(arcadeNoMatureWorkingJson)

    genreSplit(`full/allGames`, Mame, winIconDir, mameJson)
    genreSplit(`full/allGames`, RetroArch, winIconDir, mameJson)

    genreSplit(`noMature/allGames`, Mame, winIconDir, noMatureJson)
    genreSplit(`noMature/allGames`, RetroArch, winIconDir, noMatureJson)

    genreSplit(`full/workingOnly`, Mame, winIconDir, noPreliminaryFullJson)
    genreSplit(`full/workingOnly`, RetroArch, winIconDir, noPreliminaryFullJson)

    genreSplit(`noMature/workingOnly`, Mame, winIconDir, noPreliminaryNoMatureJson)
    genreSplit(`noMature/workingOnly`, RetroArch, winIconDir, noPreliminaryNoMatureJson)   
    
    //then process an mfm file
    return Promise.all([mfmReaderAsync(mfmTextFileStream), mameJson])
  })

  .then( ([mfmArray,  mameJson]) => { 
    const mfmFilteredJson = mfmFilter(mfmArray)(mameJson) 

    generateRomdata(Mame,      `mfm`, winIconDir)(mfmFilteredJson)
    generateRomdata(RetroArch, `mfm`, winIconDir)(mfmFilteredJson)


    return mameJson
  })

  .catch(err => _throw(err) )
