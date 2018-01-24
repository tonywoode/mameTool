'use strict'

const fs                   = require('fs')
const R                    = require('ramda')
const _throw               = m => { throw new Error(m) }

const callSheet            = require('./callSheet.js')
const filterSoftlists      = require('./filterSoftlists.js')
const chooseDefaultEmus    = require('./chooseDefaultEmus.js')

const {cleanSoftlist, makeParams, printSoftlistRomdata
     , printEmbeddedRomdata, readSoftlistXML, setRegionalEmu, readOtherSoftlistNames} = require('./makeSoftlists')

const softlists = (settings, jsonOutPath, hashDir, outputDir, log) => {

  fs.existsSync(jsonOutPath) || _throw(`there's no scanned MAME file at ${jsonOutPath} - run me first with '--scan'`)
  const systemsJsonFile = fs.readFileSync(jsonOutPath)
  const systems         = JSON.parse(systemsJsonFile).messSystems
  //embdedded systems are like softlists, so we'll save them with them
  const embedded        = JSON.parse(systemsJsonFile).embedded
  //TODO - you can append the DTD at the top of the file if it isn't being read correctly
  //program flow at emu level
  const  makeSoftlists = settings => emuSystems => {
    R.map(emu => {
          const softlistParams = makeParams(settings, hashDir, outputDir, emu)
          readSoftlistXML(softlistParams.xml, softlist => {
            const cleanedSoftlist = cleanSoftlist(softlist)
            readOtherSoftlistNames(hashDir, emu, thisSoftlistsOtherGameNames => {
              console.log(`\nMade other gamenames list for ${emu.name}${JSON.stringify(thisSoftlistsOtherGameNames, null, '\t')}`)
              const softlistParamsPlusNames = R.assoc( `otherGameNames`, thisSoftlistsOtherGameNames, softlistParams)  
              printSoftlistRomdata(settings, softlistParamsPlusNames, setRegionalEmu, cleanedSoftlist, log)
            })
          })
        }, emuSystems)

    return emuSystems
  }

  const printit = json => {
    fs.writeFileSync('./deleteme.json', JSON.stringify(json, null, `\t`))
    process.exit()
    return json
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
