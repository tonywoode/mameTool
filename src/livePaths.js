'use strict'

const {readFileSync, createReadStream}  = require(`fs`)

const ini                               = require('ini')
const qpIni                             = `./inputs/settings.ini`
const qpSettings                        = ini.parse(readFileSync(qpIni, 'utf-8'))

console.log(qpSettings.MAME)
console.log('\n')
exports.mameXMLInPath     = qpSettings.MAME.MameXMLPath || _throw(`you said make an MFM-filtered MAME romset, but there's no MAME XML`)
exports.mameXMLStream     = createReadStream(exports.mameXMLInPath)
exports.mfmTextFileInPath = qpSettings.MAME.MameFileManagerFilePath; console.log(`mame file manager path set to ${exports.mfmTextFileInPath}`)  
exports.mfmTextFileStream = createReadStream(exports.mfmTextFileInPath)
exports.mameExtrasPath    = qpSettings.MAME.MameExtrasPath;          console.log(`mame extras path set to ${exports.mameExtrasPath}`)
exports.winIconDir        = `${exports.mameExtrasPath}\\Icons}`;             console.log(`mame icons path set to ${exports.winIconDir}`) 
exports.mameExe           = qpSettings.MAME.MametoolMameExePath;      console.log(`mame exe set to ${exports.mameExe}` )
  
