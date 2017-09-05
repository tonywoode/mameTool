'use strict'

const mkdirp                      = require(`mkdirp`)
const {writeFileSync, existsSync} = require(`fs`)

const makeRomdata                 = require(`./makeRomdata.js`)

exports.printJson = jsonOutPath => systems => {
  writeFileSync(jsonOutPath, JSON.stringify(systems, null, `\t`)) 
  return systems
}

const printRomdata = (romdataOutDir, romdataOutName) => romdata => {
  const romdataOutPath = `${romdataOutDir}/${romdataOutName}`
  writeFileSync(romdataOutPath, romdata.join(`\n`), `latin1`) //utf8 isn't possible at this time
  console.log(romdata)

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

  writeFileSync(`${romdataOutDir}/folders.ini`, iconTemplate)

}

// print both a romdata file and the icon config that goes with it, in a folder in the specified dir
//  remember the top level also needs a basic icon, give it the child's icon
//  TODO: check that baseDir exists....
//  TODO: convert params to object, clearer at callsite
const printRomdataFolder = (baseDir, romdataOutDir, mameExtrasDir, iconName) => romdata => {
  mkdirp.sync(`${baseDir}/${romdataOutDir}`)
  existsSync(`${baseDir}/folders.ini`) || printIconFile(baseDir, ``, iconName)
  //when making a collection folder like 'genre', we might miss a level of ico printing
  const collectionFolder = `${baseDir}/${romdataOutDir}/..`
  existsSync(`${collectionFolder}/folders.ini`) || printIconFile(collectionFolder, ``, iconName)
  printIconFile(`${baseDir}/${romdataOutDir}`, mameExtrasDir, iconName)
  return printRomdata(`${baseDir}/${romdataOutDir}`, `romdata.dat`)(romdata)
}

exports.generateRomdata = (Emu, romdataOutDir, mameExtrasDir) => mameJson => {
    const mameRomdata  = makeRomdata(Emu.EmuName)(mameJson)
    return printRomdataFolder(Emu.RomdataOutParDir, romdataOutDir, mameExtrasDir, Emu.Icon)(mameRomdata)
}
