'use strict'

//const mameJson = require(`../outputs/mame.json`)
const R = require(`ramda`)

// getUniqueProps:: (string, list) => [set]
const getUniqueProps = (prop, systems) => R.uniq(R.pluck(prop)(systems) )

// get a value, nested if neccessary
// getProp:: [path] => value
const getProp = keyPath => R.path(keyPath) 

//doesPropHaveValue:: [path] => value => bool
const doesPropHaveThisValue = (keyPath, value) => R.pathEq(keyPath, value)

// rejectBeel:: [path] => object => object
const rejectBool = (keyPath, systems) => R.reject( getProp(keyPath), systems)  

// remove those systems which have a property, nested if necessary 
// filterProp:: [path] => value => object => object
const filterProp = (keyPath, value, systems) => { 
  return R.filter(doesPropHaveThisValue(keyPath, value), systems) 
}

// TODO: what happens if path provided to prop and PropEq resolves to an oject?

//  one way to compose filters: http://fr.umio.us/why-ramda/
//  const aSingleFilter = R.filter(R.where( {arcade: true} )
//  const allFilters = R.compose( aSingleFilter, anotherFilter)
//  allFilters(systems)

module.exports = { rejectBool, filterProp, getUniqueProps }

