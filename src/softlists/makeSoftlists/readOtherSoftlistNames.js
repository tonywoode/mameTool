'use strict'

const fs        = require('fs')
const XmlStream = require('xml-stream')
const R         = require('ramda')

module.exports = (settings, hashDir, emulator) => {
  const otherGames = R.map( emu => ({ [emu.name] : '' }), emulator.otherSoftlists)

  //for each of the other softlists
  R.map(soflistNames => {
    //get its name
    //console.log(Object.keys(soflistNames)[0]), otherGames)
    const name   = (Object.keys(soflistNames)[0]), otherGames)
    //make a stream out of the name
    const stream = fs.createReadStream(`${hashDir}${name}.xml`)
    const xml    = new XmlStream(stream)
    //then read the appropriate has file and get all the names of games into an array
    
//console.log(otherGames)
  }

  return  ({ otherGames})

}  
