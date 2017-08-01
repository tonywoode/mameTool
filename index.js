const makeSystemsAsync = require('./src/readMameXML.js')
const mameXMLInPath    = `./inputs/mame187.xml`
const fs               = require(`fs`)
const mameXMLStream    = fs.createReadStream(mameXMLInPath)
const pretty = systems => console.log(JSON.stringify(systems, null, `\t`))

makeSystemsAsync(mameXMLStream).then( systems => pretty(systems) )
