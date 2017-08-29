'use strict'

const { doesPropHaveThisValue, rejectBool, filterBool, getUniqueProps, filterProp, removeProp } = require(`../src/filterMameJson.js`)

const mockSystems = [
	{
		call: "005",
		system: "005",
		year: "1981",
		company: "Sega",
		display: {
			tag: "screen",
			type: "raster",
			rotate: "270",
			width: "256",
			height: "224",
            testProp: true
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
		call: "32x",
        cloneof: "anything", 
		system: "Genesis with 32X (USA, NTSC)",
		year: "1994",
		company: "Sega",
		display: {
			tag: "megadriv",
			type: "raster",
			rotate: "0",
			width: "256",
			height: "224"
		},
		control: {
			type: "joy",
			player: "2",
			buttons: "7"
		},
		status: "preliminary",
		hasSoftwarelist: true,
		category: "Game Console",
		catlist: "Home Systems / Game Console",
		genre: "Game Console",
		mess: true,
		nplayers: "Non-arcade",
		version: "0.132"
	}
]
describe(`FilterMameJson`, () => {

  describe(`#doesPropHaveThisValue`, () => {
    it(`when passed an path,value and object, tell me an existing KV is true`, () => {
      expect(doesPropHaveThisValue(['year'], '1981')(mockSystems[0])).to.be.true
    })
  
    it(`when passed an path,value and object, tell me an non-existing KV is false`, () => {
      expect(doesPropHaveThisValue(['madeup'], 'rubbish')(mockSystems[0])).to.be.false
    })
  
    it(`when passed an path, regex and object, tell me a KV that matches that regex is true`, () => {
      expect(doesPropHaveThisValue(['year'], /198?/)(mockSystems[0])).to.be.true
    })
  
    it(`when passed an path, regex and object, tell me fasle when no KV matches the regex of the key's path`, () => {
      expect(doesPropHaveThisValue(['year'], /nonsense/)(mockSystems[0])).to.be.false
    })
  
  })

  // need to check both that there is only one object remaining, AND that its the right one
  describe(`#rejectBool`, () => {
    it(`when passed a valid boolean filter, returns a list of objects that don't have that key`, () => {
    const rejectMess = rejectBool([`mess`], mockSystems)
      expect(rejectMess).to.have.lengthOf(1)
      expect(rejectMess[0][`mess`]).to.be.undefined
    })
  
    it(`also filters out keys where the value is truthy, not just equal to true`, () => {
      const rejectCloneof = rejectBool([`cloneof`], mockSystems)
      expect(rejectCloneof).to.have.lengthOf(1)
      expect(rejectCloneof[0][`cloneof`]).to.be.undefined
    })
  
    it(`when passed a nested boolean filter, returns a list of parent objects that don't have that key`, () => {
      const rejectNestedProp = rejectBool([`display`, `testProp`], mockSystems)
      expect(rejectNestedProp).to.have.lengthOf(1)
      expect(rejectNestedProp[0][`display`][`testProp`]).to.be.undefined
    })

  })

   describe(`#filterBool`, () => {
    it(`when passed a valid boolean filter, returns a list of only the objects that have that key`, () => {
    const filterMess = filterBool([`mess`], mockSystems)
      expect(filterMess).to.have.lengthOf(1)
      expect(filterMess[0][`mess`]).to.be.true
    })
  
    it(`also keeps keys where the value is truthy, not just equal to true`, () => {
      const filterCloneof = filterBool([`cloneof`], mockSystems)
      expect(filterCloneof).to.have.lengthOf(1)
      expect(filterCloneof[0][`cloneof`]).to.equal(`anything`)
    })
  
    it(`when passed a nested boolean filter, returns a list of only the parent objects which have that key`, () => {
      const filterNestedProp = filterBool([`display`, `testProp`], mockSystems)
      console.log(filterNestedProp)
      expect(filterNestedProp).to.have.lengthOf(1)
      expect(filterNestedProp[0][`display`][`testProp`]).to.be.true
    })

  })

  describe(`#getUniqueProps`, () => {
    it(`produces a unique list of properties for a key`, () => {
      expect(getUniqueProps("genre", mockSystems)).to.deep.equal([ 'Maze', 'Game Console' ])
    })

  })

  describe(`#filterProp`, () => {
    it(`keeps only games which have a string property of a key`, () => {
      const genreToKeep = "Maze" 
      //console.log(filterProp(["genre"], genreToLose, mockSystems))
      expect(filterProp(["genre"], genreToKeep, mockSystems)[0][`genre`]).to.equal(`Maze`)
  
    })
  
    it(`keep only games where some subobject has a string property of a key`, () => {
      const propToKeep = "megadriv" 
      const keepMegaDisplay = filterProp([`display`, `tag`], propToKeep, mockSystems)
      expect(keepMegaDisplay).to.have.lengthOf(1)
      expect(keepMegaDisplay[0][`display`][`tag`]).to.equal(`megadriv`)
    })

   it(`keeps only games which have a regex property of a key`, () => {
      const regexToLose = /.*Console/
      const noGamesConsoleGenre = filterProp([`genre`], regexToLose, mockSystems)
      expect(noGamesConsoleGenre).to.have.lengthOf(1)
      expect(noGamesConsoleGenre[0][`genre`]).to.equal(`Game Console`)
    })

  })

  describe(`#removeProp`, () => {
    it(`removes games which have a string property of a key`, () => {
      const genreToLose = "Maze" 
      const noMazeGenre = removeProp([`genre`], genreToLose, mockSystems)
      expect(noMazeGenre).to.have.lengthOf(1)
      expect(noMazeGenre[0][`genre`]).to.equal(`Game Console`)
    })
  
    it(`removes games where some subobject has a string property of a key`, () => {
      const propToLose = "megadriv" 
      const loseMegaDisplay = removeProp([`display`, `tag`], propToLose, mockSystems)
      expect(loseMegaDisplay).to.have.lengthOf(1)
      expect(loseMegaDisplay[0][`display`][`tag`]).to.equal(`screen`)
    })
  
    it(`removes games which have a regex property of a key`, () => {
      const regexToLose = /.*Console/
      const noGamesConsoleGenre = removeProp([`genre`], regexToLose, mockSystems)
      expect(noGamesConsoleGenre).to.have.lengthOf(1)
      expect(noGamesConsoleGenre[0][`genre`]).to.equal(`Maze`)
    })

  })

})
