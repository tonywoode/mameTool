'use strict'

const rewire   = require('rewire')
const mkdirp   = require('mkdirp')
const printers = rewire('../src/printers.js')
const fs       = require('fs') //to get methods back when fs itself is rewired

const mameJson        = [
  {
  	"call": "18wheelr",
  	"series": "18 Wheeler\\.:*\"<>|",
  	"version": "0.134u4"
  },
  {
  	"call": "18wheels",
  	"series": "18 Wheeler\\.:*\"<>|",
  	"version": "0.144"
  },
  {
  	"call": "NOT18wheels",
  	"version": "none"
  }
]

describe(`printers`, () => {
  describe(`#printJson`, () => {
    const testPath = `this directory does not exist here`
    const testJsonName = `anything`

    it(`should make a directory if the file doesn't exist`, () => {
      printers.__with__({
          fs: { 
              existsSync:  () => false 
            , writeFileSync: (path, json) => ()=>{}
          } 
        , mkdirp: path => expect(path).to.equal(testPath)
      })( () => printers.printJson(testPath, testJsonName )(mameJson) ) //__with__ requires fn
    })

    it(`should throw an exception if it can't write the json because the ouptut dir doesn't exist`, () => {
      printers.__with__({
          fs: { 
              existsSync:  path => true 
            , writeFileSync: fs.writeFileSync  //TODO: how to avoid having to do this?
          }
        , mkdirp: path => true
      })( () => expect(printers.printJson(testPath, `anything`)).to.throw( //note no curry
        `ENOENT: no such file or directory, open '${testPath}/${testJsonName}'`
      ))
    })

  })
})

