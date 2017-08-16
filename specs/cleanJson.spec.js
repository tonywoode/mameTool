const {convertToBool, cleanKey, shortenSubObject} = require('../src/cleanJson.js')

const mockDollarList = [
  {
	call: "005",
	isbios: "no",
	isdevice: "no",
	ismechanical: "yes",
	system: "005",
	year: "1981",
	company: "Sega",
	display: {
		$: {
			tag: "screen",
			type: "raster",
			rotate: "270",
			width: "256",
			height: "224",
			refresh: "59.998138",
			pixclock: "5156000",
		},
		$name: "display"
	},
	control: {
		$: {
			type: "joy",
			player: "2",
			buttons: "1",
			ways: "4",
			reverse: "yes"
		},
		$name: "control"
	},
	status: "imperfect",
	savestate: "unsupported",
	arcade: true,
	arcadeNoBios: true,
	rating: "10 to 20 (Horrible)",
	category: "Maze / Shooter Small",
	catlist: "Maze / Shooter Small",
	genre: "Maze",
	language: "English",
	mamescore: true,
	players: "2P alt",
	version: "0.030"
  }
]

const mockCleanedDollarList = [
  {
	call: "005",
	isbios: false,
	isdevice: false,
	ismechanical: false,
	system: "005",
	year: "1981",
	company: "Sega",
	display: {
         height: "224",
         refresh: "59.998138",
         rotate: "270",
         tag: "screen",
         type: "raster",
         width: "256"
	},
	control: {
		type: "joy",
		player: "2",
		buttons: "1",
		ways: "4",
		reverse: false
	},
	status: "imperfect",
	savestate: "unsupported",
	arcade: true,
	arcadeNoBios: true,
	rating: "10 to 20 (Horrible)",
	category: "Maze / Shooter Small",
	catlist: "Maze / Shooter Small",
	genre: "Maze",
	language: "English",
	mamescore: true,
	players: "2P alt",
	version: "0.030"
  }
]

describe(`cleanJson`, () => {
  describe(`#convertToBool`, () => {
    const boolConvertedList = convertToBool(mockDollarList)
    it(`should remove any 'no' keys`, () => {
      return expect(boolConvertedList[0].isbios).to.equal(undefined)  
    })
    it(`should convert 'yes' values in a list to true`, () => {
      return expect(boolConvertedList[0].ismechanical).to.equal(true)     
    })
    it(`should convert 'no' values in a list to false in a nested object`, () => {
      return expect(boolConvertedList[0].control.$.reverse).to.equal(true)  
    })
  })

  describe(`#cleanKey`, () => {
   it(`should flatten $-style object key in a list (removing $ and $name keys)`, () => {
     const cleanedDollarList = cleanKey(`display`)(mockDollarList)
     return expect(cleanedDollarList[0].display).to.deep.equal( {
       height: "224",
       pixclock: "5156000",
       refresh: "59.998138",
       rotate: "270",
       tag: "screen",
       type: "raster",
       width: "256"
     })
   })
 })

  describe(`#shortenSubObject`, () => {
    it(`should remove the properties I decided weren't important to filtering roms from a sub object`, () => {
      const shortenedMockDisplayList = shortenSubObject(`display`)(mockCleanedDollarList)
      return expect(shortenedMockDisplayList[0].display).to.deep.equal( {
        tag: "screen",
        type: "raster",
        rotate: "270",
        width: "256",
        height: "224",
      })
    })
  })


})
