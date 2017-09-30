'use strict'

const R                                  = require('ramda')
const {getUniqueProps, makeFilteredJson} = require('./filterMameJson.js')
const {generateRomdata}                  = require('./printers.js')

// let's make folder split by e.g.: genre, set type will be the folder name eg: 'full', 'mature'
const processSplit = (jsonKey, outputDir, emuType, winIconDir, json) => {
  const valuesArray = getUniqueProps(jsonKey)(json)
  //now for each genre we need to make a folder with a romdata in it
  R.map( value => {
    const splitFilter = [ { name: value, type: `keep`, path: [jsonKey], value } ]   
    const thisSplitJson = makeFilteredJson(splitFilter)(json)
    //make a folder per genre
    const thisFolderName = `${outputDir}/${jsonKey}/${value
      .replace(/[\\\.\:\*"<>\|]+/g, ``) //there's a lot of stuff windows won't allow in a filename...
      .replace(/\?/g, `x`) //if we were to replace with nothing, only 1 game was made in 1990
      .replace(/ \/ /, "/") //use the slash to make subfolders, but the spaces around the slash cause "SNK" and "SNK "
    }`
    generateRomdata(emuType, thisFolderName, winIconDir)(thisSplitJson)
  
  }, valuesArray)
 
  return json
}
  
 /*this is just like the reduce that appliess filters, but its not a reduce because we no longer wish to reduce on the json, 
  * we use the same (filtered) json for each filter */

// a function that is used on an individual split by the below map
const applySplit = (tick, outputDir, emu, winIconDir, mameJson) => 
  tick.value? processSplit(tick.name, outputDir, emu, winIconDir, mameJson):``
//map all splits the user selected over the same json
const applySplits = (splitObject, outputDir, emu, winIconDir, mameJson) => 
  R.map( tick => applySplit(tick, outputDir, emu, winIconDir, mameJson), splitObject )
  
module.exports = {processSplit, applySplit, applySplits}
