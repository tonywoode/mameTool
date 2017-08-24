'use strict'

const { rejectBool, getUniqueProps, filterProp } = require(`../src/filterMameJson.js`)

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

  it(`when passed a valid boolean filter, returns a list of objects that don't have that key`, () => {
    expect(rejectBool([`mess`], mockSystems)).to.have.lengthOf(1)
  })

  it(`when passed a nested boolean filter, returns a list of parent objects that don't have that key`, () => {
    expect(rejectBool([`display`, `testProp`], mockSystems)).to.have.lengthOf(1)
  })
  it(`produces a unique list of properties for a key`, () => {
    expect(getUniqueProps("genre", mockSystems)).to.deep.equal([ 'Maze', 'Game Console' ])
  })

  it(`filters out games which have a string property of a key`, () => {
    const genreToLose = "Maze" 
    //console.log(filterProp(["genre"], genreToLose, mockSystems))
    expect(filterProp(["genre"], genreToLose, mockSystems)).to.have.lengthOf(1)

  })

  it(`filters out games where some subobject has a string property of a key`, () => {
    const propToLose = "megadriv" 
    expect(filterProp([`display`, `tag`], propToLose, mockSystems)).to.have.lengthOf(1)

  })

})
