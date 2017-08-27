'use strict'

const R = require(`ramda`)

// getUniqueProps:: (string, list) => [set]
const getUniqueProps = (prop, systems) => R.uniq(R.pluck(prop)(systems) )

// get a value, nested if neccessary
// getProp:: [path] => value
const getProp = keyPath => R.path(keyPath) 

// copes with booth regex searches and nested kvs
// doesPropHaveValue:: [path] => string|RegExp => bool
const doesPropHaveThisValue = (keyPath, value) => obj => 
  // if it isn't a regex, treat it like a string
  R.type(value) === "RegExp"?  R.test(value, R.path(keyPath)(obj)) : 
    R.pathEq(keyPath, value)(obj)

// rejectBool:: [path] => object => object
const rejectBool = (keyPath, systems) => R.reject( getProp(keyPath), systems)  

// keep only those systems which have a property, nested if necessary 
// (we can use this to make individual lists of genres)
// filterProp:: [path] => value => object => object
const filterProp = (keyPath, value, systems) =>  
  R.filter(doesPropHaveThisValue(keyPath, value), systems) 

// remove those systems which have a property, nested if necessary 
// removeProp:: [path] => value => object => object
const removeProp = (keyPath, value, systems) =>  
  R.reject(doesPropHaveThisValue(keyPath, value), systems) 


// TODO: what happens if path provided to prop and PropEq resolves to an oject?

// R.type can distinguish regexps

//  one way to compose filters: http://fr.umio.us/why-ramda/
//  const aSingleFilter = R.filter(R.where( {arcade: true} )
//  const allFilters = R.compose( aSingleFilter, anotherFilter)
//  allFilters(systems)

module.exports = { doesPropHaveThisValue, rejectBool, filterProp, removeProp, getUniqueProps }

