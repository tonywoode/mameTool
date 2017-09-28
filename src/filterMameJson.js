'use strict'

const R = require('ramda')
const _throw = m => { throw new Error(m) }

// TODO: what happens if path provided to prop and PropEq resolves to an oject?

// getUniqueProps:: (string, list) => [set]
const getUniqueProps = prop => systems => R.uniq(R.pluck(prop)(systems) )

// get a value, nested if neccessary
// getProp:: [path] => value
const getProp = keyPath => R.path(keyPath) 

// copes with both regex searches and nested kvs
// doesPropHaveValue:: [path] => string|RegExp => object => bool
const doesPropHaveThisValue = (keyPath, value) => obj => 
  // if it isn't a regex, treat it like a string
  R.type(value) === "RegExp"?  R.test(value, R.path(keyPath)(obj)) : 
    R.pathEq(keyPath, value)(obj)

// rejectBool:: [path] => object => object
const removeBool = keyPath => R.reject(getProp(keyPath)) 

// filterBool:: [path] => object => object
const keepBool = keyPath => R.filter(getProp(keyPath))  

// keep only those systems which have a property, nested if necessary 
// (we can use this to make individual lists of genres)
// filterProp:: [path] => value => object => object
const keepProp = (keyPath, value) =>  
  R.filter(doesPropHaveThisValue(keyPath, value)) 

// remove those systems which have a property, nested if necessary 
// removeProp:: [path] => value => object => object
const removeProp = (keyPath, value) =>  
  R.reject(doesPropHaveThisValue(keyPath, value)) 

/* Routing function to make calls to the above four filters generic
 *   if there's no value (or falsey value) then consider it a boolean op
 *   otherwise its a property op. TODO: typing */

const keepSublist = (keyPath, value) => value? 
  keepProp(keyPath, value) : keepBool(keyPath)

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


module.exports = { sublist, doesPropHaveThisValue, removeBool
  , keepBool, keepProp, removeProp, getUniqueProps, makeFilteredJson }

