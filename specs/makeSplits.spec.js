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
const fullLogging = false
const json        = [
  {
  	"call": "18wheelr",
  	"romof": "naomi",
  	"system": "18 Wheeler (deluxe) (Rev A)",
  	"year": "2000",
  	"company": "Sega",
  	"display": {
  		"tag": "screen",
  		"type": "raster",
  		"rotate": "0",
  		"width": "640",
  		"height": "480"
  	},
  	"control": {
  		"type": "pedal",
  		"minimum": "0",
  		"maximum": "65280"
  	},
  	"status": "preliminary",
  	"arcade": true,
  	"arcade_NOBIOS": true,
  	"category": "Driving",
  	"catlist": "Driving",
  	"genre": "Driving",
  	"languages": "Japanese",
  	"nplayers": "1P",
  	"series": "18 Wheeler.:*<>|",
  	"version": "0.134u4"
  },
  {
  	"call": "18wheels",
  	"cloneof": "18wheelr",
  	"romof": "18wheelr",
  	"system": "18 Wheeler (standard)",
  	"year": "2000",
  	"company": "Sega",
  	"display": {
  		"tag": "screen",
  		"type": "raster",
  		"rotate": "0",
  		"width": "640",
  		"height": "480"
  	},
  	"control": {
  		"type": "pedal",
  		"minimum": "0",
  		"maximum": "65280"
  	},
  	"status": "preliminary",
  	"arcade": true,
  	"arcade_NOBIOS": true,
  	"category": "Driving",
  	"catlist": "Driving",
  	"genre": "Driving",
  	"languages": "Japanese",
  	"nplayers": "1P",
  	"series": "18 Wheeler\\.:*\"<>|",
  	"version": "0.144"
  },
]

describe(`makeSplits`, () => {

  describe(`#processSplit`, () => {
    before( () => sinon.stub(printers, 'generateRomdata').returns( ()=>{} ) )

    it(`should produce an expected foldername, omitting ntfs unsafe chars`, () => {
      splits.processSplit( jsonKey, outputDir, emu, winIconDir, fullLogging, json)
      expect(printers.generateRomdata.getCall(0).args[1]).to.equal(`./deleteme/series/18 Wheeler`)
    })

    after( () =>  printers.generateRomdata.restore() )
  })
})

