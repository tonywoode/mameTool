'use strict'

const R = require('ramda')


const {softlistsWithNoGames} = require('../messFilters.json')

//read the json for softlists and make a list of those xmls to find. Need to grab emu name also and pass it all the way down our pipeline
module.exports = log => systems => {
  const isSoftlist = obj => !!obj.softlist //filter by softlist

   const isThisSoftlistBoring = (list, machine) => {
    if (softlistsWithNoGames.includes(list.name)) { 
      if (log.exclusions) console.log(`INFO: Removing  ${list.name} from ${machine} because there are no games in the list`) 
      return softlistsWithNoGames.includes(list.name)
    }   
    return false
  }
 
  //take out of the softlist key, those softlists in the exclusion list above
  const removeNonGames = obj => R.assoc(`softlist`, 
    R.reject(
      softlist => isThisSoftlistBoring(softlist, obj.displayMachine)
    , obj.softlist)
  , obj)


  //make a softlist subset of json, just those values we need. We'll add to it then
  const filtered = R.pipe(
      R.filter(isSoftlist)
    , R.map(removeNonGames)
    , R.map(obj => ({
        displayMachine: obj.displayMachine
      , systemType    : obj.systemType
      , softlist      : obj.softlist
      , device        : obj.device
      , call          : obj.call
      , cloneof       : obj.cloneof
    }) )
  )(systems) 

 
  //all we need from the device subobject is the shortnames
  const replaceDevice = R.map(
    obj => R.assoc(`device`, R.map(
      obj => obj.briefname, obj.device) 
    , obj)
  , filtered)

  //convert that structure into one keyed by softlist (atm the machine is the organisational unit)
  const softlistKeyed = R.map(
    obj => R.map(
      softlist => ({
         emulatorName  : softlist.emulatorName
       , displayMachine: obj.displayMachine
       , systemType    : obj.systemType
       , name          : softlist.name
       , status        : softlist.status
       , filter        : softlist.filter
       , device        : obj.device
       , call          : obj.call
       , cloneof       : obj.cloneof

      })
    , obj.softlist)
  , replaceDevice)

  //problem: softlist params are still array-ed to each machine: flatten the lot (rely on 'displayMachine' to link)
  const flattenedSoftlistEmus = R.unnest(softlistKeyed)
  
  return flattenedSoftlistEmus
}


