module.exports = {
    makeSystemsAsync : require('./readMameXml.js').makeSystemsAsync
  , cleanJson        : require('./cleanJson.js').cleanJson
  , iniToJson        : require('./fillFromIni.js').iniToJson
  , inis             : require('./inis.json')
}
