'use strict'

const R = require(`ramda`)

// boolean logic isn't well served by 'no' and 'yes', record only 'true'
const yesNoToTrueFalse = key => key === `no`? false : key === `yes`? true : key
const deepYesNoToBool = obj => R.is(Object, obj)? R.map(deepYesNoToBool, R.map(yesNoToTrueFalse, obj)) : obj

// https://stackoverflow.com/a/29904340/3536094 should you wish to improve this to handle falsey generally
//  and if there were to be arrays as values something like if(typeof obj[prop] === 'object' && !Array.isArray(obj[prop]))
const isFalse = prop => prop === false
const deepRemoveFalsey = obj => R.is(Object, obj)? 
  R.map(deepRemoveFalsey, R.reject(isFalse, obj)) : obj


// a bool convert is a combination of transforming and removing falsey
const convertToBool = systems => R.pipe(deepYesNoToBool, deepRemoveFalsey)(systems)

// get rid of $ and $name keys, they aren't needed
const cleanDollar = subobj  => R.prop( "$", subobj)
const cleanKey = key => systems => R.map(obj => obj[key]? 
    R.assoc(`${key}`, cleanDollar(obj[key]), obj) : obj, systems )

// none of the other props of these objects will help us make a list of games to play
//   I find them distracting. (Enum hack is stackoverflow/questions/8206453 and is so
//     we can call a fn with a string name)
const Enumeration = {}
Enumeration.display = [`tag`, `type`, `rotate`, `width`, `height`, `flipx`]
Enumeration.control = [`type`, `player`, `buttons`, `reqbuttons`, `minimum`, `maximum`]

// as above, needs to be an Enum of either `display` or `control`
const shortenSubObject = type => systems => R.map( obj => obj[type]? 
  R.assoc(type, R.pick(Enumeration[type], obj[type]), obj) : obj
, systems)

// savestate can be 'unsupported' or 'supported', its the only binary choice
//   in the whole schema that isn't yes or no - convert and keep true
const savestateLens = R.lensProp('savestate')
const savestateToYesNo = systems => R.map( system => 
  R.view(savestateLens, system) === `supported`?
    R.set(savestateLens, "yes", system ) :
    R.set(savestateLens, "no",  system ) 
, systems)
const savestateToBool = systems => convertToBool(savestateToYesNo(systems) )


const cleanJson = systems => 
  R.pipe(
    convertToBool
  , cleanKey(`display`)
  , shortenSubObject(`display`)
  , cleanKey(`control`)
  , shortenSubObject(`control`)
  , savestateToBool
)(systems)


module.exports = { cleanJson, convertToBool, cleanKey, shortenSubObject, savestateToBool}
