const makeSystemsAsync = require('./src/readMameXml.js')
const makeRomdata      = require('./src/makeRomdata.js')
//const printRomdata     = require('./src/printRomdata.js')
const mameXMLInPath    = `./inputs/mame187.xml`
const jsonOutPath      = `./outputs/mame.json`
const romdataOutPath   = `./outputs/romdata.dat`
const fs               = require(`fs`)
const mameXMLStream    = fs.createReadStream(mameXMLInPath)


//flow
makeSystemsAsync(mameXMLStream)
  .then( systems => { 
    printJsonToFile(systems) 
    const romdata = makeRomdata(systems)
    printRomdata(romdata)
  })

const printJsonToFile = systems => {
  const pretty = JSON.stringify(systems, null, `\t`)
  fs.writeFileSync(jsonOutPath, pretty)
}

const printRomdata = romdata => { 
    console.log(romdata)
    fs.writeFileSync(romdataOutPath, romdata.join(`\n`), `latin1`) //utf8 isn't possible at this time
}
