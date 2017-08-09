'use strict'

const  R  = require(`ramda`)

const makeRomdata = mameEmu => systems => {
  const romdataHeader = `ROM DataFile Version : 1.1`
  const path = `./qp.exe` //we don't need a path for softlist romdatas, they don't use it, we just need to point to a valid file
  const mameRomdataLine = ({name, MAMEName, parentName, path, emu, company, year, gameType, rating, language, comment, players}) => ( 
      `${name}¬${MAMEName}¬${parentName}¬¬${path}¬${emu}`
    + `¬${company}¬${year}¬${gameType}¬${rating}¬${language}¬¬${comment}¬0¬1¬<IPS>¬</IPS>¬${players}¬¬`
  )

/*  1) name, 2) MAMEName, 3) parentName, 4) zipName (which file inside a zip file is the ROM), 
 *  5) path, 6) emu, 7) company, 8) year, 9) gameType, 10) rating, 11) language,
 *  12) parameters, 13) comment, 14) # times played, 15) paramMode (number), 16) '<IPS>' (IPSName,IPSPath,IsDefault), 17) '</IPS>',
 *  18) # players, 19) defaultGoodMerge (The user selected default GoodMerge ROM). (there should ALWAYS be an extra ¬ at the end of the string) */

 //sets the variables for a line of romdata entry for later injection into a romdata printer
  const applyRomdata = systems  => R.map( obj => {

    const romParams = {
        name        : obj.system.replace(/[^\x00-\x7F]/g, "") //in case of japanese
      , MAMEName    : obj.call
      , parentName  : obj.cloneof || ``
      , path
      , emu         : `${mameEmu} Win32` //we can't just use the default emu as many system's games are region locked. Hence all the regional code!
      , company     : obj.company.replace(/[^\x00-\x7F]/g, "")
      , year        : obj.year
      , gameType    : obj.category
      , players     : obj.players
      , language    : obj.language || ``
      , rating      : obj.rating || ``
      , comment     : obj.status
    }

    return mameRomdataLine(romParams)
  }, systems)

  const mameRomdata             = applyRomdata(systems,  `mame`)
  const mameRomdataToPrint      = R.prepend(romdataHeader, mameRomdata) 

  return mameRomdataToPrint

}


module.exports = makeRomdata
