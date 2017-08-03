"use strict"

const mkdirp = require(`mkdirp`)
const writeFileSync = require('fs').writeFileSync

exports.printJsonToFile = (systems, jsonOutPath) => writeFileSync(
  jsonOutPath, JSON.stringify(systems, null, `\t`) 
)

exports.printRomdata = (romdata, romdataOutDir, romdataOutName) => {
  mkdirp.sync(romdataOutDir)
  const romdataOutPath = `${romdataOutDir}/${romdataOutName}`
  writeFileSync(romdataOutPath, romdata.join(`\n`), `latin1`) //utf8 isn't possible at this time
  console.log(romdata)
}

exports.printIconFile = (romdataOutDir, mameExtrasDir, iconName) => {

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
