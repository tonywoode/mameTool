'use strict'

const fs     = require('fs')
const R      = require('ramda')
const mkdirp = require('mkdirp')

/* This printer is actually closer to an arcade romdata printer, but we decided to print embedded with softlists
 *  one key difference is it has to call the mame/retroarch main executable, rather than the verious mess emulator 
 *  sub-calls that all the softlist romdatas do */

module.exports = (settings, outputDir) => systems => {
  const romdataHeader = `ROM DataFile Version : 1.1`
  const path = `./qp.exe` 
  const mameRomdataLine = ({name, MAMEName, parentName, path, company, year, comment}) =>
    ( `${name}¬${MAMEName}¬${parentName}¬¬${path}¬${settings.mameExe}¬${company}¬${year}¬¬¬¬¬${comment}¬0¬1¬<IPS>¬</IPS>¬¬¬` )

  /* this is the correct invocation for retroarch but it doesn't work, even with softlist automedia off and bios enable on
   * retroarch_debug shows it even finds the game, but then decides: 'Error: unknown option: sfach'. I've left it in in case
   * it might be related to a mismatch in MAME versions between my fileset and retroarch */
  const retroarchRomdataLine = ({name, MAMEName, parentName, path, company, year, comment}) => (
      `${name}¬${MAMEName}¬${parentName}¬¬${path}¬${settings.mameExe}¬${company}¬${year}`
    + `¬¬¬¬-L cores\\mame_libretro.dll " ${MAMEName.replace(/"/g, '\\"')}"¬${comment}`
    + `¬0¬1¬<IPS>¬</IPS>¬¬¬`
  )
  /*  1)  Display name, 2) _MAMEName, 3) _ParentName, 4) _ZipName, //Used Internally to store which file inside a zip file is the ROM
   *  5) _rom path //the path to the rom, 6) _emulator,7) _Company, 8) _Year, 9) _GameType, 10) _MultiPlayer, 11)  _Language
   * 12)  _Parameters : String, 13)  _Comment, 14)  _ParamMode : TROMParametersMode; //type of parameter mode
   * 15)  _Rating, 16)  _NumPlay, 17)  IPS start, 18)  IPS end, 19)  _DefaultGoodMerge : String; //The user selected default GoodMerge ROM */

  const applyRomdata = settings => R.map( obj => {

        const romParams = {
        name       : obj.company? `${obj.company} ${obj.system}`: `${obj.system}`
      , MAMEName   : obj.call
      , parentName : obj.cloneof?  obj.cloneof : ``
      , path
      , company    : obj.company
      , year       : `unknown`
      , comment    : obj.cloneof? `clone of ${obj.cloneof}` : `` 
    }

    return settings.isItRetroArch? retroarchRomdataLine(romParams) : mameRomdataLine(romParams)

  }, systems)

  //TODO: why doesn't retroarch work?
  const romdata         = applyRomdata(settings)
  const romdataToPrint  = R.prepend(romdataHeader, romdata) 
  //TODO: both softlists printer and this printr should be passed the same path
  const softRoot        = settings.isItRetroArch? `${outputDir}/retroarch_softlists/`: `${outputDir}/mame_softlists/`
  const out             = `${softRoot}/MESS Embedded Systems/`
  mkdirp.sync(out)

  const iconTemplate = `[GoodMerge]
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
CmbIcon=mess.ico
`

  fs.writeFileSync(`${out}folders.ini`, iconTemplate)
  fs.writeFileSync(`${out}romdata.dat`, romdataToPrint.join(`\n`), `latin1`) //utf8 isn't possible at this time
  
  return systems

}
