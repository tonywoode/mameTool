'use strict'

const R                              = require('ramda')
const {embeddedSystemsBoringSystems} = require('../../messConfig.json')

module.exports = systems => {

  const isItBoring = obj => { 
    const name = obj.company? `${obj.company} ${obj.system}`: `${obj.system}`
    return embeddedSystemsBoringSystems.includes(name) 
  }
  const systemsWithGames = R.reject(obj => isItBoring(obj), systems)

  /* this requires the mess key to be read from the mame extras folders mess.ini
   *  it removes about 30 systems that match the xml scrape filter 
   *  but still seem to be arcade systems, despite not taking coins ....
   *  the quality of the mameExtras/folders/*.ini files is sometimes questionable,
   *  but in mess 187 the output here is identical to a romdata made using the 187 mess.xml */
  const isItMess = R.filter(obj => obj.mess, systemsWithGames)

  return isItMess
}
