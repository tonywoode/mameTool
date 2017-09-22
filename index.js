'use strict'

const R                                  = require(`ramda`)
const {readFile, createReadStream}       = require(`fs`)
const _throw                             = m => { throw new Error(m) }

const {cleanJson}                        = require(`./src/cleanJson.js`)
const {iniToJson}                        = require(`./src/fillFromIni.js`)
const {makeSystemsAsync}                 = require(`./src/readMameXml.js`)
const {mfmReaderAsync, mfmFilter}        = require(`./src/mfmReader.js`)
const {printJson, generateRomdata}       = require(`./src/printers.js`)
const {getUniqueProps, makeFilteredJson} = require(`./src/filterMameJson.js`)

const mameXMLInPath                      = `./inputs/mame187.xml`
const mameXMLStream                      = createReadStream(mameXMLInPath)

const mfmTextFileInPath                  = `./inputs/sampleMFMfilter.txt`
const mfmTextFileStream                  = createReadStream(mfmTextFileInPath)

const outputDir                          = require(`./src/getDir.js`).getOutputDir()
const jsonOutName                        = `mame.json`
const winIconDir                         = require(`./src/getDir.js`).getWinIconDir()
const {Mame, RetroArch}                  = require(`./src/types.js`)


// If there's an xml that parses in the jsonOutDir, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(`${outputDir}/${jsonOutName}`, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : resolve(JSON.parse(data) )  
  )
)

// these are the available inis, specifying their type (and their internal name if necessary)
//   there are three types of ini file (see iniReader.js)
//   n.b.: to add an ini to romdata, also populate it in makeRomdata
const inis = [
    {iniName: `arcade`,        iniType: `bare`}
  , {iniName: `arcade_NOBIOS`, iniType: `bare`}
  , {iniName: `bestgames`,     iniType: `section`}
  , {iniName: `category`,      iniType: `section`}
  , {iniName: `catlist`,       iniType: `section`}
  , {iniName: `genre`,         iniType: `section`}
  , {iniName: `languages`,     iniType: `section`}
  , {iniName: `mamescore`,     iniType: `kv`,     sectionName: `MAMESCORE`}
  , {iniName: `mess`,          iniType: `bare`}
  , {iniName: `monochrome`,    iniType: `section`}
  , {iniName: `nplayers`,      iniType: `kv`,     sectionName: `NPlayers`}
  , {iniName: `screenless`,    iniType: `bare`}
  , {iniName: `series`,        iniType: `section`}
  , {iniName: `version`,       iniType: `section`}
]

    /* now make a naive no-mature set. Analysing the data shows we need to filter 
     *  BOTH by regex of Mature in catlist AND category. There's no point filtering
     *  by the genre "Mature" (its a tiny subset of those two), but we also need 
     *  to look for !word-separated "Adult" and "Sex" in game title
     *  There is a mature.ini available here: http://www.progettosnaps.net/catver/
     *  but in my experience, it doesn't filter out all of this...
     */

    const noMatureFilters = [
       { name: `noMatureCategory`, type: `remove`, path: [`category`], value: /Mature/ }
     , { name: `noMatureCatlist`,  type: `remove`, path: [`catlist`],  value: /Mature/ }
     , { name: `noAdult`,          type: `remove`, path: [`system`],   value: /\WAdult\W/i }
     , { name: `noSex`,            type: `remove`, path: [`system`],   value: /\WSex\W/i }
    ]

    // next, here's my best approximation of what the average arcade gamer wants in a filter
    const arcadeFilters = [
       { name: `noBios`,          type: `remove`, path: [`isbios`] }
     , { name: `noCasino`,        type: `remove`, path: [`genre`],    value: `Casino` }
     , { name: `noCasinoCatlist`, type: `remove`, path: [`catlist`],  value: /Casino/ } //turns out you can't trust genre
     , { name: `noClones`,        type: `remove`, path: [`cloneof`] }
     , { name: `nonMechanical`,   type: `remove`, path: [`ismechanical`] }
     , { name: `nonMechGenre`,    type: `remove`, path: [`genre`],    value: `Electromechanical` } //turns out you can't trust the ini bool
     , { name: `noMess`,          type: `remove`, path: [`mess`] }
     , { name: `nonPrintClub`,    type: `remove`, path: [`genre`],    value: `Print Club` } //turns out you can't trust the ini bool
     , { name: `noSimulator`,     type: `remove`, path: [`genre`],    value: `Simulator` } //a couple of laserDisc players!
     , { name: `nonTableTop`,     type: `remove`, path: [`genre`],    value: `Tabletop` } //that means Mahjong etc
     , { name: `nonTableGenre`,   type: `remove`, path: [`category`], value: /Tabletop/ } //turns out you can't trust the ini AGAIN
     , { name: `noQuiz`,          type: `remove`, path: [`genre`],    value: `Quiz` }
     , { name: `noCQuizCatList`,  type: `remove`, path: [`catlist`],  value: /Quiz/ } //turns out you can't trust genre
     , { name: `noUtilities`,     type: `remove`, path: [`genre`],    value: `Utilities` }
    ] 

    // then we'll write more filters and pass them to the emulator and adult variations
    // but another main thing to filter on is whether we want our lists to include games whose emulation
    // is marked 'preliminary'
    const noPreliminaryFilter = [ { name: `noPreliminary`, type: `remove`, path: [`status`], value: `preliminary` } ]

    // make a noClones version of those full jsons
    const noClonesFilter = [ { name: `noClones`, type: `remove`, path: [`cloneof`] } ]

  // next let's make folder split by genre, set type will be the folder name eg: 'full', 'mature'
    const genreSplit = (mameSetType, emuType, json) => {
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

    genreSplit(`full/allGames`, Mame, mameJson)
    genreSplit(`full/allGames`, RetroArch, mameJson)

    genreSplit(`noMature/allGames`, Mame, noMatureJson)
    genreSplit(`noMature/allGames`, RetroArch, noMatureJson)

    genreSplit(`full/workingOnly`, Mame, noPreliminaryFullJson)
    genreSplit(`full/workingOnly`, RetroArch, noPreliminaryFullJson)

    genreSplit(`noMature/workingOnly`, Mame, noPreliminaryNoMatureJson)
    genreSplit(`noMature/workingOnly`, RetroArch, noPreliminaryNoMatureJson)   
    
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
