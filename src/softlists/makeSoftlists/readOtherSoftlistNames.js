'use strict'

const fs        = require('fs')
const XmlStream = require('xml-stream')
const R         = require('ramda')
const readSoftlistForGamenames = require('./readGameNamesFromXML.js')

module.exports = (hashDir, emulator, callback) => {
  const otherGames = []
  R.map( emu => otherGames.push(emu.name), emulator.otherSoftlists)
  console.log(`${emulator.name} has other softlists: ${JSON.stringify(otherGames)}`)
 
  //maybe this is the best way you're gonna get to manually code a Promise.all with callbacks
  //https://stackoverflow.com/a/36879062/3536094
  const finito = (names, num) => {if (num === otherGames.length-1){ callback(names)} }

  if (otherGames.length >0) { 
    R.map( name => {
      var num = 0
      const stream = fs.createReadStream(`${hashDir}${name}.xml`)
      const xml    = new XmlStream(stream)
      readSoftlistForGamenames(xml, name, emulator, names => {
            num++
        finito(names, num)

      })
    }, otherGames)
  }
}  

