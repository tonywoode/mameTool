'use strict'

const rewire   = require('rewire')
const mkdirp   = require('mkdirp')
const printers = rewire('../src/printers.js')


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
  },
]

//so printJson just makes a path out of the two input dirs, makes a dir if it doesn't exist, and writes the systems into it
// do we need to test it? I can't see why
// ah hell let's just do it, but DELETE IT IF ITS NOT TRIVIAL
//

describe(`printers`, () => {
  describe(`#printJson`, () => {
    it(`should make a directory if the file doesn't exist`, () => {
    const testPath = `this directory does not exist here`
    const revertFs = printers.__set__(`fs`, { 
        existsSync:  () => false 
      , writeFileSync: (path, json) => ()=>{}
    })
    const revertMkdirp = printers.__set__(`mkdirp`, path => expect(path).to.equal(testPath))
    printers.printJson(testPath, `anything`)(mameJson)
    revertFs() && revertMkdirp()
    })
  })
})

//printRomdata does the same but joins the array of romdata rows into a file (where's the header then?)

