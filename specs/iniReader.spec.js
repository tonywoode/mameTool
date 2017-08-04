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

const ini = iniReader(mockIni)

describe('iniReader', () => {
    it('when parsing my ini into json,return something to me', () => {
        return expect(ini).to.not.be.null
  })
    it(`when passed a setting for a key, return it as an object`, () => {
      return expect(ini.NPlayers[`10yard`]).to.equal(`2P alt`)
    })
})
