const fs               = require(`fs`)
const intoStream       = require('into-stream')

const iniReader = require('../src/iniReader.js')

const mockIni = 
`;; a mock ini file ;;

;; with two comments up top ;;

[NPlayers]
005=2P alt
100lions=???
10yard=2P alt
10yard85=2P alt
10yardj=2P alt
11beat=2P sim
1292apvs=Non-arcade
136094_0072=Device
136095_0072=Device
1392apvs=Non-arcade
18w=1P`

describe('iniReader', () => {
    it('should parse my ini into json and return it to me', () => {
      const ini = iniReader(mockIni)
        return expect(ini).to.not.be.null
  })
})
