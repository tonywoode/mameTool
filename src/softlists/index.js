'use strict'

const fs                   = require('fs')
const R                 = require('ramda')

const callSheet            = require('./callSheet.js')
const filterSoftlists      = require('./filterSoftlists.js')
const chooseDefaultEmus    = require('./chooseDefaultEmus.js')
const makeParams           = require('./makeSoftlists/makeParams.js')
const readSoftlistXML      = require('./makeSoftlists/readSoftlistXML.js')
const cleanSoftlist        = require('./makeSoftlists/cleanSoftlist.js')
const setRegionalEmu       = require('./makeSoftlists/setRegionalEmu.js')
const printSoftlistRomdata = require('./makeSoftlists/printSoftlistRomdata.js')

//SOFTLISTS
const softlists = () => {
 
  const hashDir       = `inputs/hash/`
    , outputDir       = `outputs/`
    , systemsJsonFile = fs.readFileSync(`${outputDir}systems.json`)
    , systems         = JSON.parse(systemsJsonFile)
    //TODO - you can append the DTD at the top of the file if it isn't being read correctly
  
    //decide what we want to print to console
    , logGames        = false
    , logChoices      = false
    , logRegions      = false
    , logExclusions   = false
    , logPrinter      = false
  
  //program flow at list level
  R.pipe(
      callSheet(logExclusions)
    , filterSoftlists(hashDir)
    , chooseDefaultEmus(logChoices)
    , makeSoftlists 
  )(systems)
  
  //program flow at emu level
  function makeSoftlists(emuSystems) {
    R.map(emu => {
          const softlistParams = makeParams(hashDir, outputDir, emu)
          readSoftlistXML(softlistParams.xml, softlist => {
            const cleanedSoftlist = cleanSoftlist(softlist)
            printSoftlistRomdata(logGames, logExclusions, logRegions, logPrinter, softlistParams, setRegionalEmu, cleanedSoftlist)
          })
        }, emuSystems)
  }

}

module.exports = {softlists}
