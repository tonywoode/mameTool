'use strict'

const readline = require('readline')

  /* get the existing list of QuickPlay's system types into an array
   * (we are amending an existing list, not replacing it. MAME doesn't
   * cover modern consoles for instance */
  const existingDatReaderAsync = datInStream => new Promise( (resolve, reject) => {
    const currentTypeList = []
    const rl = readline.createInterface({ input: datInStream})
    rl.on( 'line', (line) => currentTypeList.push(line) )
    rl.on('error', error => reject(error) )
    rl.on('close', ()    => resolve(currentTypeList) )
  })

module.exports = {existingDatReaderAsync}


