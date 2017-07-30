const xmlreader = require('./src/readMameXML.js')

const pretty = systems => console.log(JSON.stringify(systems, null, `\t`))

xmlreader(pretty)
