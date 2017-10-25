const {convertToBool, cleanKey, shortenSubObject, savestateToBool} = require('../../../src/scan/arcadeScan/cleanJson.js')

const mockDollarList = [
  {
	call: "005",
	isbios: "no",
	ismechanical: "yes",
	company: "Sega",
	display: {
		$: {
			width: "256",
			height: "224",
		},
		$name: "display"
	},
	control: {
		$: {
			type: "joy",
			player: "2",
			reverse: "yes"
		},
		$name: "control"
	},
	arcadeNoBios: true,
	rating: "10 to 20 (Horrible)",
	catlist: "Maze / Shooter Small",
	version: "0.030"
  }
]

const mockCleanedDollarList = [
  {
	call: "005",
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
         refresh: "59.998138",
	},
	savestate: "unsupported",
	arcadeNoBios: true,
	rating: "10 to 20 (Horrible)",
	mamescore: true,
	version: "0.030"
  }
]

const mockSavestate = [
  { savestate: "supported" },
  { savestate: "unsupported" }
]

describe(`cleanJson`, () => {
  describe(`#convertToBool`, () => {
    const boolConvertedList = convertToBool(mockDollarList)
    it(`should remove any 'no' keys`, () => {
      expect(boolConvertedList[0].isbios).to.equal(undefined)  
    })
    it(`should convert 'yes' values in a list to true`, () => {
      expect(boolConvertedList[0].ismechanical).to.equal(true)     
    })
    it(`should convert values in deeply nested objects in a list`, () => {
      expect(boolConvertedList[0].control.$.reverse).to.equal(true)  
    })
  })

  describe(`#cleanKey`, () => {
   it(`should flatten $-style object key in a list (removing $ and $name keys)`, () => {
     const cleanedDollarList = cleanKey(`display`)(mockDollarList)
     expect(cleanedDollarList[0].display).to.deep.equal( {
       height: "224",
       width: "256"
     })
   })
 })

  describe(`#shortenSubObject`, () => {
    it(`should remove the properties I decided weren't important to filtering roms from a sub object`, () => {
      const shortenedMockDisplayList = shortenSubObject(`display`)(mockCleanedDollarList)
      expect(shortenedMockDisplayList[0].display).to.deep.equal( {
        tag: "screen",
        type: "raster",
        rotate: "270",
        width: "256",
        height: "224",
      })
    })

    it(`shouldn't remove a property from the wrong subtree`, () => {
      const shortenedMockDisplayList = shortenSubObject(`display`)(mockCleanedDollarList)
      expect(shortenedMockDisplayList[0].control).to.deep.equal( {
         refresh: "59.998138"
      })
    })

  })

  describe(`#savestateToBool`, () => {
    it(`should change all 'supported' to true`, () => {
      const savestateFixed = savestateToBool(mockSavestate)
      expect(savestateFixed[0].savestate).to.be.true
      })

    it(`should remove all 'unsupported'`, () => {
      const savestateFixed = savestateToBool(mockSavestate)
      expect(savestateFixed[1].savestate).to.be.undefined
    })
  })

})
