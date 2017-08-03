const makeSystemsAsync = require('./src/readMameXml.js')
const makeRomdata      = require('./src/makeRomdata.js')
const { printJsonToFile, printRomdata, printIconFile}  = require('./src/printers.js')

const mameXMLInPath    = `./inputs/mame187.xml`
const jsonOutPath      = `./outputs/mame.json`
const romdataOutDir    = `./outputs/mame`
const romdataOutName   = `romdata.dat`
const mameExtrasDir    = `F:\\Mame\\Extras\\Icons`
const mameEmu          = `Mame64`

const mameXMLStream    = require(`fs`).createReadStream(mameXMLInPath)

//flow
makeSystemsAsync(mameXMLStream).then( systems => { 
  printJsonToFile(systems, jsonOutPath) 
  const romdata = makeRomdata(systems, mameEmu)
  printRomdata(romdata, romdataOutDir, romdataOutName)
  printIconFile(romdataOutDir, mameExtrasDir, `mame`)
})

// const config = ini.parse(fs.readFileSync(iniPath, 'utf-8') )
//const iniDir = `/Volumes/GAMES/MAME/EXTRAs/folders/`

