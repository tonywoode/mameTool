'use strict'

const R = require('ramda')

/* I don't like working with a messy tree, lots of $ and needless repetition...With softlists it tuned
 *   out that we have three identically keyed objects, so a generic function will clean them all up
 *   TODO: you should be able to clean this up in the xml-stream pipeline
 */
module.exports = softlist => {
  //I removed destructuring elsewhere but here the object isn't going to grow
  const cleanPairs = (key, name, value)  => R.map( ({ $ }) => ( ({ [name]:$.name, [value]:$.value }) ) , key )
  //TODO: overly specific and there's a better way than to map/destructure
  const cleanPart = partKey => R.map( ({ feature, $ }) => ( ({ feature, name:$.name, interface:$.interface }) ) , partKey )
  
  const replacePart = list => R.map( obj => R.assoc(`part`, cleanPart(obj.part), obj), list)

  //if the softlist contains some subobject named 'key', clear up that subobject, as the thing we scraped wasn't nice
  const replaceIfKey = (key, name, value)  => list => R.map(obj => obj[key]? 
    obj[key] = R.assoc(key, cleanPairs(obj[key], name, value), obj) : obj
  , list )

   const replaceIfParentKey = (keyPath, name, value)  => list => R.map(obj => { 
     const parent = keyPath[0]
     const key = keyPath[1]
     const newFeat = R.map( subObj => {
       return subObj[key]?  subObj = R.assoc(key, cleanPairs(subObj[key], name, value), subObj) : subObj
     }, obj[parent])
     obj = R.assoc(parent, newFeat, obj)
     return obj
   }, list )


  const replacedSharedFeat = R.pipe( 
    replacePart
    ,  replaceIfParentKey([`part`, `feature`], `name`, `value`)
    //,  replaceIfParentKey([`part`, `dataarea`], `name`, `interface`) //lots of info in here, but mamename loading means wwe shouldn't need
    , replaceIfKey(`info`, `name`, `value`)
    , replaceIfKey(`sharedFeat`, `name`, `value`)
  )(softlist)

  // console.log(JSON.stringify(replacedSharedFeat, null, '\t')); process.exit()
  return replacedSharedFeat
}
