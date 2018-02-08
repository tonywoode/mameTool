'use strict'

module.exports = ( xml, name, emulator, nodeback) => {
  const names = []
  xml.on(`updateElement: software`, software => {
    names.push(software.$.name)
  })
  
  xml.on(`error`, (message) => 
    nodeback(`XML parsing failed with ${message}`, null) )
  
  xml.on(`end`, () => nodeback(null, names) )
}
