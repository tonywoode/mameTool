'use strict'

const fs             = require('fs-extra') //otherwise copying a file is non-trivial 
const R              = require('ramda')

/* Now the ini is out, print out a systems list */
module.exports = (log, existingSystemsDat, datOutPath) => systems => {

    const lister = R.pipe( R.map( ({systemType}) => (`${systemType}`) ), R.uniq)(systems)
    const ordered = lister.sort( (a, b) => a.localeCompare(b) )
  
    //make the union dat of the old quickplay and the new systems dat
    const unionDat        = R.union(existingSystemsDat, ordered)
    const orderedUnionDat = unionDat.sort( (a, b) => a.localeCompare(b) )
    const joinedUnionDat  = orderedUnionDat.join(`\n`) 
   
    console.log(`Printing systems dat to ${datOutPath}`)
    if (log.dat) console.log(joinedUnionDat)
    //i don't dare to overwrite the users systems.dat the first time
    fs.existsSync(datOutPath) && fs.copySync(datOutPath, `${datOutPath}.old`)
    fs.writeFileSync(datOutPath, joinedUnionDat, `latin1`)  //utf8 isn't possible at this time

    return systems
}
