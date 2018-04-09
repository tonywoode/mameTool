'use strict'

const R                    = require('ramda')
//const {needsARomToLoad} = require('../../messFilters.json')

/* we want a single set of data to work on an overloaded function that can replace both softlist emulators but also individual device emulators.
 * if we pass a softlist name, use that as the lookup, if we pass emulatorName, use that and device as the lookup: problem with using the softlist name is what happens when the to8 runs the to7 cassette list?
 * oh god look you need to be able to go through to8 and say what to do if a to8 is loading a to7 cassette softlist, right, which is 
 * different to what the to7 will do with a cassette softlist. essentially the loader insert has nothing to do with the softlist and everything
 * to do with the machine its running on and the device being loaded. so in fact isn't the softlist name redundant in our json here in that case?
 * the only reason i'm using the softlist is that the device is coded into it, but i MUST be working out the device some other way, since i manage to
 * attribute the right device to every softlist, isn't it in the mess.json itself already?

 * so it has to be a xor: if the call and the softlist match, add the loader code to the softlist emu. then separately, if the call and the device match, add that to the device's emulator. so what you musn't do is add the calll to any emulator that happens to use a softlist
 * another option would be to add the call to the softlist only where the type is 'original' ie not 'compatible' 

and actually its a good idea to do all the 'original' systems - the snes cart calls need to apply to the systems 'snes' AND 'snes_pal' */

 
  
/* the k-v's are not obvious here:  we need something + a media device, but is that something the particular machine call, 
 * or is it the system type? Take thomson to-series as an example, you need a basic loader rom for the to7, 
 * but not for the to8, yet both can load to7 floppies and cassettes on both. They are both part of the same system type
 * (Thomson TO-series) because of this, yet that means we can't use the system type for any matching here. We need to be granular

/* In the case of apfimag, we need to patch both the softlist cassette emulator and the cassette emulator. 
 * So we find the call and first ask if the softlist exists and add patch keys if so, 
  * then ask if the cassette device exists and do the same there. Later we'll ask if a patch exists at that key 
  * one problem is that nes and snes looksilly when you do this, there are a ton of systems you unncesessarily need
  * to add to the calls. You could always say: if the onkect doesn't have a 'calls', then add it to all systems that are original
  * */

// for a truly horrid corner case, thomson to8 lists the softlist to7_cart as an original system, but to7_cass as a compatible, luckily
// that suits our purposes */
//
//note i'm searching for a softlist key to do the softlist ones, and a device key to do the device ones, so neither checks 'calls'
//
//calls and device always need each other, and it may be that a system needs the same loader for both cass and floppy, so maybe the value of calls should be an object containing devices,
//but then you need to iterate over calls (not doing atm) - how am i going to do to7's cass and floppy which both need the basic cart?
//
//also its such a shame the softlist calls apply so generically to systems that 'have' the softlist. We could get a similar effect by using cloneof as well as call 
//ie: look for the system to8 or clones of to8 and then look for our device in all of those
const needsARomToLoad = [
  {   'calls'    : ['apfimag']
    , 'softlist' : 'apfimag_cass'
    , 'device'   : 'cass'
    , 'romcall'  : 'cart basic'
  }, 
  {   'softlist' : 'nes_ade'
    , 'romcall'  : 'cart ade'
  },
  {   'softlist' : 'nes_ntbrom'
    , 'romcall'  : 'cart ntb'
  },
  {   'softlist' : 'nes_kstudio'
    , 'romcall'  : 'cart karaoke'
  },
  {   'softlist' : 'nes_datach'
    , 'romcall'  : 'cart datach'
  },
  {   'softlist' : 'snes_bspack'
    , 'romcall'  : 'cart bsx'
  },
  {   'softlist' : 'snes_strom'
    , 'romcall'  : 'cart sufami'
  },
  {   'calls'    : ['orion128'] //clone search also finds, 'orionide', 'orionidm', 'orionms', 'orionpro', 'orionz80', 'orionzms']
    , 'softlist' : 'orion_cass'
    , 'device'   : 'cass'
    , 'romcall'  : 'cart ROMDISK'
  }, 
  {   'calls'    : ['sc3000', 'sg1000' ] //the sc-3000, sg-1000 and sf-7000 are hopefully all the same underlying system, so why do i add sg1000 here if its a cloneof sc3000? in order to get the sg1000m2, a clone of the sg1000, but a subtely is the sg1000 doesn't have a cass, so it won't iteself get the loader call
    , 'softlist' : 'sc3000_cass'
    , 'device'   : 'cass'
    , 'romcall'  : 'cart basic3e'
  },
  {   'calls'    : ['to7', 'to770', 'to9'] //i suspect the to770 will load cassettes with the same loader as the to7, but its not a cloneof for some reason (it says to7 softlists are original with it)
    , 'softlist' : 'to7_cass'
    , 'device'   : 'cass'
    , 'romcall'  : 'cart basic'
  },
  {   'test' : 'reducer should cope with me'
  }
]


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
const doesSystemHaveThisSoftlist = (obj, softlistToFind, log) => {
  log.loaderCallsVerbose && console.log(`looking for ${softlistToFind} in ${obj.call}`)
  if (obj.softlist) {return doSoftlistsContainSoftlist(softlistToFind, obj, log)}
}

