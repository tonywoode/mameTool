'use strict'

const R = require(`ramda`)
const _throw = m => { throw new Error(m) }

// getUniqueProps:: (string, list) => [set]
const getUniqueProps = (prop, systems) => R.uniq(R.pluck(prop)(systems) )

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
const removeBool = (keyPath, systems) => R.reject( getProp(keyPath), systems)  

// filterBool:: [path] => object => object
const keepBool = (keyPath, systems) => R.filter( getProp(keyPath), systems)  

// keep only those systems which have a property, nested if necessary 
// (we can use this to make individual lists of genres)
// filterProp:: [path] => value => object => object
const keepProp = (keyPath, value, systems) =>  
  R.filter(doesPropHaveThisValue(keyPath, value), systems) 

// remove those systems which have a property, nested if necessary 
// removeProp:: [path] => value => object => object
const removeProp = (keyPath, value, systems) =>  
  R.reject(doesPropHaveThisValue(keyPath, value), systems) 

/* Routing function to make calls to the above four filters generic
 *   if there's no value (or falsey value) then consider it a boolean op
 *   otherwise its a property op. TODO: typing */

const keepSublist = (keyPath, value) => systems => value? 
  keepProp(keyPath, value, systems) : keepBool(keyPath, systems)

const removeSublist = (keyPath, value) => systems => value? 
  removeProp(keyPath, value, systems) : removeBool(keyPath, systems)

const sublist = (keepOrRemove, keyPath, value) => systems =>
  keepOrRemove === `keep`? keepSublist(keyPath, value)(systems) :
    keepOrRemove === `remove`? removeSublist(keyPath, value)(systems) :
    _throw(`"keep" or "remove" are the only options for a sublist filter, you called ${keepOrRemove}`)


// TODO: what happens if path provided to prop and PropEq resolves to an oject?

//  one way to compose filters: http://fr.umio.us/why-ramda/
//  const aSingleFilter = R.filter(R.where( {arcade: true} )
//  const allFilters = R.compose( aSingleFilter, anotherFilter)
//  allFilters(systems)

module.exports = { sublist, doesPropHaveThisValue, removeBool, keepBool, keepProp, removeProp, getUniqueProps }

