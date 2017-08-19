const rewire = require("rewire")
const iniReader = rewire('../src/iniReader.js')
const { loadIni, parseIni, loadKVIni, loadBareIni, loadSectionIni } = iniReader

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

  describe(`#loadIni`, () => {
    iniReader.__set__("fs", { readFileSync: () => mockBareIni })
    const ini = loadIni(`bare`, `anything`)
    it(`routes an ini type to the correct function to handle it`, () => {
        return expect(ini[`005`]).to.be.true
    i})
    it(`throws on a non-existant ini type`, () => {
      //wrap throw in function - don't execute right away, give the test framework an opportunity to handle the error - stack 18925884
      return expect( () => loadIni(`fake`, `anything`)).to.throw(
        `Can't choose an ini type, you need to supply a first param of e.g."bare"/"kv"/"section"`)
    })
    
  })

  describe(`#parseIni`, () => {
    const ini = parseIni(mockKVIni)
    it(`when parsing my ini into json,return something to me`, () => {
        return expect(ini).to.not.be.null
    i})
    it(`when passed a setting for a key, return it as an object`, () => {
      return expect(ini.NPlayers[`10yard`]).to.equal(`2P alt`)
    })
    it(`when passed a section name with a dot in it, preserve the dot, rather than turn it into an object separator`, () => {
      return expect(ini[`NPlayersWithDot.`]).to.not.be.undefined
    })
  })

  describe(`#loadKVIni`, () => {
    it(`when passed a KV-style ini, treat it generically and hence return an expected kv`, () => {
      iniReader.__set__("fs", { readFileSync: () => mockKVIni })
      const kvIni = loadKVIni(`fakeName`, `NPlayers`)
      return expect(kvIni[`10yard`]).to.equal(`2P alt`)
    })
    it('throws if you ask for a kv ini converter without specifying the name of the section header ', () => {
      return expect( () => loadIni(`kv`, `anything`)).to.throw(`you didn't supply a section name`) 
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
