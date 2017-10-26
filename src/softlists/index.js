'use strict'

const fs                   = require('fs')
const R                    = require('ramda')
const _throw               = m => { throw new Error(m) }

const callSheet            = require('./callSheet.js')
const filterSoftlists      = require('./filterSoftlists.js')
const chooseDefaultEmus    = require('./chooseDefaultEmus.js')
const makeParams           = require('./makeSoftlists/makeParams.js')
const readSoftlistXML      = require('./makeSoftlists/readSoftlistXML.js')
const cleanSoftlist        = require('./makeSoftlists/cleanSoftlist.js')
const setRegionalEmu       = require('./makeSoftlists/setRegionalEmu.js')
const printSoftlistRomdata = require('./makeSoftlists/printSoftlistRomdata.js')

//SOFTLISTS
const softlists = (mameEmu, jsonOutPath, hashDir, outputDir, log) => {

  fs.existsSync(jsonOutPath) || _throw(`there's no scanned MAME file at ${jsonOutPath}`)
  const systemsJsonFile = fs.readFileSync(jsonOutPath)
  const systems         = JSON.parse(systemsJsonFile).messSystems
  //TODO - you can append the DTD at the top of the file if it isn't being read correctly
  
  //program flow at emu level
  const  makeSoftlists = mameEmu => emuSystems => {
    R.map(emu => {
          const softlistParams = makeParams(mameEmu, hashDir, outputDir, emu)
          readSoftlistXML(softlistParams.xml, softlist => {
            const cleanedSoftlist = cleanSoftlist(softlist)
            printSoftlistRomdata(mameEmu, log, softlistParams, setRegionalEmu, cleanedSoftlist)
          })
        }, emuSystems)

    return emuSystems
  }

 //program flow at list level
  R.pipe(
      callSheet(log)
    , filterSoftlists(hashDir)
    , chooseDefaultEmus(log)
    , makeSoftlists(mameEmu) 
  )(systems)
  
 
}

module.exports = {softlists}
