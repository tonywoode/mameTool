const makeSystemsAsync = require('./src/readMameXml.js')
const makeRomdata     = require('./src/makeRomdata.js')
const mameXMLInPath    = `./inputs/mame187.xml`
const jsonOutPath      = `./outputs/mame.json`

const fs               = require(`fs`)
const mameXMLStream    = fs.createReadStream(mameXMLInPath)


//flow
makeSystemsAsync(mameXMLStream)
  .then( systems => { 
    print(systems) 
    const romdata = makeRomdata(systems)
    console.log(romdata)
  }
)

const print = (systems) => {
//print out the json we made, romdatamaker.js uses it
  const pretty = JSON.stringify(systems, null, `\t`)
  console.log(`Printing systems JSON to ${jsonOutPath}`)
  fs.writeFileSync(jsonOutPath, pretty)
  console.log(`done`)
}
