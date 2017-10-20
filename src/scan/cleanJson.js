'use strict'

const R = require('ramda')

// boolean logic isn't well served by 'no' and 'yes', record only 'true'
const yesNoToTrueFalse = key => key === `no`? false : key === `yes`? true : key
const deepYesNoToBool = obj => R.is(Object, obj)? R.map(deepYesNoToBool, R.map(yesNoToTrueFalse, obj)) : obj

// https://stackoverflow.com/a/29904340/3536094 should you wish to improve this to handle falsey generally
//  and if there were to be arrays as values something like if(typeof obj[prop] === 'object' && !Array.isArray(obj[prop]))
const isFalse = prop => prop === false
const deepRemoveFalsey = obj => R.is(Object, obj)? 
  R.map(deepRemoveFalsey, R.reject(isFalse, obj)) : obj

// a bool convert is a combination of transforming and removing falsey, pointfree processing systems
const convertToBool = R.pipe(deepYesNoToBool, deepRemoveFalsey)

// get rid of $ and $name keys, they aren't needed, pointfree processing mameJson systems
const cleanDollar = subobj => R.prop( "$", subobj)
const cleanKey = key => R.map(obj => obj[key] 
  && (cleanDollar(obj[key]) !== undefined) ? //a re-run of the cleanup would delete the subkey otherwise
    R.assoc(key, cleanDollar(obj[key]), obj) 
  : obj )

// none of the other props of these objects will help us make a list of games to play
//   I find them distracting. (Enum hack is stackoverflow.com/questions/8206453 and is so
//     we can call a fn with a string name)
const usefulSubProps = {
    display : [`tag`, `type`, `rotate`, `width`, `height`, `flipx`]
  , control : [`type`, `player`, `buttons`, `reqbuttons`, `minimum`, `maximum`]
}

// as above, needs to be an Enum of either `display` or `control`
const shortenSubObject = type => systems => R.map( obj => obj[type]? 
  R.assoc(type, R.pick(usefulSubProps[type], obj[type]), obj) : obj
, systems)

// savestate can be 'unsupported' or 'supported', its the only binary choice
//   in the whole schema that isn't yes or no - convert and keep true
const savestateLens = R.lensProp('savestate')
const savestateToYesNo = R.map( system => 
  R.view(savestateLens, system) === `supported`?
    R.set(savestateLens, "yes", system ) :
    R.set(savestateLens, "no",  system ) 
)
const savestateToBool = systems => convertToBool(savestateToYesNo(systems) )

// processes a systems mameJson, pointfree
const cleanJson = R.pipe(
    convertToBool
  , cleanKey(`display`)
  , shortenSubObject(`display`)
  , cleanKey(`control`)
  , shortenSubObject(`control`)
  , savestateToBool
)


module.exports = {cleanJson, convertToBool, cleanKey, shortenSubObject, savestateToBool}
