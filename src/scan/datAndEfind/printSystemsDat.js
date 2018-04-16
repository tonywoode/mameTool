'use strict'

const fs             = require('fs-extra') //otherwise copying a file is non-trivial 
const R              = require('ramda')
const {efindBoringSystems
  , embeddedSystemsBoringSystems
  , systemTypesToRemove} = require('../../messConfig.json')

/* Now the ini is out, print out a systems list */
module.exports = (log, existingSystemsDat, datOutPath) => systems => {

  /*has the user got any systems we've later decided are boring 
   * TODO: there exists a slim chance the user rather than mametool added one of these,
   * its rather unlikely */
  
  const systemsToDelete = efindBoringSystems.reduce( (accum, item) => {
    existingSystemsDat.includes(item) && accum.push(item)
    return accum
  },[])

  console.log(`first round deletions: ` + systemsToDelete.toString() )

  const systemsToDeletePlusEmbedded = embeddedSystemsBoringSystems.reduce( (accum, item) => {
    existingSystemsDat.includes(item) && accum.push(item)
    return accum
  }, systemsToDelete)

  console.log(`second round deletions: ` + systemsToDeletePlusEmbedded.toString() )

  const systemsToDeletePlusTypesToRemove = systemTypesToRemove.reduce( (accum, item) => {
    existingSystemsDat.includes(item) && accum.push(item)
    return accum
  }, systemsToDeletePlusEmbedded)

  console.log(`third round deletions: ` + systemsToDeletePlusTypesToRemove.toString() )
   
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
