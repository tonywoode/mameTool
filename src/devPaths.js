'use strict'

const {createReadStream}       = require(`fs`)

exports.mameXMLInPath      = `./inputs/mame187.xml`
exports.mameXMLStream      = createReadStream(exports.mameXMLInPath)
exports.mfmTextFileInPath  = `./inputs/sampleMFMfilter.txt`
exports.mfmTextFileStream  = createReadStream(exports.mfmTextFileInPath)

exports.winIconDir         = require(`./getDir.js`).getWinIconDir()

