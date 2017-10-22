'use strict'

const fs = require('fs')
const _throw                           = m => { throw new Error(m) }

module.exports = (jsonOutDir, jsonOutName) => new Promise( resolve =>
  fs.readFile(`${jsonOutDir}/${jsonOutName}`, (err, data) =>
    err? _throw(`can't find MAME JSON - run me first with '--scan' `) 
      : (console.log(`existing MAME XML scan found...${JSON.parse(data).versionInfo.mameVersion}`)
        , resolve(JSON.parse(data) )      
    )
  )
)

