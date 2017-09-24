'use strict'

const {readFileSync, createReadStream}  = require(`fs`)

const program                           = require('commander');
const ini                               = require('ini')

const {makeEmu}                         = require(`./types.js`)
const qpIni                             = `./inputs/settings.ini`
const qpSettings                        = ini.parse(readFileSync(qpIni, 'utf-8'))

program
    .option('--output-dir [path]')
    .option(`--mfm`)
    .parse(process.argv)

exports.mfm               = program.mfm;
console.log(qpSettings.MAME)
console.log('\n')
exports.mameXMLInPath     = qpSettings.MAME.MameXMLPath || _throw(`you said make an MFM-filtered MAME romset, but there's no MAME XML`)
exports.mameXMLStream     = createReadStream(exports.mameXMLInPath)
exports.mfmTextFileInPath = qpSettings.MAME.MameFileManagerFilePath; console.log(`mame file manager path set to ${exports.mfmTextFileInPath}`)  
exports.mfmTextFileStream = createReadStream(exports.mfmTextFileInPath)
exports.outputDir         = program.outputDir;                       console.log(`outputting to ${exports.outputDir}` )
exports.mameExtrasPath    = qpSettings.MAME.MameExtrasPath;          console.log(`mame extras path set to ${exports.mameExtrasPath}`)
exports.winIconDir        = `${exports.mameExtrasPath}\\Icons}`;             console.log(`mame icons path set to ${exports.winIconDir}`) 

exports.mameExe           = qpSettings.MAME.MametoolMameExePath;      console.log(`mame exe set to ${exports.mameExe}` )
exports.emu               = makeEmu(exports.mameExe, exports.outputDir);              console.log(`so emu is ${exports.emu.toString()}`)
  
