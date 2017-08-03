const makeSystemsAsync = require('./src/readMameXml.js')
const makeRomdata      = require('./src/makeRomdata.js')
const { printJsonToFile, printRomdata}  = require('./src/printers.js')

const mameXMLInPath    = `./inputs/mame187.xml`
const jsonOutPath      = `./outputs/mame.json`
const romdataOutDir    = `./outputs/mame`
const romdataOutName   = `romdata.dat`
const mameExtrasDir    = `F:\\Mame\\Extras\\Icons`

const mameXMLStream    = require(`fs`).createReadStream(mameXMLInPath)

//flow
makeSystemsAsync(mameXMLStream).then( systems => { 
  printJsonToFile(systems, jsonOutPath) 
  const romdata = makeRomdata(systems)
  printRomdata(romdata, romdataOutDir, romdataOutName)
})

