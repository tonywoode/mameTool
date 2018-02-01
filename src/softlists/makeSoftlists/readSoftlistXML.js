'use strict'

module.exports = (xml, callback) => {

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
  xml.on(`end`, () => {
    // console.log(JSON.stringify(softlist, null, '\t')); process.exit()
    callback(softlist)
  })

}

