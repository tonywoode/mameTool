const mock          = require('mock-fs')
const rewire = require(`rewire`)
const iniReader = rewire('../../../src/scan/arcadeScan/iniReader.js')
const { getIniPath, loadIni, parseIni, loadGenericIni, loadKVIni, loadBareIni, loadSectionIni } = iniReader
const path = require('path')
const Maybe             = require('data.maybe')
const { Just, Nothing } = Maybe

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

  beforeEach( () => {
    mock( { //create a little file system using mockfs
      'mameFoldersDir': {
        'firstIni.ini': '',
        'holdsTheSecondIni': {
          'secondIni.ini': '',
          'aSecondFileInThisFolder.ini': ''
        },
        'thirdIni': {
          'thirdIni.ini': ''
        },
        'randomFolderName': {
          'nestedFolder': {
          'fourthIni.ini': ''
          }
        }
      } 
    }) 
  } )

  afterEach( () => {
    mock.restore()
  })

  describe.only(`#getIniPath`, () => {
    it(`errors if no ini is provided`, () => expect(getIniPath('', 'anything')).to.deep.equal(Nothing()))
    it(`errors if no folder is provided`, () => expect( getIniPath('anything', '')).deep.equal(Nothing()))
      const inisFolder = 'mameFoldersDir'
    it(`finds an ini by name in the root mame extras 'folders' folder`, () => {
      const ini = 'firstIni.ini'
      expect(getIniPath(ini, inisFolder )).to.deep.equal(Just(path.join(inisFolder, ini)))
    })

    it(`finds an ini by name in a subdir of the 'folders' folder, named after the 'foldername' key supplied in inis.json`, () => {
      const ini = 'secondIni.ini'
      const folderName = "holdsTheSecondIni"
      expect(getIniPath(ini, inisFolder, folderName)).to.deep.equal(Just(path.join(inisFolder, folderName, ini)) )


    })
    it(`finds an ini by name in a subdir of the 'folders' folder, even though there was no 'foldername' key supplied in inis.json`, () => {
      const ini = 'thirdIni.ini'
      expect(getIniPath(ini, inisFolder)).to.deep.equal(Just(path.join(inisFolder, ini.replace(/.ini$/i, ''), ini)))
    })

    it(`finds an ini by name in a subdir of a subdir of the 'folders' folder, whether of not there was a 'foldername' key supplied in inis.json`, () => {
      //aka "the one where we use the 'file' module"
      const ini = 'fourthIni.ini'
      const randomFolder = 'randomFolderName'
      const nestedFolder = 'nestedFolder'
      expect(getIniPath(ini, inisFolder)).to.deep.equal(Just(path.join(inisFolder, randomFolder, nestedFolder, ini)))

    })
    it(`always prefers an ini higher up the directory tree ie: breadth not depth`)
    it(`finds on exact name not regex`)
    it(`returns a nothing if the file doesn't exist in the mame extras 'folders' folder`)
  })
  describe(`#loadIni`, () => {
    const revert = iniReader.__set__(`fs`, { readFileSync: () => mockBareIni })
    const ini = loadIni(`randomdir`, { iniName: `anything`, iniType: `bare`})
    revert()
    it(`routes an ini type to the correct function to handle it`, () => {
      expect(ini[`005`]).to.be.true
    })
    it(`throws on a non-existant ini type`, () => {
      //wrap throw in function - don't execute right away, give the test framework an opportunity to handle the error - stack 18925884
      expect( () => loadIni(`randomdir`, { iniName: `anything`, iniType: `fake`}) ).to.throw(
        `iniType "fake" not defined, you need to supply a first param of e.g."bare"/"kv"/"section"`)
    })
    
  })

  describe(`#parseIni`, () => {
    const ini = parseIni(mockKVIni)
    it(`when parsing my ini into json,return something to me`, () => {
      expect(ini).to.not.be.null
    })
    it(`when passed a setting for a key, return it as an object`, () => {
      expect(ini.NPlayers[`10yard`]).to.equal(`2P alt`)
    })
    it(`when passed a section name with a dot in it, preserve the dot, rather than turn it into an object separator`, () => {
      expect(ini[`NPlayersWithDot.`]).to.not.be.undefined
    })
  })


  describe(`#loadGenericIni`, () => {
    it(`when asked to load an ini that doesn't exist at the output, print a console error`, () => {
      sinon.stub(console, 'error');
      loadGenericIni(`randomdir`, `fakefile`)
      expect( console.error.calledOnce ).to.be.true;
    })

    const realConsoleError = console.error // its disconcerting to have console errors when npm test runs - stack question 29469213
    it(`when asked to load an ini that doesn't exist at the output dir, return an empty object`, () => {
      console.error = content => ``
      expect(loadGenericIni(`randomdir`, `fakefile`)).to.deep.equal( ({}) )
    })
    console.error = realConsoleError
  })


  describe(`#loadKVIni`, () => {
    it(`when passed a KV-style ini, treat it generically and hence return an expected kv`, () => {
      iniReader.__set__(`fs`, { readFileSync: () => mockKVIni })
      const kvIni = loadKVIni(`randomdir`, `fakeName`, `NPlayers`)
      expect(kvIni[`10yard`]).to.equal(`2P alt`)
    })
    it(`throws if you ask for a kv ini converter without specifying the name of the section header`, () => {
      expect( () => loadIni(`randomdir`, {iniName: `anything`, iniType: `kv`}) ).to.throw(`you didn't supply a section name`) 
    })
  })

  describe(`#loadBareIni`, () => {
    it(`when passed a Bare-style ini, treat it generically and hence return an expected kv`, () => {
    iniReader.__set__(`fs`, { readFileSync: () => mockBareIni })
    const bareIni = loadBareIni(`randomdir`, `fakeName` )
    expect(bareIni[`10yard`]).to.equal(true)
    })
  })

  describe(`#loadSectionIni`, () => {
    it(`when passed a Section-style ini, treat it generically and hence return an expected kv`, () => {
    iniReader.__set__(`fs`, { readFileSync: () => mockSectionIni })
    const sectionIni = loadSectionIni(`randomdir`, `fakeName`)
    expect(sectionIni[`bazookabr`]).to.equal(`Brazilian Portuguese`)
    })
  })


})
