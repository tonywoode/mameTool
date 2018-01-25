'use strict'

module.exports = ( xml, name, emulator, callback) => {
  const names = []
  xml.on(`updateElement: software`, software => {
    names.push(software.$.name)
  })
  
  xml.on(`end`, () => callback(names) )
}
