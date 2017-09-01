'use strict'

const {mfmReaderAsync, mfmFilter} = require(`../src/mfmReader.js`)

const intoStream = require('into-stream')
const stream = require('stream')

//must be line separated, template literals are great for that
const mockMfmTextFile =
`005
10yard
11beat
`

const mockMfmArray = [ `005`, `10yard`, `11beat` ]

const mockMameJson = [
	{
		call: "005",
		genre: "Maze",
	},
	{
		call: "100lions",
		genre: "Casino",
	},
	{
		call: "10yard",
		genre: "Sports",
	},
	{
		call: "10yard85",
		genre: "Sports",
	},
	{
		call: "10yardj",
		genre: "Sports",
	},
	{
		call: "11beat",
		genre: "Sports",
	}
]

const mockMfmTextFileStream = intoStream(mockMfmTextFile)

describe(`mfmReader`, () => {

  describe(`#mfmReaderAsync`, () => {
    it(`should represent a stream of line-separated (platform agnostic) strings as an array of game names`, () => {
    expect(mfmReaderAsync(mockMfmTextFileStream)).to.eventually.deep.equal([ '005', '10yard', '11beat' ]) 
    })
  })

  describe(`#mfmFilter`, () => {
    it(`when passed an array of mameNames, should filter a mameJson down to those entries`, () => {
      const mfmFilteredJson = mfmFilter(mockMfmArray)(mockMameJson)
      expect(mfmFilteredJson).to.have.lengthOf(3)
      expect(mfmFilteredJson[2][`call`]).to.equal(`11beat`)
    })
  })

})
