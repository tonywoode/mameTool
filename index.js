const makeSystemsAsync = require('./src/readMameXML.js')
const mameXMLInPath    = `./inputs/mame187.xml`
const jsonOutPath      = `./outputs/mame.json`

const fs               = require(`fs`)
const mameXMLStream    = fs.createReadStream(mameXMLInPath)

const print = (systems) => {
//print out the json we made, romdatamaker.js uses it
  const pretty = JSON.stringify(systems, null, `\t`)
  console.log(`Printing systems JSON to ${jsonOutPath}`)
  fs.writeFileSync(jsonOutPath, pretty)
  console.log(`done`)
}

makeSystemsAsync(mameXMLStream).then( systems => print(systems) )
