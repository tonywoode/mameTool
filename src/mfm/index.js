'use strict'

const fs             = require('fs')
const _throw         = m => { throw new Error(m) }

const mfmReaderAsync = require('./mfmReader.js').mfmReaderAsync
const mfmFilter      = require('./mfmReader.js').mfmFilter

//fulfil a call to make a mame file manager filtered romdata
const mfm = (settings, readMameJson, jsonOutDir, jsonOutName, generateRomdata, outputDir, romdataConfig) => {
  console.log(`MAME file manager file: ${settings.mfmTextFileInPath}` )
  settings.mfmTextFileInPath || _throw(`there's no MFM File`) //TODO: recover?
  const  mfmTextFileStream = fs.createReadStream(settings.mfmTextFileInPath)
  readMameJson(jsonOutDir, jsonOutName).then( sysObj => {
    const {arcade} = sysObj 
    mfmReaderAsync(mfmTextFileStream) 
      .then( (mfmArray) => {
        const mfmFilteredJson = mfmFilter(mfmArray)(arcade) 
        generateRomdata(outputDir, romdataConfig)(mfmFilteredJson)

        return sysObj
      })
  })
  .catch(err => _throw(err) )
}



module.exports = {mfm, mfmReaderAsync , mfmFilter}
