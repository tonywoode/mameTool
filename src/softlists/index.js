'use strict'

const fs                   = require('fs')
const R                    = require('ramda')

const callSheet            = require('./callSheet.js')
const filterSoftlists      = require('./filterSoftlists.js')
const chooseDefaultEmus    = require('./chooseDefaultEmus.js')
const makeParams           = require('./makeSoftlists/makeParams.js')
const readSoftlistXML      = require('./makeSoftlists/readSoftlistXML.js')
const cleanSoftlist        = require('./makeSoftlists/cleanSoftlist.js')
const setRegionalEmu       = require('./makeSoftlists/setRegionalEmu.js')
const printSoftlistRomdata = require('./makeSoftlists/printSoftlistRomdata.js')

//SOFTLISTS
const softlists = (hashDir, softlistOutputDir, log) => {
 
  const systemsJsonFile = fs.readFileSync(`${softlistOutputDir}systems.json`)
  const systems         = JSON.parse(systemsJsonFile)
  //TODO - you can append the DTD at the top of the file if it isn't being read correctly
  //program flow at list level
  R.pipe(
      callSheet(log)
    , filterSoftlists(hashDir)
    , chooseDefaultEmus(log)
    , makeSoftlists 
  )(systems)
  
  //program flow at emu level
  function makeSoftlists(emuSystems) {
    R.map(emu => {
          const softlistParams = makeParams(hashDir, softlistOutputDir, emu)
          readSoftlistXML(softlistParams.xml, softlist => {
            const cleanedSoftlist = cleanSoftlist(softlist)
            printSoftlistRomdata(log, softlistParams, setRegionalEmu, cleanedSoftlist)
          })
        }, emuSystems)
  }

}

module.exports = {softlists}
