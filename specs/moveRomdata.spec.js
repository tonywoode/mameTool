const makeRomdata = require('../src/makeRomdata.js')

const mockJson  = JSON.parse( 
`[
	{
		"call": "005",
		"system": "005",
		"year": "1981",
		"company": "Sega",
		"status": "imperfect"
	},
	{
		"call": "100lions",
		"system": "100 Lions (10219211, NSW/ACT)",
		"year": "2006",
		"company": "Aristocrat",
		"status": "preliminary"
	},
	{
		"call": "10yard",
		"system": "10-Yard Fight (World, set 1)",
		"year": "1983",
		"company": "Irem",
		"status": "good"
	}
]`

)
describe('makeRomdata', () => {
    it('should accept a mame json string and turn it into romdata', () => {
      const systems = makeRomdata(mockJson)
      return expect(systems).to.not.be.null
    })
  })
