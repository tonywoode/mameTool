'use strict'

const readline = require(`readline`)
const intoStream = require('into-stream')
const stream = require('stream')

const mockMfmTextFile =
`005
10yard
11beat
`

const mockMfmTextFileStream = intoStream(mockMfmTextFile)

const gameList = []
const rl = readline.createInterface({ input: mockMfmTextFileStream})

const gameListAsync = new Promise((resolve, reject) => {
    rl.on('line',  line  => gameList.push(line) )
    rl.on('error', error => reject(error) )
    rl.on('close', ()    => resolve(gameList) )
})



describe(`mfmReader`, () => {

  describe(`#deserialiseList`, () => {
    it(`should represent a stream of line-separated (platform agnostic) strings as an array of game names`, () => {
    expect(gameListAsync).to.eventually.deep.equal([ '005', '10yard', '11beat' ]) 
    })
  })

})
