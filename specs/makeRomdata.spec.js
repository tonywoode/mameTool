'use strict'

const makeRomdata = require(`../src/makeRomdata.js`)

const mockJson = [
	{
		call: `005`,
		system: `005`,
		year: `1981`,
		company: `Sega`,
		status: `imperfect`
	},
	{
		call: `100lions`,
		system: `100 Lions (10219211, NSW/ACT)`,
		year: `2006`,
		company: `Aristocrat`,
		status: `preliminary`
	},
	{
		call: `10yard`,
		system: `10-Yard Fight (World, set 1)`,
		year: `1983`,
		company: `Irem`,
		status: `good`
	}
]

const expected = [ `ROM DataFile Version : 1.1`,
  `005¬005¬¬¬./qp.exe¬Mame64 Win32¬Sega¬1981¬¬¬¬¬imperfect¬0¬1¬<IPS>¬</IPS>¬¬¬`,
  `100 Lions (10219211, NSW/ACT)¬100lions¬¬¬./qp.exe¬Mame64 Win32¬Aristocrat¬2006¬¬¬¬¬preliminary¬0¬1¬<IPS>¬</IPS>¬¬¬`,
  `10-Yard Fight (World, set 1)¬10yard¬¬¬./qp.exe¬Mame64 Win32¬Irem¬1983¬¬¬¬¬good¬0¬1¬<IPS>¬</IPS>¬¬¬`
]

describe(`makeRomdata`, () => {
  it(`should accept a mame json string and return something`, () => {
    const systems = makeRomdata(`Mame64`)(mockJson)
    expect(systems).to.not.be.null
  })

  it(`should convert the input data to expected romdata lines, regardless of other ini filling of the romdata that also occurs`, () => {
    const systems = makeRomdata(`Mame64`)(mockJson)
    const systemsWithoutUndef = systems.map( element => element.replace(/undefined/g, ``) )
    expect(systemsWithoutUndef).to.deep.equal(expected)
  })

})