/* pointfree takes systems list, searches for systems who have the (original) softlist we have loader rom info for, 
 * if found, inserts the call against the softlist so we can check for its existence later */
const fillSoftlistLoaderCalls = (romLoaderItem, log) => {
  log.loaderCalls && romLoaderItem['softlist'] && console.log(`LOADER CALLS: seeking matches for softlist ${romLoaderItem.softlist}`)
  return R.map( obj => {
  if (!(romLoaderItem['softlist'])) return obj //vs 'in' see: - https://stackoverflow.com/a/22074727/3536094
    const foundIndex = doesSystemHaveThisSoftlist(obj, romLoaderItem.softlist, log)
    return (foundIndex > -1)? ( 
        log.loaderCalls && console.log(`    ---> inserting a loading call for ${obj.call}'s original softlist ${romLoaderItem.softlist}`)
      , R.assocPath([`softlist`, foundIndex, `loaderCall`], romLoaderItem.romcall, obj)
    )
    : obj
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
  log.loaderCalls && romLoaderItem['device'] && console.log(`LOADER CALLS: seeking matches for ${romLoaderItem.device} of ${romLoaderItem.calls.toString()}`)
  return R.map( obj => {
    if (!(romLoaderItem['device'])) return obj //note only checking device not calls, should really check both
    const foundIndex = doesSystemHaveThisCall(obj, romLoaderItem.calls, romLoaderItem.device, log)
    return (foundIndex > -1)? ( 
        log.loaderCalls && console.log(`    ---> inserting a loading call for ${obj.call}'s ${romLoaderItem.device}`)
      , R.assocPath([`device`, foundIndex, `loaderCall`], romLoaderItem.romcall, obj)
    )
    : obj
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


//the below i originally put in to src/scan/datAndEfind/printEfind

 
//so both forms have a call, but softlistname has a softlistname and device has a device. so can we just do this by devicename ie: be entirely granular?
//if so we can write this overloaded function. I think maybe its a case of we have to rather than we can: think of thomson again eh?
//what we have to do is say is there a softlistname? if there isn't then we use the call ITSELF plus device to try and find a match, so the paths are very different. hmmm given that we have two differnt functions calling here can't we just have two functions doing the work here, the thing that needs to be common is the json replacement list. YES THATS RIGHT! OK!
const insertSoftlistLoaderCode = (softlistName, call) => {
 //return 
  R.map( system => console.log(emulatorName, softlistName, device, system.emulator, system.softlist, system.device, system.romCall), needsARomToLoad) 
 process.exit() 
  //softlistName in nes_snes_exceptions? `${call} -cart ${nes_snes_exceptions[softlistName]} -cart2` : call 
}
const insertDeviceLoaderCode = (call, device) => {
 //return 
  R.map( system => console.log(emulatorName, softlistName, device, system.emulator, system.softlist, system.device, system.romCall), needsARomToLoad) 
 process.exit() 
  //softlistName in nes_snes_exceptions? `${call} -cart ${nes_snes_exceptions[softlistName]} -cart2` : call 
}

