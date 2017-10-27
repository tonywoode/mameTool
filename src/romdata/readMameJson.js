'use strict'

const fs     = require('fs')
const _throw = m => { throw new Error(m) }

module.exports = (jsonOutPath) => new Promise( resolve =>
  fs.readFile(jsonOutPath, (err, data) =>
    err? _throw(`can't find MAME JSON - run me first with '--scan' `) 
      : (console.log(`existing MAME XML scan found...${JSON.parse(data).versionInfo.mameVersion}`)
        , resolve(JSON.parse(data) )      
    )
  )
)

