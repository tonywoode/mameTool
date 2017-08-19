'use strict'

const { getEntryFromIni, fillFromIni } = require(`../src/fillFromIni.js`)

const mockJson = [
     {
		call: "005",
		system: "005",
		year: "1981",
		company: "Sega",
		status: "imperfect"
	},
	{
		call: "100lions",
		system: "100 Lions (10219211, NSW/ACT)",
		year: "2006",
		company: "Aristocrat",
		status: "preliminary"
	},
	{
		call: "10yard",
		system: "10-Yard Fight (World, set 1)",
		year: "1983",
		company: "Irem",
		status: "good"
    }
]

const mockNPlayersIni = { 
     "005": "2P alt",
     "100lions": "???",
     "10yard": "2P alt",
     "10yard85": "2P alt",
     "10yardj": "2P alt",
     "11beat": "2P sim",
     "1292apvs": "Non-arcade",
     "136094_0072": "Device",
     "136095_0072": "Device",
     "1392apvs": "Non-arcade",
     "18w": "1P" 
}

const mockFalseNPlayersIni = { 
     lalala: "2P alt",
     wowowo: "???"
}

describe('fillFromIni', () => {

  describe('#getEntryFromIni', () => {
    const loadedGetEntryFromIni = getEntryFromIni(mockNPlayersIni) 
    it('should be falsey if the game isnt found', () => {
      return expect(loadedGetEntryFromIni(`123456789`)).to.not.be.ok
    })
    it(`should give me the value for a valid key in the ini`, () => {
      return expect(loadedGetEntryFromIni(`1292apvs`)).to.equal(`Non-arcade`)
    })
  })

  describe('#fillFromIni', () => {
    it('should return the same object if no matches are found in the ini', () => {
      return expect(fillFromIni(`players`, mockFalseNPlayersIni)(mockJson)).to.deep.equal(mockJson)
    })
    it(`should fill in the number of players of a key from the input`, () => {
      const typeOfIni = `players`
      const newJson = fillFromIni(typeOfIni, mockNPlayersIni)(mockJson)
      return expect(newJson[0][typeOfIni]).to.equal(`2P alt`)
    })
  })

})
