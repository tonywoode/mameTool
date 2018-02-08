'use strict'

module.exports = (xml, nodeback) => {

  const softlist = []

  xml.collect(`info`)
  xml.collect(`sharedfeat`)
  xml.collect(`feature`)
  xml.collect(`part`)
  xml.on(`updateElement: software`, software => {
    if (
          software.$.supported !== `no` 
    ) {
      const node = {}
      node.call          = software.$.name
      node.cloneof       = software.$.cloneof
      node.name          = software.description
      node.year          = software.year
      node.company       = software.publisher
      node.info          = software.info
      node.sharedfeature = software.sharedfeat
      node.part          = software.part
      softlist.push(node)
    }
  })

  xml.on(`error`, (message) => 
    nodeback(`Softlist XML parsing failed with ${message}`, null) )

  xml.on(`end`, () => {
    // console.log(JSON.stringify(softlist, null, '\t')); process.exit()
    nodeback(null, softlist)
  })

}

