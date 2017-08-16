"use strict"

const XmlStream = require(`xml-stream`)
//Parse the mame xml pulling out the fields we need but only from systems which actually work
function makeSystems(mameXMLStream, nodeback) {
  const systems = []
  const xml     = new XmlStream(mameXMLStream)

  console.log(`Reading a very large xml file, patience...`)
  xml.on(`updateElement: machine`, machine => {
    if ( 
       machine.$.runnable  !== `no`
    ) {
      const node          = {}
      node.call           = machine.$.name
      node.isbios         = machine.$.isbios
      node.isdevice       = machine.$.isdevice
      node.ismechanical   = machine.$.ismechanical
      //node.runnable       = machine.runnable
      node.cloneof        = machine.$.cloneof
      node.romof          = machine.$.romof
      node.system         = machine.description
      node.year           = machine.year
      node.company        = machine.manufacturer
      node.display        = machine.display
      node.control        = machine.input.control
      node.status         = machine.driver.$.status
      node.savestate      = machine.driver.$.savestate
      if (machine.softwarelist) node.hasSoftwarelist = true
      systems.push(node)
    }
  })

  xml.on(`end`, () => {
    nodeback(null, systems)
  })

  xml.on('error', (message) => {
    nodeback(console.error(`XML parsing failed with ${message}`), null)
  })

}


const makeSystemsAsync = mameXMLInPath => new Promise( (resolve, reject) => 
    makeSystems(mameXMLInPath, (err, systems) =>
      !err? resolve(systems) : reject(err)
    )
  )

//most of these just for unit tests
module.exports = { makeSystemsAsync}

