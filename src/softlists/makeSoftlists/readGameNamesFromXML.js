'use strict'

module.exports = ( xml, name, emulator, callback) => {
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
    callback(names)

  })
}
