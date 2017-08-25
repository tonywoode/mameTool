'use strict'

const readline = require(`readline`)
const intoStream = require('into-stream')
const stream = require('stream')

const mockMfmTextFile =
`005
10yard
11beat
1941
1942
1943
1943kai
1943mii
1944
1945kiii
19xx
1on1gov
2020bb
20pacgal
30test
39in1
3countb
3in1semi
3on3dunk
3stooges
3wonders
40love
4dwarrio
4enraya
4in1
4in1boot
64street
720`

const mockMfmTextFileStream = intoStream(mockMfmTextFile)

    const gameList = []
    const rl = readline.createInterface({ input: mockMfmTextFileStream})
    rl.on( 'line', (line) => gameList.push(line) )
    rl.on( `close`, () => console.log(gameList))
//    it(`should represent a stream of line-separated (platform agnostic) strings as an array of game names`)
//describe(`mfmReader`, () => {
//
//  describe(`#deserialiseList`, () => {
//    //const gameList = []
//    //const rl = readline.createInterface({ input: mockMfmTextFileStream})
//    //rl.on( 'line', (line) => gameList.push(line) )
//    it(`should represent a stream of line-separated (platform agnostic) strings as an array of game names`)
//    expect(gameList.to.deep.equal([]) )
//  })
//})
