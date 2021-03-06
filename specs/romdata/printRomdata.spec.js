'use strict'

const fs            = require('fs') //to get methods back when fs itself is rewired

const mock          = require('mock-fs')
const rewire        = require('rewire')
const printRomdata  = rewire('../../src/romdata/printRomdata.js')

const emu           = `another retroarch emulator` 
const winIconDir    = `F:\MAME\EXTRAs\Icons`
const devMode       = false
const settings      = { isItRetroArch : true }

describe(`printRomdata`, () => {
  describe(`#printIntermediaryIconFiles`, () => {
    beforeEach( () => { 
      mock( { 'path/to/fake/dir': {} } ) //create a little file system using mockfs
    ,  printRomdata.printIntermediaryIconFiles(`./path/to`, `mame`)(`./path/to/fake/dir`)
    })

    it(`should print icon files in intermediary folders`, () => {
      expect(fs.readdirSync('./path/to/fake') ).to.include(`folders.ini`)   
    })

    it(`should not try and print an icon config file above the root folder`, () => {
      expect(fs.readdirSync('./path/to') ).to.not.include(`folders.ini`)   
    })

    afterEach( () => {  mock.restore() })
  })

  describe(`#generateRomdata`, () => {

    let sandbox
    beforeEach( () => { sandbox = sinon.sandbox.create() } )
    afterEach(  () => { sandbox.restore() } )

    it(`should determine which icon to use based on the emulator name`, () => {
      sandbox.stub(printRomdata, `printRomdataFolder`).returns( ()=>{} )
      //sandbox.stub(makeRomdata, `makeRomdata`).returns( ()=>{} ) //because sinon needs an object+method, we'd have makeRomdata.makeRomata in caller
      const revert = printRomdata.__set__(`makeRomdata`, ()=> ()=> {`Romdata text`} ) //so let's rewire instead (its a curried callsite)
      printRomdata.generateRomdata(`./randomOutputDir`, settings)(`anything`) 
      expect(printRomdata.printRomdataFolder.getCall(0).args[2]).to.equal(`RetroArch`)
      revert()
    })
  })

})

