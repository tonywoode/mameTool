'use strict'

const  R  = require('ramda')

const makeRomdata = mameEmu => mameJson => {
  const romdataHeader = `ROM DataFile Version : 1.1`
  const path = `./qp.exe` //we don't need a path for mame roms, they don't use it, we just need to point to a valid file
  const mameRomdataLine = ({name, MAMEName, parentName, path, emu, company, year, gameType, rating, language, comment, players}) => ( 
      `${name}¬${MAMEName}¬${parentName}¬¬${path}¬${emu}`
    + `¬${company}¬${year}¬${gameType}¬${rating}¬${language}¬¬${comment}¬0¬1¬<IPS>¬</IPS>¬${players}¬¬`
  )

/*  1) name, 2) MAMEName, 3) parentName, 4) zipName (which file inside a zip file is the ROM), 
 *  5) path, 6) emu, 7) company, 8) year, 9) gameType, 10) rating, 11) language,
 *  12) parameters, 13) comment, 14) # times played, 15) paramMode (number), 16) '<IPS>' (IPSName,IPSPath,IsDefault), 17) '</IPS>',
 *  18) # players, 19) defaultGoodMerge (The user selected default GoodMerge ROM). (there should ALWAYS be an extra ¬ at the end of the string) */

 //sets the variables for a line of romdata entry for later injection into a romdata printer
  const applyRomdata = mameJson  => R.map( obj => {

    const romParams = {
        name        : obj.system.replace(/[^\x00-\x7F]/g, ``) //in case of japanese
      , MAMEName    : obj.call
      , parentName  : obj.cloneof || ``
      , path
      , emu         : `${mameEmu}` 
      , company     : obj.company.replace(/[^\x00-\x7F]/g, ``)
      , year        : obj.year
      , gameType    : obj.catlist|| obj.category|| obj.genre|| ``
      , players     : obj.nplayers
      , language    : obj.languages || ``
      , rating      : obj.bestgames || ``
      , comment     : obj.status
    }

    return mameRomdataLine(romParams)
  }, mameJson)

  const mameRomdata = applyRomdata(mameJson,  `mame`)
  const mameRomdataToPrint = R.prepend(romdataHeader, mameRomdata) 

  return mameRomdataToPrint

}


module.exports = makeRomdata
