'use strict'

const readline = require('readline')
const R        = require('ramda')

const mfmReaderAsync = mfmTextFileStream => new Promise( (resolve, reject) => {
  const gameList = []
  const rl = readline.createInterface( {input: mfmTextFileStream} )
  rl.on('line',  line  => gameList.push(line) )
  rl.on('error', error => reject(error) )
  rl.on('close', ()    => resolve(gameList) )
})

const mfmFilter = mfmArray => R.filter( obj => mfmArray.includes(obj.call))

module.exports = { mfmReaderAsync, mfmFilter }

