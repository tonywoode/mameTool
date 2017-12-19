'use strict'

const R = require('ramda')
const _throw = m => { throw new Error(m) }

// TODO: what happens if path provided to prop and PropEq resolves to an oject?

// getUniqueProps:: String -> Array Object -> Array a
const getUniqueProps = prop => systems => R.uniq( R.pipe(
     R.pluck(prop)
   , R.reject(R.isNil) //pluck will pluck undef if the key doesn't exist in an item
  )(systems) 
)

// get a value, nested if neccessary
// getProp:: Array path -> value
const getProp = keyPath => R.path(keyPath) 

// copes with both regex searches and nested kvs
// doesPropHaveValue:: Array path -> string|RegExp -> Object -> Bool
const doesPropHaveThisValue = (keyPath, value) => obj => 
  // if it isn't a regex, treat it like a string
  R.type(value) === "RegExp"?  R.test(value, R.path(keyPath)(obj)) : 
    R.pathEq(keyPath, value)(obj)

// removeBool:: Array a -> Object a
const removeBool = keyPath => R.reject(getProp(keyPath)) 

// filterBool:: Array a -> Object a
const keepBool = keyPath => R.filter(getProp(keyPath))  

// keep only those systems which have a property, nested if necessary 
// (we can use this to make individual lists of genres)
// keepProp:: Array path -> String a -> Object a
const keepProp = (keyPath, value) =>  
  R.filter(doesPropHaveThisValue(keyPath, value)) 

// remove those systems which have a property, nested if necessary 
// removeProp:: Array path -> String a -> Object a
const removeProp = (keyPath, value) =>  
  R.reject(doesPropHaveThisValue(keyPath, value)) 

/* Routing function to make calls to the above four filters generic
 *   if there's no value (or falsey value) then consider it a boolean op
 *   otherwise its a property op. TODO: typing */

// keepSublist:: Array path -> String a -> Object a
const keepSublist = (keyPath, value) => value? 
  keepProp(keyPath, value) : keepBool(keyPath)

// removeSublist:: Array path -> String a -> Object a
const removeSublist = (keyPath, value) => value? 
  removeProp(keyPath, value) : removeBool(keyPath)

const sublist = (keepOrRemove, keyPath, value) =>
  keepOrRemove === `keep`? keepSublist(keyPath, value) :
    keepOrRemove === `remove`? removeSublist(keyPath, value) :
    _throw(`options for sublist filter: keep|remove; you called ${keepOrRemove}`)

// the following all are about converting the filter objects into runnable filters and running them

// turn a single filter object into a runnable filter function
const makeSublistFilter = filter => sublist(filter.type, filter.path, filter.value)

// combines an array of filter objects into an array of runnable filter functions, its this we actually apply
const sublistArray = filterArray => R.map(makeSublistFilter, filterArray)

// apply each filter in turn onto a base mame object
const applySublistFilters = (sublistArray, mameJson) => 
  R.reduce( (newJson, filter) => filter(newJson), mameJson, sublistArray)

// run the above
const makeFilteredJson = filterArray => mameJson => 
  applySublistFilters( sublistArray(filterArray), mameJson)

/* but now we need to apply that to each filter ie: tickbox the user selected to make
 * the romdata they want. its a reduce: 
 * what to operate on =  tickObject. what the accumulator is = mameJson
 * what to do to accum each time around =  if (filterThisProp) makeFilteredJson(thisProp'sFilter)(mameJson) */

//this is the function that gets applied each time round
const applyFilter = (tick, mameJson) => tick.value? makeFilteredJson(tick.filter)(mameJson): mameJson

//this applies that function to each tickbox
const applyFilters = (tickObject, mameJson) =>
  R.reduce( (newJson, tick) => applyFilter(tick, newJson), mameJson, tickObject )

module.exports = { sublist, doesPropHaveThisValue, removeBool
  , keepBool, keepProp, removeProp, getUniqueProps, makeFilteredJson, applyFilters }

