`use strict`

const {makeEmu} = require(`../src/types.js`)

const mameTypeName = `Mame Emulator`
const retroarchTypeName = `Retroarch reloaded`

describe(`Types`, () => {

  describe(`#makeEmu`, () => {
    it(`when passed a mame-type emu, returns a mame emu of that name`, () => {
      const mameEmu = (makeEmu(mameTypeName, `./myRomsDir`).toString())
      expect(mameEmu).to.equal(`Emu("Mame Emulator", "./myRomsDir/Mame", "Mame")`)
    })


    it(`when passed a retroarch-type emu, returns a mame emu of that name`, () => {
      const retroarchEmu = (makeEmu(retroarchTypeName, `./myRomsDir`).toString())
      expect(retroarchEmu).to.equal(`Emu("Retroarch reloaded", "./myRomsDir/RetroArch", "RetroArch")`)
    })
  })
})

