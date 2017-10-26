'use strict'

const fs                = require('fs')
const mkdirp            = require('mkdirp')
const R                 = require('ramda')

module.exports = (mameEmu, romdataConfig, log, softlistParams, setRegionalEmu, softlist ) => {
  //don't make a dat or folder if all of the games for a softlist aren't supported
  if (!softlist.length) { 
    if (log.exclusions) console.log(`INFO: Not printing softlist for ${softlistParams.name} : no working games`)
    return softlist
  }
  if (log.printer) console.log(`INFO: printing softlist for ${softlistParams.name}`)
  const romdataHeader = `ROM DataFile Version : 1.1`
  const path = `./qp.exe` //we don't need a path for softlist romdatas, they don't use it, we just need to point to a valid file
  const mameRomdataLine = ({name, MAMEName, parentName, path, emu, company, year, comment}) => ( 
      `${name}¬${MAMEName}¬${parentName}¬¬${path}¬MAME ${emu}`
    + `¬${company}¬${year}¬¬¬¬¬${comment}¬0¬1¬<IPS>¬</IPS>¬¬¬`
  )

  const retroarchRomdataLine = ({name, MAMEName, parentName, path, emu, company, year, comment}) => ( 
      `${name}¬${MAMEName}¬${parentName}¬¬${path}¬Retroarch ${emu} (MAME)`
    + `¬${company}¬${year}¬¬¬¬¬${comment}¬0¬1¬<IPS>¬</IPS>¬¬¬` 
  )
  /*  1)  Display name, 2) _MAMEName, 3) _ParentName, 4) _ZipName, //Used Internally to store which file inside a zip file is the ROM
   *  5) _rom path //the path to the rom, 6) _emulator,7) _Company, 8) _Year, 9) _GameType, 10) _MultiPlayer, 11)  _Language
   * 12)  _Parameters : String, 13)  _Comment, 14)  _ParamMode : TROMParametersMode; //type of parameter mode
   * 15)  _Rating, 16)  _NumPlay, 17)  IPS start, 18)  IPS end, 19)  _DefaultGoodMerge : String; //The user selected default GoodMerge ROM */

  //for a system, takes the simple and homomorphic arrays of feature, info and sharedFeat and turns them into an array of comments to be printed
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
 
  //sets the variables for a line of romdata entry for later injection into a romdata printer
  const applyRomdata = (obj, mameEmu)  => R.map( obj => {

    const emuWithRegionSet = setRegionalEmu(log, obj.name, softlistParams.thisEmulator.emulatorName, softlistParams.thisEmulator.regions)

    const romParams = {
        name        : obj.name.replace(/[^\x00-\x7F]/g, "") //remove japanese
      , MAMEName    : obj.call
      , parentName  : obj.cloneof?  obj.cloneof : ``
      , path
      , emu         : emuWithRegionSet //we can't just use the default emu as many system's games are region locked. Hence all the regional code!
      , company     : obj.company.replace(/[^\x00-\x7F]/g, "")
      , year        : obj.year
      , comment     : createComment({ //need to loop through all three of feaures, info and shared feat to make comments, see the DTD    
          feature   : obj.feature
        , info      : obj.info
        , sharedFeat: obj.sharedFeat
      })
      
    }
    return mameEmu.isItRetroArch? retroarchRomdataLine(romParams) : mameRomdataLine(romParams)
  }, softlist)

  const romdata        = applyRomdata(softlist, mameEmu)
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
Directory=${romdataConfig.winIconDir}

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
  const icon = (mameEmu === `retroarch`? `RetroArch` : `Mess`)
  fs.writeFileSync(`${softlistParams.outRootDir}/folders.ini`,  iconTemplate(icon)) //last wins is fine
  //now print the romdata itself
  fs.writeFileSync(softlistParams.outFullPath, romdataToPrint.join(`\n`), `latin1`) //utf8 isn't possible at this time
 
  return softlist

}
