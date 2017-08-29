'use strict'

const R = require(`ramda`)
const _throw = m => { throw new Error(m) }

// getUniqueProps:: (string, list) => [set]
const getUniqueProps = prop => systems => R.uniq(R.pluck(prop)(systems) )

// get a value, nested if neccessary
// getProp:: [path] => value
const getProp = keyPath => R.path(keyPath) 

// copes with booth regex searches and nested kvs
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
    _throw(`"keep" or "remove" are the only options for a sublist filter, you called ${keepOrRemove}`)


// TODO: what happens if path provided to prop and PropEq resolves to an oject?

//  one way to compose filters: http://fr.umio.us/why-ramda/
//  const aSingleFilter = R.filter(R.where( {arcade: true} )
//  const allFilters = R.compose( aSingleFilter, anotherFilter)
//  allFilters(systems)

module.exports = { sublist, doesPropHaveThisValue, removeBool, keepBool, keepProp, removeProp, getUniqueProps }

