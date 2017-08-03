"use strict"

const  R  = require(`ramda`)

function makeRomdata(systems, mameEmu){
  const romdataHeader = `ROM DataFile Version : 1.1`
  const path = `./qp.exe` //we don't need a path for softlist romdatas, they don't use it, we just need to point to a valid file
  const mameRomdataLine = ({name, MAMEName, parentName, path, emu, company, year, comment}) => ( 
      `${name}¬${MAMEName}¬${parentName}¬¬${path}¬${emu}`
    + `¬${company}¬${year}¬¬¬¬¬${comment}¬0¬1¬<IPS>¬</IPS>¬¬¬`
  )
  /*  1)  Display name, 2) _MAMEName, 3) _ParentName, 4) _ZipName, //Used Internally to store which file inside a zip file is the ROM
   *  5) _rom path //the path to the rom, 6) _emulator,7) _Company, 8) _Year, 9) _GameType, 10) _MultiPlayer, 11)  _Language
   * 12)  _Parameters : String, 13)  _Comment, 14)  _ParamMode : TROMParametersMode; //type of parameter mode
   * 15)  _Rating, 16)  _NumPlay, 17)  IPS start, 18)  IPS end, 19)  _DefaultGoodMerge : String; //The user selected default GoodMerge ROM */

 //sets the variables for a line of romdata entry for later injection into a romdata printer
  const applyRomdata = systems  => R.map( obj => {

    const romParams = {
        name        : obj.system.replace(/[^\x00-\x7F]/g, "") //in case of japanese
      , MAMEName    : obj.call
      , parentName  : obj.cloneof?  obj.cloneof : ``
      , path
      , emu         : `${mameEmu} Win32` //we can't just use the default emu as many system's games are region locked. Hence all the regional code!
      , company     : obj.company.replace(/[^\x00-\x7F]/g, "")
      , year        : obj.year
      , comment     : obj.status
    }

    return mameRomdataLine(romParams)
  }, systems)

  const mameRomdata             = applyRomdata(systems,  `mame`)
  const mameRomdataToPrint      = R.prepend(romdataHeader, mameRomdata) 

  return mameRomdataToPrint

}


module.exports = makeRomdata
