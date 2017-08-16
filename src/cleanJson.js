'use strict'

const R = require(`ramda`)

// boolean logic isn't well served by 'no' and 'yes', record only 'true'
const convertToBool = systems => {
  const mapDeep = obj => {
    for ( const prop in obj ) {
        if ( obj[prop] === Object(obj[prop]) ) mapDeep( obj[prop] )
        if ( obj[prop] === `no`  ) delete obj[prop]
        if ( obj[prop] === `yes` ) obj[prop] = true
    }
    return obj
  }
 return R.map( obj => mapDeep(obj), systems)
}

// get rid of $ and $name keys, they aren't needed
const cleanKey = key => systems => {
  const cleanDollar = subobj  => R.prop( "$", subobj)
  return R.map(obj => obj[key]? 
    R.assoc(`${key}`, cleanDollar(obj[key]), obj) : obj
  , systems )
}

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

const cleanJson = systems => {
  return R.pipe(
      convertToBool
    , cleanKey(`display`)
    , shortenSubObject(`display`)
    , cleanKey(`control`)
    , shortenSubObject(`control`)
  )(systems)
}

module.exports = { cleanJson, convertToBool, cleanKey, shortenSubObject}
