'use strict'

const XmlStream = require('xml-stream')
//Parse the mame xml pulling out the fields we need but only from systems which actually work
const makeSystems = (mameXMLStream, nodeback) => {

  const xml         = new XmlStream(mameXMLStream)

  const versionInfo = {}
  const arcade      = []
  const messSystems = []
  const embedded    = []

  console.log(`Reading a very large xml file, patience...`)

  xml.on(`startElement: mame`, mame => {
    versionInfo.mameVersion       = mame.$.build
    versionInfo.mameConfigVersion = mame.$.mameconfig
  })

  //xml stream 'collects' these meaning it deals with repeating xml keys rather than overwriting each time
  //they are all for mess
  xml.collect('device')
  xml.collect('softwarelist')
  xml.collect(`extension`) //turns out xml stream is just regexing these keys, so this is deeply-nested

  xml.on(`updateElement: machine`, machine => {


    //make the arcade object
    if (machine.$.runnable !== `no`) {
      const arcadeNode          = {}
      arcadeNode.call           = machine.$.name
      arcadeNode.isbios         = machine.$.isbios
      arcadeNode.isdevice       = machine.$.isdevice
      arcadeNode.ismechanical   = machine.$.ismechanical
      //arcadeNode.runnable     = machine.runnable //see above
      arcadeNode.cloneof        = machine.$.cloneof
      arcadeNode.romof          = machine.$.romof
      arcadeNode.system         = machine.description
      arcadeNode.year           = machine.year
      arcadeNode.company        = machine.manufacturer
      arcadeNode.display        = machine.display
      arcadeNode.control        = machine.input.control
      arcadeNode.status         = machine.driver.$.status
      arcadeNode.savestate      = machine.driver.$.savestate
      if (machine.softwarelist) arcadeNode.hasSoftwarelist = true
      arcade.push(arcadeNode)
    }

    //make the mess object
    if ( //machine.softwarelist // we used to do this when doing retroarch, but it turned out life wasn't that simple after all....
         machine.device //this helps to narrow down on MESS machines vs Arcade games (lack of coin slots isn't quite enough, but this isn't enough either as many arcade machines had dvd drives)
      && machine.$.isdevice         === `no` //see the mame.exe (internal)  DTD which defaults to no: <!ATTLIST machine isdevice (yes|no) "no"> TODO: some home consoles didn't have devices...
      && machine.$.isbios           === `no` 
      && machine.$.ismechanical     === `no`
      && machine.$.runnable         === `yes`
      && !machine.input.$.coins
      //&& machine.driver.$.status  === `good` //I think this is some kind of intersection of the some or all of the below
      && machine.driver.$.emulation === `good`
      //&& machine.driver.$.color   === `good`
      //&& machine.driver.$.sound   === `good`
      //&& machine.driver.$.graphic === `good` //you want nes? don't turn this on....
    ) {
      const messNode    = {}
      messNode.company  = machine.manufacturer
      messNode.system   = machine.description 
      messNode.call     = machine.$.name
      messNode.cloneof  = machine.$.cloneof
      messNode.softlist = machine.softwarelist
      messNode.device   = machine.device
      messSystems.push(messNode)
    }


    //make the embedded object
    // TODO: same as mess but negating device, could we save time by checking device after and assigning to respective node?
    if ( 
         !machine.device 
      && machine.$.isdevice         === `no` 
      && machine.$.isbios           === `no` 
      && machine.$.ismechanical     === `no`
      && machine.$.runnable         === `yes`
      && !machine.input.$.coins
      //&& machine.driver.$.status  === `good` 
      && machine.driver.$.emulation === `good`
      //&& machine.driver.$.color   === `good`
      //&& machine.driver.$.sound   === `good`
      //&& machine.driver.$.graphic === `good` 
    ) {
      const embeddedNode    = {}
      embeddedNode.company  = machine.manufacturer
      embeddedNode.system   = machine.description 
      embeddedNode.call     = machine.$.name
      embeddedNode.cloneof  = machine.$.cloneof
      embeddedNode.softlist = machine.softwarelist
      embeddedNode.device   = machine.device
      embedded.push(embeddedNode)
    }

  })

  xml.on(`end`, () => {
    nodeback(null, {versionInfo, arcade, messSystems, embedded}) 
  })
  xml.on(`error`, (message) => 
    nodeback(console.error(`XML parsing failed with ${message}`), null) )

}

const makeSystemsAsync = mameXMLInPath => new Promise( (resolve, reject) => 
    makeSystems(mameXMLInPath, (err, sysObj) =>
      !err? resolve(sysObj) : reject(err)
    )
  )

module.exports = {makeSystemsAsync}

