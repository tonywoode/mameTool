'use strict'

const fs                = require('fs')
const mkdirp            = require('mkdirp')
const R                 = require('ramda')

module.exports = (settings, softlistParams, setRegionalEmu, softlist, log) => {
  //don't make a dat or folder if all of the games for a softlist aren't supported
  if (!softlist.length) { 
    if (log.exclusions) console.log(`INFO: Not printing softlist for ${softlistParams.name} : no working games`)
    return softlist
  }
  if (log.printer) console.log(`INFO: printing softlist for ${softlistParams.name}`)
  const romdataHeader = `ROM DataFile Version : 1.1`
  const path = `./qp.exe` //we don't need a path for softlist romdatas, they don't use it, we just need to point to a valid file
  const romdataLine = ({name, MAMEName, parentName, path, emu, company, year, parameters, comment}, isItRetroArch) => { 
    const callToEmu = isItRetroArch?  `Retroarch ${emu} (MAME)` : `MAME ${emu}` 
    const possiblyRetroArchParameters = (parameters && isItRetroArch)?  `-L cores\\mame_libretro.dll " ${parameters}"` : parameters
    return  `${name}¬${MAMEName}¬${parentName}¬¬${path}¬${callToEmu}`
    + `¬${company}¬${year}¬¬¬¬${possiblyRetroArchParameters}¬${comment}¬0¬1¬<IPS>¬</IPS>¬¬¬` 
  }


  /*  1)  Display name, 2) _MAMEName, 3) _ParentName, 4) _ZipName, //Used Internally to store which file inside a zip file is the ROM
   *  5) _rom path //the path to the rom, 6) _emulator,7) _Company, 8) _Year, 9) _GameType, 10) )  _Rating 11)  _Language
   * 12)  _Parameters : String, 13)  _Comment, 14)_NumPlay 15) _ParamMode : TROMParametersMode,  16)  IPS start, 17)  IPS end, 
   * 18) _MultiPlayer 19)_DefaultGoodMerge : String; //The user selected default GoodMerge ROM */

  //for a system, takes the simple and homomorphic arrays: part/feature, info and sharedFeat 
  //  (ie: they all have keys named the smae) and turns them into an array of comments to be printed
  const createComment = commentCandidates => {
    const comments = []  
    R.map(commentCandidate => {
      if (commentCandidate) { 
        R.map( item => {
          const nonJapItem = item.value.replace(/[^\x00-\x7F]/g, "")
          comments.push(`${item.name}:${nonJapItem}`)  
        }, commentCandidate) 
      }
    }, commentCandidates)
      
    return comments
  }

  //MESS didn't enforce that its mamenames for games were unique in the right scope: different devices of the same 
  //  machine may have identical gamenames. However, it gets worse: we  can't just ALWAYS disambiguate by calling the
  //  device ("famicom -flop1 smb2), because MESS also performs multi-disc loading with just a mamename (so calling 
  //  "-flop1" will break it). So check whether there is an original (not a compatible softlist) gamename conflict and only apply a flag if there is 
  var originalOtherSoftlists = []
  //to start with we don't want to do any work if there are no other softlists
  if (softlistParams.thisEmulator.otherSoftlists.length) { 
    if (log.otherGameNames) {
      console.log(`   ----> ${softlistParams.thisEmulator.name} other softlists: ${R.keys(softlistParams.otherGameNames)}`)
    }
    //next remove the 'compatible' ones (TODO: test the effect of this)
    const isOriginal = softlist => softlist.status === `original`
    originalOtherSoftlists = R.pluck('name', R.filter(isOriginal, softlistParams.thisEmulator.otherSoftlists))
    if (log.otherGameNames) {
      originalOtherSoftlists.length?  
        console.log(`        ----> ${softlistParams.thisEmulator.name}: Original softlists ${originalOtherSoftlists}`) 
       : 
        console.log(`      ----> ${softlistParams.thisEmulator.name}: No Original Softlists`)
    }
  }
  //next the function. so we need to say: for each of the softlists in originalOtherSoftlists, find that as a key in the softlist names, and see if it has our gamename
  
  //this tests for equality
  const match = (otherGameName, ourGameName) => otherGameName === ourGameName
  //this will see if a gamename exists in a list of gamenames
  const checkMameNameInNameList = (ourGameName, gameNames, otherSoftlistBeingChecked) => {
    const result = R.any(otherGameName => match(otherGameName, ourGameName))(gameNames)
    if ( result && log.otherGameConflicts ) {
      console.log(   ` **** SOFTLIST NAME CONFLICT: ${ourGameName} in ${softlistParams.thisEmulator.name} conflicts with ${otherSoftlistBeingChecked}`)
    }
    return result
  }
  //and this will check each original softlist in turn
  const checkOriginalSoflistNames = ourGameName => {
    const result = R.map(otherSoftlistBeingChecked => 
      checkMameNameInNameList(ourGameName, softlistParams.otherGameNames[otherSoftlistBeingChecked], otherSoftlistBeingChecked), originalOtherSoftlists)
    //result will now be an array (because each other softlist has been compared to one game name from this softlist). if any of the items is true, we return true
    return result.includes(true)
  }

  //in order to print a feature comment, we need to loop through the part array
  const makeFeature = partKey => {
    const featureComment = createComment(R.map( part => part.feature, partKey)).toString()
    //add a space separator only if we got something TODO: should only add space if createComment returned something, else we're starting the whole comment with space
    return featureComment.length? ` ${featureComment}` : ``
  }

  //sets the variables for a line of romdata entry for later injection into a romdata printer
  const applyRomdata = (obj, settings)  => R.map( obj => {

    //console.log(obj.part[0].interface)
    //console.log(obj.part[0].name)
    //it would be tempting to think that the postfix of the first part's device name in a softlist entry
    //  is the same as how the emulator would call it, but flop1 in the softlist part name means its the first
    //  disk in the box, not that it loads in its repsective emulators by using device -'flop1'
    const theLastChar = str => str.slice(-1)
    const isTheLastCharAOne = str => theLastChar(str) === `1`
    const isTheLastCharAZero = str => theLastChar(str) === `0`
    const postfixLastDigitIfNecessary = str => { 
      return  isTheLastCharAOne(str)? str 
        : isTheLastCharAZero(str)? `${str.slice(0, -1)}1`
          : `${str}1`
    }
    const addHypen = str => `-${str}`
    const partNameToDeviceCall = str => addHypen(postfixLastDigitIfNecessary(str))

    const emuWithRegionSet = setRegionalEmu(log, obj.name, softlistParams.thisEmulator, softlistParams.thisEmulator.regions)

    const doWeNeedToSpecifyDevice = originalOtherSoftlists.length? checkOriginalSoflistNames(obj.call) : false
    if (doWeNeedToSpecifyDevice && log.otherGameConflicts) console.log(`   ---> disambiguate by printing device ${partNameToDeviceCall(obj.part[0].name)}`)

  // TODO: same code as in src/scan/datAndEfind/printEfind
   const exceptions = {
        nes_ade : "ade"
      , nes_ntbrom : "ntb"
      , nes_kstudio : "karaoke"
      , nes_datach: "datach"
      , snes_bspack: "bsx"
      , snes_strom: "sufami"
      , snes_vkun: "tbc - not found"
    }


    // If a gamename clashes with another game on a softlist for this system, we'll replace the entire call made 
    //   to the efinder soflist emulator, with what we'll prepare here, so we can specify device. This is complicated
    //   by soflists like `nes_ade` which need a customised call we'll ahve to repeat
    const makeParameters = (systemCall) => {
      return softlistParams.name in exceptions? 
          `${systemCall} -cart ${exceptions[softlistParams.name]} -cart2 %ROMMAME%` 
        : `${systemCall} ${partNameToDeviceCall(obj.part[0].name)} %ROMMAME%`  
    }

    const romParams = {
        name        : obj.name.replace(/[^\x00-\x7F]/g, "") //remove japanese
      , MAMEName    : obj.call
      , parentName  : obj.cloneof?  obj.cloneof : ``
      , path
      , emu         : emuWithRegionSet.emulatorName //we can't just use the default emu as many system's games are region locked. Hence all the regional code!
      , company     : obj.company.replace(/[^\x00-\x7F]/g, "")
      , year        : obj.year
      , parameters  : doWeNeedToSpecifyDevice? makeParameters(emuWithRegionSet.call) : ``
      , comment     : `${createComment({ //need to loop through info and shared feat to make comments, see the DTD, but also combine part/features to print    
          info      : obj.info
        , sharedFeat: obj.sharedFeat
      }) }${makeFeature(obj[`part`])}` 
      
    }
    return romdataLine(romParams, settings.isItRetroArch)
  }, softlist)

  const romdata        = applyRomdata(softlist, settings)
  const romdataToPrint = R.prepend(romdataHeader, romdata) 
  mkdirp.sync(softlistParams.outNamePath)
  
  /* I already did work to enable MAME icons in QuickPlay, so just print this folder config with each dat
   *   there are 2 systems which don't have icons in the set i want, so just write an icon file for everything */
  const iconTemplate = iconName => `[GoodMerge]
GoodMergeExclamationRoms=0
GoodMergeCompat=0
pref1=(U) 
pref2=(E) 
pref3=(J) 

[Mirror]
ChkMirror=0
TxtDir=
LstFilter=2A2E7A69700D0A2A2E7261720D0A2A2E6163650D0A2A2E377A0D0A

[RealIcon]
ChkRealIcons=1
ChkLargeIcons=0
Directory=${settings.winIconDir}

[BkGround]
ChkBk=0
TxtBKPath=

[Icon]
ChkIcon=1
CmbIcon=${iconName}.ico
`

  const machineMameName = softlistParams.thisEmulator.call

  fs.writeFileSync(`${softlistParams.outNamePath}/folders.ini`, iconTemplate(machineMameName))
  fs.writeFileSync(`${softlistParams.outTypePath}/folders.ini`, iconTemplate(machineMameName)) //last wins is fine
  const icon = (settings.isItRetroArch? `RetroArch` : `Mess`)
  fs.writeFileSync(`${softlistParams.outRootDir}/folders.ini`,  iconTemplate(icon)) //last wins is fine
  //now print the romdata itself
  fs.writeFileSync(softlistParams.outFullPath, romdataToPrint.join(`\n`), `latin1`) //utf8 isn't possible at this time
 
  return softlist

}
