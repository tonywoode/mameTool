'use strict'

const fs                   = require('fs')
const R                    = require('ramda')
const _throw               = m => { throw new Error(m) }

const callSheet            = require('./callSheet.js')
const filterSoftlists      = require('./filterSoftlists.js')
const chooseDefaultEmus    = require('./chooseDefaultEmus.js')

const {cleanSoftlist, makeParams, printSoftlistRomdata
     , printEmbeddedRomdata, readSoftlistXML, readOtherSoftlistNames} = require('./makeSoftlists')

const softlists = (settings, jsonOutPath, hashDir, outputDir, log) => {

  fs.existsSync(jsonOutPath) || _throw(`there's no scanned MAME file at ${jsonOutPath} - run me first with '--scan'`)
  const systemsJsonFile = fs.readFileSync(jsonOutPath)
  const systems         = JSON.parse(systemsJsonFile).messSystems
  //embdedded systems are like softlists, so we'll save them with them
  const embedded        = JSON.parse(systemsJsonFile).embedded

  // idea: I couldn't find an xml reader that could read an external DTD as additional input, but you could append the DTD at the top of the softlist file if it isn't being read correctly
  
  //program flow at emu level
  const  makeSoftlists = settings => emuSystems => {
    R.map(emu => {
          const softlistParams = makeParams(settings, hashDir, outputDir, emu)
          readSoftlistXML(softlistParams.xml, softlist => {
            const cleanedSoftlist = cleanSoftlist(softlist)
            readOtherSoftlistNames(hashDir, emu, log, thisSoftlistsOtherGameNames => {
              let softlistParamsPlusNames = softlistParams //TODO: done to not make an empty object key if there arent otherSoftlists
              R.isEmpty(thisSoftlistsOtherGameNames) || (
                  log.otherSoftlists && 
                    console.log(`Made otherGames list for ${emu.name}: ${JSON.stringify(thisSoftlistsOtherGameNames, null, '')}`)
                , softlistParamsPlusNames = R.assoc( `otherGameNames`, thisSoftlistsOtherGameNames, softlistParams) 
              )
              printSoftlistRomdata(settings, softlistParamsPlusNames, cleanedSoftlist, log)
            })
          })
        }, emuSystems)

    return emuSystems
  }

  //program flow at list level
  R.pipe(
      //printit
      callSheet(log)
    , filterSoftlists(hashDir, log)
    , chooseDefaultEmus(log)
    , makeSoftlists(settings) 
  )(systems)
  
  //then the embedded systems when you're done with that
  printEmbeddedRomdata(settings, outputDir)(embedded)

}

module.exports = {softlists}
