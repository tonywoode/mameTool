'use strict'

const { sublist, doesPropHaveThisValue, removeBool, keepBool
  , getUniqueProps, keepProp, removeProp, makeFilteredJson } = require(`../../src/arcade/filterMameJson.js`)

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
    it(`when passed a path,value and object, tell me an existing KV is true`, () => {
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
  describe(`#removeBool`, () => {
    it(`when passed a valid boolean filter, returns a list of objects that don't have that key`, () => {
    const removeMess = removeBool([`mess`])(mockSystems)
      expect(removeMess).to.have.lengthOf(1)
      expect(removeMess[0][`mess`]).to.be.undefined
    })
  
    it(`also filters out keys where the value is truthy, not just equal to true`, () => {
      const removeCloneof = removeBool([`cloneof`])(mockSystems)
      expect(removeCloneof).to.have.lengthOf(1)
      expect(removeCloneof[0][`cloneof`]).to.be.undefined
    })
  
    it(`when passed a nested boolean filter, returns a list of parent objects that don't have that key`, () => {
      const removeNestedProp = removeBool([`display`, `testProp`])(mockSystems)
      expect(removeNestedProp).to.have.lengthOf(1)
      expect(removeNestedProp[0][`display`][`testProp`]).to.be.undefined
    })

  })

   describe(`#keepBool`, () => {
    it(`when passed a valid boolean filter, returns a list of only the objects that have that key`, () => {
    const keepMess = keepBool([`mess`])(mockSystems)
      expect(keepMess).to.have.lengthOf(1)
      expect(keepMess[0][`mess`]).to.be.true
    })
  
    it(`also keeps keys where the value is truthy, not just equal to true`, () => {
      const keepCloneof = keepBool([`cloneof`])(mockSystems)
      expect(keepCloneof).to.have.lengthOf(1)
      expect(keepCloneof[0][`cloneof`]).to.equal(`anything`)
    })
  
    it(`when passed a nested boolean filter, returns a list of only the parent objects which have that key`, () => {
      const keepNestedProp = keepBool([`display`, `testProp`])(mockSystems)
      expect(keepNestedProp).to.have.lengthOf(1)
      expect(keepNestedProp[0][`display`][`testProp`]).to.be.true
    })

  })

  describe(`#getUniqueProps`, () => {
    it(`produces a unique list of properties for a key`, () => {
      expect(getUniqueProps("genre")(mockSystems)).to.deep.equal([ 'Maze', 'Game Console' ])
    })
  })
  
  describe(`#getUniqueProps`, () => {
    it(`when given a non-existent key, retruns an empty set (not undefined)`, () => {
      expect(getUniqueProps("somethingSilly")(mockSystems)).to.deep.equal(new Array)
    })
  })

  describe(`#keepProp`, () => {
    it(`keeps only games which have a string property of a key`, () => {
      const genreToKeep = `Maze` 
      //console.log(keepProp(["genre"], genreToLose, mockSystems))
      const onlyMazeGenre = keepProp(["genre"], genreToKeep)(mockSystems)
      expect(onlyMazeGenre).to.have.lengthOf(1)
      expect(onlyMazeGenre[0][`genre`]).to.equal(`Maze`)
  
    })
  
    it(`keep only games where some subobject has a string property of a key`, () => {
      const propToKeep = `megadriv` 
      const keepMegaDisplay = keepProp([`display`, `tag`], propToKeep)(mockSystems)
      expect(keepMegaDisplay).to.have.lengthOf(1)
      expect(keepMegaDisplay[0][`display`][`tag`]).to.equal(`megadriv`)
    })

   it(`keeps only games which have a regex property of a key`, () => {
      const regexToKeep = /.*Console/
      const noGamesConsoleGenre = keepProp([`genre`], regexToKeep)(mockSystems)
      expect(noGamesConsoleGenre).to.have.lengthOf(1)
      expect(noGamesConsoleGenre[0][`genre`]).to.equal(`Game Console`)
    })

  })

  describe(`#removeProp`, () => {
    it(`removes games which have a string property of a key`, () => {
      const genreToLose = "Maze" 
      const noMazeGenre = removeProp([`genre`], genreToLose)(mockSystems)
      expect(noMazeGenre).to.have.lengthOf(1)
      expect(noMazeGenre[0][`genre`]).to.equal(`Game Console`)
    })
  
    it(`removes games where some subobject has a string property of a key`, () => {
      const propToLose = "megadriv" 
      const loseMegaDisplay = removeProp([`display`, `tag`], propToLose)(mockSystems)
      expect(loseMegaDisplay).to.have.lengthOf(1)
      expect(loseMegaDisplay[0][`display`][`tag`]).to.equal(`screen`)
    })
  
    it(`removes games which have a regex property of a key`, () => {
      const regexToLose = /.*Console/
      const noGamesConsoleGenre = removeProp([`genre`], regexToLose)(mockSystems)
      expect(noGamesConsoleGenre).to.have.lengthOf(1)
      expect(noGamesConsoleGenre[0][`genre`]).to.equal(`Maze`)
    })

  })

  describe(`#sublist`, () => {
    it(`routes a call to remove all Maze games to the approprtiate removeProp function`, () => {
      const genreToLose = "Maze" 
      const noMazeGenre = sublist(`remove`, [`genre`], genreToLose)(mockSystems)
      expect(noMazeGenre).to.have.lengthOf(1)
      expect(noMazeGenre[0][`genre`]).to.equal(`Game Console`)
    })
    
    it(`routes a call to remove all Mess games to the appropriate removeBool function`, () => {
      const removeMess = sublist(`remove`, [`mess`] )(mockSystems)
      expect(removeMess).to.have.lengthOf(1)
      expect(removeMess[0][`mess`]).to.be.undefined
    })

    it(`routes a call to keep all mess games to the appropriate keepBool function`, () => {
      const keepMess = sublist(`keep`, [`mess`])(mockSystems)
      expect(keepMess).to.have.lengthOf(1)
      expect(keepMess[0][`mess`]).to.be.true
    })

    //lets also test a nested prop
    it(`routes a call to keep a nested display property to the appropriate keepProp function`, () => {
      const propToKeep = `megadriv` 
      const keepMegaDisplay = sublist(`keep`, [`display`, `tag`], propToKeep)(mockSystems)
      expect(keepMegaDisplay).to.have.lengthOf(1)
      expect(keepMegaDisplay[0][`display`][`tag`]).to.equal(`megadriv`)
    })

    it(`throws if you ask for a sublist operation but give an incorrect operation type`, () => {
      expect( () => sublist(`boom`, [`display`, `tag`], `fakeString`)(mockSystems))
        .to.throw(`options for sublist filter: keep|remove; you called boom`) 
    })

  })

  describe(`#makeFilteredJson`, () => {
    it(`applies a remove prop filter array to a json and returns the filtered json`, () => {
      const filterArr = [ 
        { name: `test`, type: `remove`, path: [`genre`], value: `Game Console` }
      ]
      const removeGamesConsole = (makeFilteredJson(filterArr)(mockSystems) )
      expect(removeGamesConsole).to.have.lengthOf(1)
      expect(removeGamesConsole[0][`genre`]).to.equal(`Maze`)
    })

    it(`applies a keep bool filter array to a json and returns the filtered json`, () => {
      const filterArr = [ 
        { name: `test`, type: `keep`, path: [`mess`] }
      ]
      const keepMess = (makeFilteredJson(filterArr)(mockSystems) )
      expect(keepMess).to.have.lengthOf(1)
      expect(keepMess[0][`mess`]).to.be.true
    })


  })


})
