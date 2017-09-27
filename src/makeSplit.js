'use strict'

const R                = require('ramda')
const {getUniqueProps, makeFilteredJson} = require('./filterMameJson.js')
const {generateRomdata} = require('./printers.js')

// let's make folder split by e.g.: genre, set type will be the folder name eg: 'full', 'mature'
module.exports = ( jsonKey,  outputDir, emuType, winIconDir, json) => {
  const valuesArray = getUniqueProps(jsonKey)(json)
  //now for each genre we need to make a folder with a romdata in it
  R.map( value => {
    const splitFilter = [ { name: value, type: `keep`, path: [jsonKey], value } ]   
    const thisSplitJson = makeFilteredJson(splitFilter)(json)
    //make a folder per genre (but windows interprets the . in Misc. oddly) 
    const thisFolderName = `${outputDir}/${jsonKey}/${value.replace(`.`, ``)}`
    generateRomdata(emuType, thisFolderName, winIconDir)(thisSplitJson)
  
  }, valuesArray)
 
  return json
}
