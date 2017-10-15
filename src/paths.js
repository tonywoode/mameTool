'use strict'

//paths is agnostic, it doesn't know about live or dev, that's for the caller

const {readFileSync, createReadStream, existsSync} = require('fs')
const ini      = require('ini')
const _throw   = m => { throw new Error(m) }

module.exports = (settingsIniPath, mameInisOverridePath ) => {

  const qpIni       = settingsIniPath
  existsSync(qpIni) || _throw(`the setttings file doesn't exist at ${path}`)
  const qpSettings  = ini.parse(readFileSync(qpIni, 'utf-8'))
  const s           = qpSettings.MAME
  //console.log(s) 
  console.log(`Settings file:          ${qpIni}`)  

  return { 
      mameXMLInPath     : s.MameXMLPath                               || _throw('theres no MAME XML')   
    , mameXMLStream     : createReadStream(s.MameXMLPath )            || _throw(`there's no MAME XML Stream`)
    , mfmTextFileInPath : s.MameFileManagerFilePath                   //TODO: need to catch a lack of this later (else we'll throw when generating the json
    , mameExtrasPath    : s.MameExtrasPath 
    , winIconDir        : `${s.MameExtrasPath}\\Icons`
    , mameExe           : s.MametoolMameExePath
    , iniDir            : mameInisOverridePath? mameInisOverridePath : `${s.MameExtrasPath}\\folders`
    , tickBios          : s.MameOptBios
    , tickCasino        : s.MameOptCasino
    , tickClones        : s.MameOptClones
    , tickMature        : s.MameOptMature
    , tickMechanical    : s.MameOptMechanical
    , tickMess          : s.MameOptMess
    , tickPreliminary   : s.MameOptPreliminary
    , tickPrintClub     : s.MameOptPrintClub
    , tickSimulator     : s.MameOptSimulator
    , tickTableTop      : s.MameOptTableTop
    , tickQuiz          : s.MameOptQuiz
    , tickUtilities     : s.MameOptUtilities
    , tickSplitCompany  : s.MameOptCompany
    , tickSplitGenre    : s.MameOptGenre
    , tickSplitNPlayers : s.MameOptNPlayers
    , tickSplitRating   : s.MameOptRating
    , tickSplitSeries   : s.MameOptSeries
    , tickSplitVersion  : s.MameOptVersion
    , tickSplitYear     : s.MameOptYear
  }

}
