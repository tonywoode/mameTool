'use strict'

const fs             = require('fs-extra') //otherwise copying a file is non-trivial 
const R              = require('ramda')
const {efindBoringSystems
  , embeddedSystemsBoringSystems
  , systemTypesToRemove} = require('../../messConfig.json')

/* Now the ini is out, print out a systems list */
module.exports = (log, existingSystemsDat, datOutPath) => systems => {

  /*has the user got any systems we've later decided are boring? 
   * Go through the boring and old systems in mameTools config file, excluding them from the systems dat
   * Uses list from messConfig to removes unwanted system names that may have previously been printed to the users systems.dat. 
   * TODO: there exists a slim chance the user rather than mametool added one of these,
   * its rather unlikely */

  // Each of these systems needs to be used to filter the systems.dat
  const sections = [ efindBoringSystems, embeddedSystemsBoringSystems, systemTypesToRemove ]

  // ::[a] => a => bool - does system name appear in list (equals is curried a system from systems)
  const isItInExclusionList = systems => system => R.none(R.equals(system), systems)
  //::[a] => [a] => [a] - (change filter to reject to debug)
  const filterSystemsDat = exclusions => R.filter(isItInExclusionList(exclusions), existingSystemsDat)
  const filteredExistingSystemsDat = R.reduce( (accum, item) => filterSystemsDat(item), [], sections)
  console.log(filteredExistingSystemsDat)

  //native js version of the same....
  //const filterSystemsDat = (source, sections) => source.filter(x => !sections.some(e => e.indexOf(x) !== -1))
  //const filteredExistingSystemsDat = filterSystemsDat(existingSystemsDat, sections)
  //console.log(filteredExistingSystemsDat)
  process.exit()

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
