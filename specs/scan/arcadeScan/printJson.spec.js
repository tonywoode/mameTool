'use strict'

const fs            = require('fs') //to get methods back when fs itself is rewired
const rewire        = require('rewire')
const printJson     = rewire('../../../src/scan/arcadeScan/printJson.js')
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
describe(`printJson`, () => {
  const testDir = `this directory does not exist here`
  const testPath = `${testDir}/anything`

  it(`should make a directory if the file doesn't exist`, () => {
    printJson.__with__({
        fs: { 
            existsSync:  () => false 
          , writeFileSync: (path, json) => ()=>{}
        } 
      , mkdirp: path => expect(path).to.equal(`this directory does not exist here`)
    })( () => printJson(testPath)(mameJson) ) //__with__ requires fn
  })

  it(`should throw an exception if it can't write the json because the ouptut dir doesn't exist`, () => {
    printJson.__with__({
        fs: { 
            existsSync:  path => true 
          , writeFileSync: fs.writeFileSync  //TODO: how to avoid having to do this?
        }
      , mkdirp: path => true
    })( () => expect(printJson(testPath)).to.throw( //note no curry
      `ENOENT: no such file or directory, open '${testPath}'`
    ))
  })

  it(`should return the object passed in, so the fn can be chained`, () => {
    printJson.__with__({
        fs: { 
            existsSync:  path => true 
          , writeFileSync: path => true
        }
      , mkdirp: path => true
    })( () => {
      const result = printJson(testPath)(mameJson)
      expect(result).to.equal(mameJson)
    })
  })

})
