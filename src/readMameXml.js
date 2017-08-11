"use strict"

const XmlStream = require(`xml-stream`)

 //Parse the mame xml pulling out the fields we need but only from systems which actually work
function makeSystems(mameXMLStream, nodeback) {
  const systems = []
  const xml     = new XmlStream(mameXMLStream)

  //xml stream 'collects' these meaning it deals with repeating xml keys rather than overwriting each time
  console.log(`Reading a very large xml file, patience...`)
  xml.on(`updateElement: machine`, machine => {
    if ( 
       machine.$.runnable  !== `no`
      //&& machine.driver.$.status  !== `preliminary` //this is a calculated intersection of all of the below
      //&& machine.driver.$.emulation !== `preliminary`
      //&& machine.driver.$.color   === `good`
      //&& machine.driver.$.sound   === `good`
      //&& machine.driver.$.graphic === `good` //remember 'nes' doesn't have good graphic so be careful
    ) {
      const node    = {}
      node.call     = machine.$.name
      node.cloneof  = machine.$.cloneof
      node.system   = machine.description
      node.year     = machine.year
      node.company  = machine.manufacturer
      node.status   = machine.driver.$.status
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


module.exports = makeSystemsAsync

