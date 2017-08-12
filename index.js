'use strict'

const R = require(`ramda`)

const {readFile, createReadStream } = require(`fs`)
const {fillFromIni}      = require(`./src/fillFromIni.js`)
const {loadKVIni, loadSectionIni, loadBareIni} = require(`./src/iniReader.js`)
const makeSystemsAsync   = require(`./src/readMameXml.js`)
const makeRomdata        = require(`./src/makeRomdata.js`)
const {printJson, printRomdata, printIconFile} 
                         = require(`./src/printers.js`)
const mameXMLInPath      = `./inputs/mame187.xml`
const mameXMLStream      = createReadStream(mameXMLInPath)

const jsonOutPath        = `./outputs/mame.json`
const romdataOutDir      = `./outputs/mame`
const winIconDir         = require(`./src/getDir.js`).getWinIconDir()

// If there's an xml that parses in the json out location, use that, don't parse it all again
const decideWhetherToXMLAsync = () => new Promise( resolve =>
  readFile(jsonOutPath, (err, data) =>
    err? resolve(makeSystemsAsync(mameXMLStream) ) : resolve(JSON.parse(data) )  
  )
)

//LHS = fills json with named kv, RHS = resolves to a parsed ini file,
// there are three types of ini file (see iniReader.js)
// n.b.: to add an ini to romdata, also populate it in makeRomdata
decideWhetherToXMLAsync().then( systems => {
  const romdata = R.pipe(
     fillFromIni(`arcade`      , loadBareIni(   `arcade`) )
   , fillFromIni(`arcadeNoBios`, loadBareIni(   `arcade_NOBIOS`) )
   , fillFromIni(`rating`      , loadSectionIni(`bestgames`) )
   , fillFromIni(`category`    , loadSectionIni(`category`) )
   , fillFromIni(`catlist`     , loadSectionIni(`catlist`) )
   , fillFromIni(`genre`       , loadSectionIni(`genre`) )
   , fillFromIni(`language`    , loadSectionIni(`languages`))
   , fillFromIni(`mamescore`   , loadKVIni(     `mamescore`, `MAMESCORE`) )
   , fillFromIni(`mess`        , loadBareIni(   `mess`) )
   , fillFromIni(`monochrome`  , loadSectionIni(`monochrome`) )
   , fillFromIni(`players`     , loadKVIni(     `nplayers`, `NPlayers`) )
   , fillFromIni(`screenless`  , loadBareIni(   `screenless`) )
   , fillFromIni(`series`      , loadSectionIni(`series`) )
   , fillFromIni(`version`     , loadSectionIni(`version`) )
   , printJson(jsonOutPath) 
   , makeRomdata(`Mame64`)
   , printRomdata(romdataOutDir, `romdata.dat`)
  )(systems) 

  printIconFile(romdataOutDir, winIconDir, `mame`)

})

