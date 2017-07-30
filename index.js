const xmlreader = require('./src/readMameXML.js')

const mameXMLInPath = `./inputs/mame187.xml`
const pretty = systems => console.log(JSON.stringify(systems, null, `\t`))

xmlreader(mameXMLInPath, pretty)
