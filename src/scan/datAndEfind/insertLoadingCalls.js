'use strict'

const R                 = require('ramda')
const {needsARomToLoad} = require('../../messConfig.json')

/* There are many systems that cannot load a game on some device (floppy/cassette) without bootstrapping code, 
 *   usually a basic cart or floppy, being inserted at the same time. Thanks to softlist names, we can automatically 
 *   provide this rom to the machine at the same time as loading from that media device, ie: we can call '-cart1 basic -flop1 %ROM%' 
 *   where 'basic' is the softlist name of loader media. We want to do this for both the softlist devices AND the normal emulators 
 *   (for they will not load the game without this rom anyway), so note it ties you to needing the softlist files for these 
 *   system's devices. 
 * We also need to remember to also patch any 'same gamename' conflict fixes with this same list 
 * (that's where a game exists on two seperate devices but mame wasn't good at representing this in softlists */

// we are going to need to know the index of the softlist, because each is an object and we need to attach the loader call key onto one of them
const doSoftlistsContainSoftlist = (softlistToFind, obj, log) => { 
    for (const [index, aSoftlist] of obj.softlist.entries()) { 
     log.loaderCallsVerbose && console.log(`  which has softlist ${aSoftlist.name}`)
      if (softlistToFind === aSoftlist.name && aSoftlist.status === `original`) return index
    }   
  }

/* as well as finding a match, we also need to make sure we have an ORIGINAL softlist not a COMPATIBLE one, 
 *   consider what would happen for Thomson TO8 with Thomson TO7's softlist, the TO8 doesn't need the basic cart, 
 *   and if it DID need a basic cart, it wouldn't need the same one as the TO7 */
const doesSystemHaveThisSoftlist = (obj, softlistToFind, exclusions, log) => {
  log.loaderCallsVerbose && console.log(`looking for ${softlistToFind} in ${obj.call}`)
  if  (exclusions && ( exclusions.includes(obj.call) || exclusions.includes(obj.cloneof) ) ) return -1
  if ( obj.softlist ) {return doSoftlistsContainSoftlist(softlistToFind, obj, log)}
}

/* pointfree takes systems list, searches for systems who have the (original) softlist we have loader rom info for, 
 * if found, inserts the call against the softlist so we can check for its existence later */
const fillSoftlistLoaderCalls = (romLoaderItem, log) => {
  log.loaderCalls && romLoaderItem['softlists'] && console.log(
    `LOADER CALLS: seeking matches for softlists ${romLoaderItem.softlists.toString()}`
  )
  return R.map( obj => {
  if (!(romLoaderItem['softlists'])) return obj //vs 'in' see: - https://stackoverflow.com/a/22074727/3536094
    let newObj = obj
    for (const softlist of romLoaderItem.softlists) {
    const foundIndex = doesSystemHaveThisSoftlist(obj, softlist, romLoaderItem.softlistExclusions, log)
    if (foundIndex > -1) ( 
        log.loaderCalls && console.log(`    ---> inserting a loading call for ${obj.call}'s original softlist ${softlist}`)
      , newObj = R.assocPath([`softlist`, foundIndex, `loaderCall`], `${obj.call} -${romLoaderItem.romcall}`, newObj)
    )
    }
    return newObj
  })
}

/* a subtely here is that the system's device briefname may or may not have a number at the end. There's never likely 
 *   to be much variety in briefnames so the simplest substring check is fine */
const getIndexOfTheDevice = (obj, deviceToFind, log) => {
  for (const [index, device] of obj.device.entries()) {
    if (device.briefname.includes(deviceToFind)) {
      log.loaderCallsVerbose && console.log(`  --> found a match and the index for ${deviceToFind} in ${obj.call} is ${index}`)
      return index
    }
  }
}

const doesSystemHaveThisCall = (obj, callsToFind, deviceToFind, log) => {
  log.loaderCallsVerbose && console.log(`looking for ${callsToFind} with ${deviceToFind} as part of ${obj.call} and its clones`)
  if ((callsToFind.includes(obj.call)) || (callsToFind.includes(obj.cloneof) ) ) return getIndexOfTheDevice(obj, deviceToFind, log)
}

//pointfree takes systems list
const fillDeviceLoadingCalls = (romLoaderItem, log) => {
  log.loaderCalls && romLoaderItem['devices'] && console.log(
    `LOADER CALLS: seeking matches for ${romLoaderItem.devices.toString()} of ${romLoaderItem.calls.toString()}`
  )
  return R.map( obj => {
    if (!(romLoaderItem['devices'])) return obj //note only checking device not calls, should really check both
    let newObj = obj
    for (const device of romLoaderItem.devices) {
    const foundIndex = doesSystemHaveThisCall(obj, romLoaderItem.calls, device, log)
    if (foundIndex > -1) ( 
        log.loaderCalls && console.log(`    ---> inserting a loading call for ${obj.call}'s ${device}`)
      , newObj = R.assocPath([`device`, foundIndex, `loaderCall`], `${obj.call} -${romLoaderItem.romcall}`, newObj)
    )
    }
    return newObj
  })
}

module.exports = log => systems => {
  //populate the systems list with the calls to rom loading media that some softlists always need
  const insertedSoftlistLoadingCalls = needsARomToLoad.reduce( 
    (systemsAccum, romLoaderItem) => fillSoftlistLoaderCalls(romLoaderItem, log)(systemsAccum)
  , systems)

  /* we can use those softlist romnames to also auto-insert the loading media for non-softlist emulators
   *   the principle is much the same, but we have to be much more granular with the systems we apply it to
   *   (because we can't use system type for the call as they are too general) */
  const insertedDeviceLoadingCalls = needsARomToLoad.reduce(
    (systemsAccum, romLoaderItem) => fillDeviceLoadingCalls(romLoaderItem, log)(systemsAccum)
  , insertedSoftlistLoadingCalls)

  return insertedDeviceLoadingCalls
}

