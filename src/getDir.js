'use strict'

const iniDir     = `/Volumes/GAMES/MAME/EXTRAs/folders`
const winIconDir = `F:\\Mame\\Extras\\Icons`
const outputDir      = `./outputs`

const getIniDir      = () => iniDir
const getWinIconDir  = () => winIconDir
const getOutputDir   = () => outputDir

module.exports  = {getIniDir, getWinIconDir, getOutputDir}
