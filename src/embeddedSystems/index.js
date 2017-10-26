'use strict'

const fs                                 = require('fs')
const R                                  = require('ramda')

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

const embedded = (mameEmu, romdataConfig, jsonOutPath) => {

  fs.existsSync(jsonOutPath) || _throw(`there's no scanned MAME file at ${jsonOutPath}`)
  const systemsJsonFile = fs.readFileSync(jsonOutPath)
  const systems         = JSON.parse(systemsJsonFile).embedded

  
  //program flow
    R.pipe(
       mungeCompanyAndSystemNamesEmbedded
     , removeBoringSystemsEmbedded
     , printRomdata(mameEmu, romdataConfig)
    )(systems)

}

module.exports = {embedded}
