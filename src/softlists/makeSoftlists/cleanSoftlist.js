'use strict'

const R = require('ramda')

/* I don't like working with a messy tree, lots of $ and needless repetition...With softlists it tuned
 *   out that we have three identically keyed objects, so a generic function will clean them all up
 *   TODO: you should be able to clean this up in the xml-stream pipeline
 */
module.exports = softlist => {
  //I removed destructuring elsewhere but here the object isn't going to grow
  const cleanPairs = (key, name, value)  => 
    R.map( ({ $ }) => 
     ( ({ [name]:$.name, [value]:$.value }) )
    , key )
  
  //if the softlist contains some subobject named 'key', clear up that subobject, as the thing we scraped wasn't nice
  const replaceIfKey = (key, name, value)  => list => R.map(obj => obj[key]? 
    obj[key] = R.assoc(key, cleanPairs(obj[key], name, value), obj) : obj
  , list )

  const replacedSharedFeat = R.pipe( 
      replaceIfKey(`feature`, `name`, `value`)
    , replaceIfKey(`info`, `name`, `value`)
    ,replaceIfKey(`sharedFeat`, `name`, `value`)
  )(softlist)

     console.log(JSON.stringify(replacedSharedFeat, null, '\t')); process.exit()
  return replacedSharedFeat
}
