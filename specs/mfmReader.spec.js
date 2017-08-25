'use strict'

const mfmReaderAsync = require(`../src/mfmReader.js`)

const intoStream = require('into-stream')
const stream = require('stream')

const mockMfmTextFile =
`005
10yard
11beat
`

const mockMfmTextFileStream = intoStream(mockMfmTextFile)

describe(`mfmReader`, () => {

  describe(`#deserialiseList`, () => {
    it(`should represent a stream of line-separated (platform agnostic) strings as an array of game names`, () => {
    expect(mfmReaderAsync(mockMfmTextFileStream)).to.eventually.deep.equal([ '005', '10yard', '11beat' ]) 
    })
  })

})
