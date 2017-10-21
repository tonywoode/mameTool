'use strict'

const splits   = require('../../src/arcade/makeSplits.js')
const printRomdata = require('../../src/printRomdata.js')

const splitObject = [
    {name: `series`, value: 1}
  , {name: `genre`,  value: 0}
]

const tick        = splitObject[0]
const jsonKey     = tick.name
const outputDir   = `./deleteme`
const emu         = `mame` 
const winIconDir  = `F:\MAME\EXTRAs\Icons`
const devMode     = false

const romdataConfig = {emu, winIconDir, devMode}

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


describe(`makeSplits`, () => {
  describe(`#processSplit`, () => {

    let sandbox
    beforeEach( () => { sandbox = sinon.sandbox.create() } )
    afterEach(  () => { sandbox.restore() } )

    it(`should produce an expected foldername, omitting ntfs unsafe chars`, () => {
      sandbox.stub(printRomdata, `generateRomdata`).returns( ()=>{} )
      splits.processSplit(jsonKey, outputDir, romdataConfig)(mameJson)
      expect(printRomdata.generateRomdata.getCall(0).args[0]).to.equal(`./deleteme/series/18 Wheeler`)
      printRomdata.generateRomdata.restore()
    })
  
    it(`should pass a json to be printed that's been filtered by the approrpriate value`, () => {
      const mameJsonSpy = sandbox.spy() //curry  https://stackoverflow.com/a/46603828/3536094
      sandbox.stub(printRomdata, `generateRomdata`).returns(mameJsonSpy)
      splits.processSplit( jsonKey, outputDir, romdataConfig)(mameJson)
      expect(mameJsonSpy.getCall(0).args[0]).to.have.lengthOf(2)
      //get all series values
      const valuesOfSeriesKey = mameJsonSpy.getCall(0).args[0].map( game => game.series) 
      //make a unique array from them
      expect(Array.from(new Set(valuesOfSeriesKey))).to.have.lengthOf(1)
      printRomdata.generateRomdata.restore()
    })

  })
})

