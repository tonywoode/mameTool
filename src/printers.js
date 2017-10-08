'use strict'

let   fs                          = require('fs') //rewired in test, don't try and const or destructure
let   mkdirp                      = require('mkdirp') //ditto
const path                        = require('path')
const _throw                      = m => { throw new Error(m) }

const makeRomdata                 = require('./makeRomdata.js')

exports.printJson = (outputDir, jsonOutName) => systems => {
  const jsonOutPath = `${outputDir}/${jsonOutName}`
  fs.existsSync(outputDir) || mkdirp(outputDir) 
  fs.writeFileSync(jsonOutPath, JSON.stringify(systems, null, `\t`))  
  return systems
}

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

/* print both a romdata file and the icon config that goes with it, in a folder in the specified dir
 * remember the top level also needs a basic icon, give it the child's icon */

const printRomdataFolder = (romdataOutDir, mameExtrasDir, iconName, rootDir) => romdata => {
  mkdirp.sync(`${romdataOutDir}`)
  fs.existsSync(`${romdataOutDir}/folders.ini`) || printIconFile(romdataOutDir, ``, iconName)
  
  /*  when making a collection folder like 'genre', we might miss a level of ico printing
   *    counfouding matters, for company split we use mame's separator as a path seperator,
   *    so we must check 'empty' parents (those without romdatas) and give them icos if they lack
   *    problem we then have is we don't want to ascent further than the root outputdir...
   *    the most elegant thing seems atm to pass a param of rootdir and act if its set */
  if (rootDir) {
    const printIntermediaryIconFiles = dir => {
      const collectionFolder = path.dirname(dir)
      if (collectionFolder !== rootDir) {
        fs.existsSync(`${collectionFolder}/folders.ini`)  
          || printIconFile(collectionFolder, ``, iconName)
        printIntermediaryIconFiles(collectionFolder)
      }
    }

    printIntermediaryIconFiles(romdataOutDir)
  }

  printIconFile(`${romdataOutDir}`, mameExtrasDir, iconName)
  return printRomdata(`${romdataOutDir}`, `romdata.dat`)(romdata)
}

// this makes and prints a romdata using all the above
exports.generateRomdata = (romdataOutDir, romdataConfig, rootDir) => mameJson => {
    const mameRomdata  = makeRomdata(romdataConfig.emu)(mameJson)
    const emuIcon = /RetroArch/i.test(romdataConfig.emu)? `RetroArch` : `Mame`
    const romdata = printRomdataFolder(romdataOutDir, romdataConfig.winIconDir, emuIcon, rootDir)(mameRomdata)
    console.log(`printing ${romdataOutDir}`)
    if (romdataConfig.devMode) console.log(romdata)
    return romdata
}
