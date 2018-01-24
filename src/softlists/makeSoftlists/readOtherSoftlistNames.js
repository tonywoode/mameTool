'use strict'

const fs        = require('fs')
const XmlStream = require('xml-stream')
const R         = require('ramda')
const readSoftlistForGamenames = require('./readGameNamesFromXML.js')

module.exports = (hashDir, softlist, callback) => {
  const otherSoftlistDevices = []
  //todo: actually we aren't taking the game names from ALL softlists - maybe that would be quicker?
  const thisSoftlistsOtherGameNames = []
  R.map( emu => otherSoftlistDevices.push(emu.name), softlist.otherSoftlists)
  console.log(`${softlist.name} has other softlists: ${JSON.stringify(otherSoftlistDevices)}`)
 
  //maybe this is the best way you're gonna get to manually code a Promise.all with callbacks
  //https://stackoverflow.com/a/36879062/3536094
  const finito = (thisSoftlistsOtherGameNames, num) => {if (num === otherSoftlistDevices.length-1){ callback(thisSoftlistsOtherGameNames)} }

      var num = 0
  if (otherSoftlistDevices.length >0) { 
    R.map( name => {
      const stream = fs.createReadStream(`${hashDir}${name}.xml`)
      const xml    = new XmlStream(stream)
      readSoftlistForGamenames(xml, name, softlist, names => {
        //console.log(`some other games of ${emulator.name}: ${JSON.stringify(names)}`)
        const thisSoftlistsGameNames = { [name] : names }
        thisSoftlistsOtherGameNames.push(thisSoftlistsGameNames)
        num++
        finito(thisSoftlistsOtherGameNames, num)
      })
    }, otherSoftlistDevices)
  }
}  

