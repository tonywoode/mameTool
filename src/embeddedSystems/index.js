'use strict'

const fs                                 = require('fs')
const R                                  = require('ramda')
const XmlStream                          = require('xml-stream')

const readMameXMLembedded                = require('./readMameXML.js')
const mungeCompanyAndSystemNamesEmbedded = require('./mungeCompanyAndSystemNames.js')
const removeBoringSystemsEmbedded        = require('./removeBoringSystems.js')
const printRomdata                       = require('./printRomdata.js')

//EMBEDDED SYSTEMS
/* here we pair down the imp elsewhere to print us a set of embedded systems in mess
 * its important to note that this is only possible atm because there is still a standalone
 * mess executable you can ask to --listdevices. The mess team say that there won't be
 * this standalone exe in the future. If that comes to pass, they need a 'isMess' key. 
 * This class uses the mecahanics of the other classes in this module, but has a far
 * narrower scope, its an afterthought */

const embedded = (messXMLInPathEmbedded) => {
  const streamEmbedded = fs.createReadStream(messXMLInPathEmbedded)
  const xmlEmbedded    = new XmlStream(streamEmbedded)
  
  //program flow
  readMameXMLembedded( xmlEmbedded, systems => {
    R.pipe(
       mungeCompanyAndSystemNamesEmbedded
     , removeBoringSystemsEmbedded
     , printRomdata
    )(systems)
  })

}

module.exports = {embedded}
