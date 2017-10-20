'use strict'

let   fs                          = require('fs') //rewired in test, don't try and const or destructure
let   mkdirp                      = require('mkdirp') //ditto
const path                        = require('path')
const _throw                      = m => { throw new Error(m) }

let   makeRomdata                 = require('./makeRomdata.js') //rewired in test

const printRomdata = (romdataOutDir, romdataOutName) => romdata => {
  const romdataOutPath = `${romdataOutDir}/${romdataOutName}`
  fs.writeFileSync(romdataOutPath, romdata.join(`\n`), `latin1`) //utf8 isn't possible at this time
  return romdata
}

const printIconFile = (romdataOutDir, mameExtrasDir, iconName) => {

  const iconTemplate = `[GoodMerge]
GoodMergeExclamationRoms=0
GoodMergeCompat=0
pref1=(U) 
pref2=(E) 
pref3=(J) 

[Mirror]
ChkMirror=0
TxtDir=
LstFilter=2A2E7A69700D0A2A2E7261720D0A2A2E6163650D0A2A2E377A0D0A

[RealIcon]
ChkRealIcons=1
ChkLargeIcons=0
Directory=${mameExtrasDir}

[BkGround]
ChkBk=0
TxtBKPath=

[Icon]
ChkIcon=1
CmbIcon=${iconName}.ico
`

  fs.writeFileSync(`${romdataOutDir}/folders.ini`, iconTemplate)

}

  /*  when making a collection folder like 'genre', we might miss a level of ico printing
   *    confouding matters, for company split we use mame's separator as a path seperator,
   *    so we must check 'empty' parents (those without romdatas) and give them icos if they lack
   *    problem we then have is we don't want to ascent further than the root outputdir...
   *    pass a param of rootdir and act if its set */
const printIntermediaryIconFiles = (rootDir, iconName) => dir => {
  const curry = printIntermediaryIconFiles(rootDir, iconName)
  const collectionFolder = path.dirname(dir)
  if (collectionFolder !== rootDir) {
    fs.existsSync(`${collectionFolder}/folders.ini`)  
      || printIconFile(collectionFolder, ``, iconName)
    curry(collectionFolder)
  }
}

// print both a romdata file and the icon config that goes with it, in a folder in the specified dir
// the parent may also need an icon file (hang on hasn't my intermediary fn rendered that pointless?)
const printRomdataFolder = (romdataOutDir, mameExtrasDir, iconName, rootDir) => romdata => {
  mkdirp.sync(`${romdataOutDir}`)
  fs.existsSync(`${romdataOutDir}/folders.ini`) || printIconFile(romdataOutDir, ``, iconName)
  if (rootDir) printIntermediaryIconFiles(rootDir, iconName)(romdataOutDir) 
  printIconFile(`${romdataOutDir}`, mameExtrasDir, iconName)
  return printRomdata(`${romdataOutDir}`, `romdata.dat`)(romdata)
}

// makes and prints a romdata using all the above
const generateRomdata = (romdataOutDir, romdataConfig, rootDir) => mameJson => {
    const mameRomdata  = makeRomdata(romdataConfig.emu)(mameJson)
    const emuIcon = /RetroArch/i.test(romdataConfig.emu)? `RetroArch` : `Mame`
    //for testing we must stub the exported fn https://stackoverflow.com/a/35754124/3536094
    const romdata = module.exports.printRomdataFolder(romdataOutDir, romdataConfig.winIconDir, emuIcon, rootDir)(mameRomdata)
    console.log(`printing ${romdataOutDir}`) 
    if (romdataConfig.devMode) console.log(romdata)
    return romdata
}

module.exports = { printIntermediaryIconFiles, printRomdataFolder, generateRomdata }
