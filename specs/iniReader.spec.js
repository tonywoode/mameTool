const rewire = require("rewire")
const iniReader = rewire('../src/iniReader.js')
const { parseIni, loadKVIni, loadBareIni, loadSectionIni } = iniReader

const mockKVIni = 
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
18w=1P
[NPlayersWithDot.]
`

const mockBareIni =
` [FOLDER_SETTINGS]
RootFolderIcon mame
SubFolderIcon folder

;; ARCADE_NOBIOS.ini 0.187 / 28-jun-17 / MAME 0.187 ;;

[ROOT_FOLDER]
005
100lions
10yard
10yard85
10yardj`

const mockSectionIni =
`[FOLDER_SETTINGS]
RootFolderIcon mame
SubFolderIcon folder

;; LANGUAGES.ini 0.187 / 30-jun-17 / MAME 0.187 ;;

[ROOT_FOLDER]

[Brazilian Portuguese]
bazookabr
bsuertev
indianbtbr
invadpt2br`

describe(`iniReader`, () => {

  describe(`#parseIni`, () => {
    const ini = parseIni(mockKVIni)
    it('when parsing my ini into json,return something to me', () => {
        return expect(ini).to.not.be.null
    i})
    it(`when passed a setting for a key, return it as an object`, () => {
      return expect(ini.NPlayers[`10yard`]).to.equal(`2P alt`)
    })
    it('when passed a section name with a dot in it, preserve the dot, rather than turn it into an object separator', () => {
      return expect(ini[`NPlayersWithDot.`]).to.not.be.undefined
    })
  })

  describe(`#loadKVIni`, () => {
    it(`when passed a KV-style ini, treat it generically and hence return an expected kv`, () => {
      iniReader.__set__("fs", { readFileSync: () => mockKVIni })
      const kvIni = loadKVIni(`fakeName`, `NPlayers`)
      return expect(kvIni[`10yard`]).to.equal(`2P alt`)
    })
  })

  describe(`#loadBareIni`, () => {
    it(`when passed a Bare-style ini, treat it generically and hence return an expected kv`, () => {
    iniReader.__set__("fs", { readFileSync: () => mockBareIni })
    const bareIni = loadBareIni(`fakeName` )
    return expect(bareIni[`10yard`]).to.equal(true)
    })
  })

  describe(`#loadSectionIni`, () => {
    it(`when passed a Section-style ini, treat it generically and hence return an expected kv`, () => {
    iniReader.__set__("fs", { readFileSync: () => mockSectionIni })
    const sectionIni = loadSectionIni(`fakeName`)
    return expect(sectionIni[`bazookabr`]).to.equal(`Brazilian Portuguese`)
    })
  })


})
