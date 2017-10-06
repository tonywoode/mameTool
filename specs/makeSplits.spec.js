'use strict'

const splits   = require('../src/makeSplits.js')
const printers = require('../src/printers.js')

const splitObject = [
    {name: `series`, value: 1}
  , {name: `genre`,  value: 0}
]

const tick        = splitObject[0]
const jsonKey     = tick.name
const outputDir   = `./deleteme`
const emu         = `mame` 
const winIconDir  = `F:\MAME\EXTRAs\Icons`
const devMode = false

const romdataConfig = {emu, winIconDir, devMode}

const json        = [
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
    it(`should produce an expected foldername, omitting ntfs unsafe chars`, () => {
      sinon.stub(printers, 'generateRomdata').returns( ()=>{} )
      splits.processSplit( jsonKey, outputDir, romdataConfig, json)
      expect(printers.generateRomdata.getCall(0).args[0]).to.equal(`./deleteme/series/18 Wheeler`)
      printers.generateRomdata.restore()
    })
  
    it(`should pass a json to be printed that's been filtered by the approrpriate value`, () => {
      //TODO: if above test fails, this will complain about re-wrapping, need before/after to work
      const mameJsonSpy = sinon.spy() //curry  https://stackoverflow.com/a/46603828/3536094
      sinon.stub(printers, 'generateRomdata').returns(mameJsonSpy)
      splits.processSplit( jsonKey, outputDir, romdataConfig, json)
      expect(mameJsonSpy.getCall(0).args[0]).to.have.lengthOf(2)
      //get all series values
      const valuesOfSeriesKey = mameJsonSpy.getCall(0).args[0].map( game => game.series) 
      //make a unique array from them
      expect(Array.from(new Set(valuesOfSeriesKey))).to.have.lengthOf(1)
      printers.generateRomdata.restore()
    })

  })
})

