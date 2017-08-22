const iniFlattener = require('../src/iniFlattener.js')

const mockIni = { 
  '3D': 
   { metamaq2: true, 
     replica1: true },
  'Arcade BIOS':
   { '3dobios': true },
  'Rhythm / Misc.':
   { wontmuch: true },
  'Tabletop / Othello * Mature *':
   { alphaone: true,
     warpwarpr2: true }
}

const ini = iniFlattener(mockIni)
describe('iniFlattener', () => {
    it(`when flattening my ini file,return something to me`, () => {
      expect(ini).to.not.be.null
  })
    it(`should convert the value of a game in a section to be the name of the section`, () => {
      expect(ini.metamaq2).to.equal(`3D`)
    })

    it(`should convert sections to values, even if they have spaces in them`, () => {
      expect(ini[`3dobios`]).to.not.be.undefined
    })

    it(`should convert sections to values, even if they have dots in them`, () => {
      expect(ini.wontmuch).to.equal(`Rhythm / Misc.`)
    })
  
    it(`should convert sections to values, even if they have multiple stars in them`, () => {
      expect(ini.alphaone).to.equal(`Tabletop / Othello * Mature *`)
   })
})
