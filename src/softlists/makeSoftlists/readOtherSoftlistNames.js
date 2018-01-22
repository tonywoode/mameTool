'use strict'

const fs        = require('fs')
const XmlStream = require('xml-stream')
const R         = require('ramda')

module.exports = (settings, hashDir, emulator, callback) => {
  const otherGames = []
  R.map( emu => otherGames.push(emu.name), emulator.otherSoftlists)
  console.log(`${emulator.name} has other softlists: ${JSON.stringify(otherGames)}`)
  //for each of the other softlists
  if (otherGames.length >0) { 
    R.map( name => {
      const stream = fs.createReadStream(`${hashDir}${name}.xml`)
      const xml    = new XmlStream(stream)
      readSoftlistForGamenames(xml, name, emulator, secondCallback => {
        callback(secondCallback)
      })
    }, otherGames)
  }
}  


const readSoftlistForGamenames = ( xml, name, emulator, secondCallback) => {
  //console.log(`reading the softlist for ${name}`)
  const names = []
  xml.on(`updateElement: software`, software => {
    names.push(software.$.name)
    //console.log(`now ${name} has a game called ${software.$.name}`)
    //names.push(node)
  })
  
  xml.on(`end`, () => {
    //console.log(JSON.stringify(names, null, '\t'))
    console.log(`I just collected ${name} for ${emulator.name}`)
    secondCallback(names)

  })
}
