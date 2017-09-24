'use strict'

const {readFileSync, createReadStream}       = require(`fs`)

exports.mameXMLInPath      = `./inputs/mame187.xml`
exports.mameXMLStream      = createReadStream(exports.mameXMLInPath)
exports.mfmTextFileInPath  = `./inputs/sampleMFMfilter.txt`
exports.mfmTextFileStream  = createReadStream(exports.mfmTextFileInPath)

exports.outputDir          = require(`./getDir.js`).getOutputDir()
exports.jsonOutName        = `mame.json`
exports.winIconDir         = require(`./getDir.js`).getWinIconDir()
const {Mame, RetroArch}    = require(`./types.js`)
exports.Mame               = Mame
exports.RetroArch          = RetroArch

