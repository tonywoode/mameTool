'use strict'

const {readFileSync, createReadStream} = require('fs')

//these paths vary
const ini                 = require('ini')
const qpIni               = `dats\\settings.ini`
const qpSettings          = ini.parse(readFileSync(qpIni, 'utf-8'))


//TODO: this text is idential to src/devPaths
console.log(qpSettings.MAME)
console.log('\n')
exports.mameXMLInPath     = qpSettings.MAME.MameXMLPath || _throw(`there's no MAME XML`); console.log(`mame xml path set to ${exports.mameXMLInPath}`)  
exports.mameXMLStream     = createReadStream(exports.mameXMLInPath)
exports.mfmTextFileInPath = qpSettings.MAME.MameFileManagerFilePath || _throw(`there's no MFM File`); console.log(`mame file manager path set to ${exports.mfmTextFileInPath}`)  
exports.mfmTextFileStream = createReadStream(exports.mfmTextFileInPath)
exports.mameExtrasPath    = qpSettings.MAME.MameExtrasPath;          console.log(`mame extras path set to ${exports.mameExtrasPath}`)
exports.winIconDir        = `${exports.mameExtrasPath}\\Icons`;      console.log(`mame icons path set to ${exports.winIconDir}`) 
exports.mameExe           = qpSettings.MAME.MametoolMameExePath;     console.log(`mame exe set to ${exports.mameExe}` )
  
//this path varies
exports.iniDir            = `${exports.mameExtrasPath}\\folders`;    console.log(`mame extras inidir path set to ${exports.iniDir}`) 

//and now all the tickboxes
exports.tickBios             = qpSettings.MAME.MameOptBios
exports.tickCasino           = qpSettings.MAME.MameOptCasino
exports.tickClones           = qpSettings.MAME.MameOptClones
exports.tickMature           = qpSettings.MAME.MameOptMature
exports.tickMechanical       = qpSettings.MAME.MameOptMechanical
exports.tickMess             = qpSettings.MAME.MameOptMess
exports.tickPreliminary      = qpSettings.MAME.MameOptPreliminary
exports.tickPrintClub        = qpSettings.MAME.MameOptPrintClub
exports.tickSimulator        = qpSettings.MAME.MameOptSimulator
exports.tickTableTop         = qpSettings.MAME.MameOptTableTop
exports.tickQuiz             = qpSettings.MAME.MameOptQuiz
exports.tickUtilities        = qpSettings.MAME.MameOptUtilities
exports.tickSplitCompany     = qpSettings.MAME.MameOptCompany
//and the tickbox splits
exports.tickSplitGenre       = qpSettings.MAME.MameOptGenre
exports.tickSplitNPlayers    = qpSettings.MAME.MameOptNPlayers
exports.tickSplitRating      = qpSettings.MAME.MameOptRating
exports.tickSplitSeries      = qpSettings.MAME.MameOptSeries
exports.tickSplitVersion     = qpSettings.MAME.MameOptVersion
exports.tickSplitYear        = qpSettings.MAME.MameOptYear
