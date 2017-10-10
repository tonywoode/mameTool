'use strict'

const fs            = require('fs') //to get methods back when fs itself is rewired

const mock          = require('mock-fs')
const rewire        = require('rewire')
const mkdirp        = require('mkdirp')
const printers      = rewire('../src/printers.js')
const makeRomdata   = rewire('../src/makeRomdata.js')

const emu           = `another retroarch emulator` 
const winIconDir    = `F:\MAME\EXTRAs\Icons`
const devMode       = false
const romdataConfig = {emu, winIconDir, devMode}

const mameJson      = [
  {
    call: "005",
    series: "gamesThatBeginWithNumbers",
    system: "005",
    year: "1981",
    company: "Sega",
    display: {
      tag: "screen",
      type: "raster",
      rotate: "270",
      width: "256",
      height: "224"
    },
    control: {
      type: "joy",
      player: "2",
      buttons: "1"
    },
    status: "imperfect",
    arcade: true,
    arcade_NOBIOS: true,
    bestgames: "10 to 20 (Horrible)",
    category: "Maze / Shooter Small",
    catlist: "Maze / Shooter Small",
    genre: "Maze",
    languages: "English",
    mamescore: true,
    nplayers: "2P alt",
    version: "0.030"
  },
  {
    call: "100lions",
    series: "gamesThatBeginWithNumbers",
    romof: "aristmk6",
    system: "100 Lions (10219211, NSW/ACT)",
    year: "2006",
    company: "Aristocrat",
    display: {
      tag: "screen",
      type: "raster",
      rotate: "0",
      width: "640",
      height: "480"
    },
    status: "preliminary",
    arcade: true,
    arcade_NOBIOS: true,
    category: "Casino / Reels",
    catlist: "Casino / Reels",
    genre: "Casino",
    languages: "English",
    nplayers: "???",
    version: "0.173"
  }
]

describe(`printers`, () => {

  describe(`#printJson`, () => {
    const testPath = `this directory does not exist here`
    const testJsonName = `anything`

    it(`should Ymake a directory if the file doesn't exist`, () => {
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

    it(`should return the object passed in, so the fn can be chained`, () => {
      printers.__with__({
          fs: { 
              existsSync:  path => true 
            , writeFileSync: path => true
          }
        , mkdirp: path => true
      })( () => {
        const result = printers.printJson(testPath, `anything`)(mameJson)
        expect(result).to.equal(mameJson)
      })
    })

  })

  describe(`#printIntermediaryIconFiles`, () => {
    beforeEach( () => { 
      mock( { 'path/to/fake/dir': {} } ) //create a little file system using mockfs
    ,  printers.printIntermediaryIconFiles(`./path/to`, `mame`)(`./path/to/fake/dir`)
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
      sandbox.stub(printers, `printRomdataFolder`).returns( ()=>{} )
      //sandbox.stub(makeRomdata, `makeRomdata`).returns( ()=>{} ) //because sinon needs an object+method, we'd have makeRomdata.makeRomata in caller
      const revert = printers.__set__(`makeRomdata`, ()=> ()=> {`Romdata text`} ) //so let's rewire instead (its a curried callsite)
      printers.generateRomdata(`./randomOutputDir`, romdataConfig)(`anything`) 
      expect(printers.printRomdataFolder.getCall(0).args[2]).to.equal(`RetroArch`)
      revert()
    })
  })

})

