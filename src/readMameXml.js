"use strict"

const XmlStream = require(`xml-stream`)
const R = require(`ramda`)

const cleanKey = (key, systems) => {
  const cleanDollar = subobj  => R.prop( "$", subobj)
  return R.map(obj => obj[key]? 
    R.assoc(`${key}`, cleanDollar(obj[key]), obj) : obj
  , systems )
}

const omitFromDisplay = [`pixclock`, `htotal`, `hbend`, `hbstart`, `vtotal`, `vbend`, `vbstart`]

const shortenDisplay = systems => R.map( obj => obj.display? 
  R.assoc(`display`, R.omit(omitFromDisplay, obj.display), obj) : obj
, systems)

//Parse the mame xml pulling out the fields we need but only from systems which actually work
function makeSystems(mameXMLStream, nodeback) {
  const systems = []
  const xml     = new XmlStream(mameXMLStream)

  //xml stream 'collects' these meaning it deals with repeating xml keys rather than overwriting each time
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
      //node.runnable   = machine.runnable
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
    //todo: unit test for makeSystems is running these too
    const cleanedDisplay = cleanKey(`display`, systems)
    const shortenedDisplay = shortenDisplay(cleanedDisplay)
    const cleanedControl = cleanKey(`control`, shortenedDisplay)
    nodeback(null, cleanedControl)
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

//last two for unit tests
module.exports = { makeSystemsAsync, cleanKey, shortenDisplay }

