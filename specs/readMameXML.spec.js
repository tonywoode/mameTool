const intoStream = require('into-stream')
const { makeSystemsAsync, cleanKey, shortenDisplay } = require('../src/readMameXML.js')

const mockXml          = 
`<?xml version="1.0"?>
<!DOCTYPE mame [
<!ELEMENT mame (machine+)>
	<!ATTLIST mame build CDATA #IMPLIED>
	<!ATTLIST mame mameconfig CDATA #REQUIRED>
	<!ELEMENT machine (description, year?, manufacturer?, biosset*, rom*, disk*, device_ref*, sample*, chip*, display*, sound?, input?, dipswitch*, configuration*, port*, adjuster*, driver?, device*, slot*, softwarelist*, ramoption*)>
		<!ATTLIST machine name CDATA #REQUIRED>
		<!ATTLIST machine sourcefile CDATA #IMPLIED>
		<!ATTLIST machine isbios (yes|no) "no">
		<!ATTLIST machine isdevice (yes|no) "no">
		<!ATTLIST machine ismechanical (yes|no) "no">
		<!ATTLIST machine runnable (yes|no) "yes">
		<!ATTLIST machine cloneof CDATA #IMPLIED>
		<!ATTLIST machine romof CDATA #IMPLIED>
		<!ATTLIST machine sampleof CDATA #IMPLIED>
		<!ELEMENT description (#PCDATA)>
		<!ELEMENT year (#PCDATA)>
		<!ELEMENT manufacturer (#PCDATA)>
		<!ELEMENT driver EMPTY>
			<!ATTLIST driver status (good|imperfect|preliminary) #REQUIRED>
			<!ATTLIST driver emulation (good|imperfect|preliminary) #REQUIRED>
			<!ATTLIST driver color (good|imperfect|preliminary) #REQUIRED>
			<!ATTLIST driver sound (good|imperfect|preliminary) #REQUIRED>
			<!ATTLIST driver graphic (good|imperfect|preliminary) #REQUIRED>
			<!ATTLIST driver cocktail (good|imperfect|preliminary) #IMPLIED>
			<!ATTLIST driver protection (good|imperfect|preliminary) #IMPLIED>
			<!ATTLIST driver savestate (supported|unsupported) #REQUIRED>
		<!ELEMENT device (instance*, extension*)>
			<!ATTLIST device type CDATA #REQUIRED>
			<!ATTLIST device tag CDATA #IMPLIED>
			<!ATTLIST device fixed_image CDATA #IMPLIED>
			<!ATTLIST device mandatory CDATA #IMPLIED>
			<!ATTLIST device interface CDATA #IMPLIED>
		<!ELEMENT softwarelist EMPTY>
			<!ATTLIST softwarelist name CDATA #REQUIRED>
			<!ATTLIST softwarelist status (original|compatible) #REQUIRED>
			<!ATTLIST softwarelist filter CDATA #IMPLIED>
		<!ELEMENT ramoption (#PCDATA)>
			<!ATTLIST ramoption default CDATA #IMPLIED>
]>

<mame build="0.187 (mame0187)" debug="no" mameconfig="10">
	<machine name="005" sourcefile="segag80r.cpp" sampleof="005">
		<description>005</description>
		<year>1981</year>
		<manufacturer>Sega</manufacturer>
		<display tag="screen" type="raster" rotate="270" width="256" height="224" refresh="59.998138" pixclock="5156000" htotal="328" hbend="0" hbstart="256" vtotal="262" vbend="0" vbstart="224" />
		<sound channels="1"/>
		<input players="2" coins="2" service="yes">
			<control type="joy" player="1" buttons="1" ways="4"/>
			<control type="joy" player="2" buttons="1" ways="4"/>
		</input>
		<dipswitch name="Coin A" tag="D1D0" mask="15">
			</dipswitch>
		<dipswitch name="Coin B" tag="D1D0" mask="240">
					</dipswitch>
		<dipswitch name="Cabinet" tag="D3D2" mask="4">
			<dipvalue name="Upright" value="4" default="yes"/>
			<dipvalue name="Cocktail" value="0"/>
		</dipswitch>
		<driver status="imperfect" emulation="good" color="good" sound="imperfect" graphic="good" savestate="unsupported"/>
	</machine>
</mame>`

const mockMameXMLStream = intoStream(mockXml)

const mockDollarList = [
	{
		call: "005",
		isbios: false,
		isdevice: false,
		ismechanical: false,
		system: "005",
		year: "1981",
		company: "Sega",
		display: {
			$: {
				tag: "screen",
				type: "raster",
				rotate: "270",
				width: "256",
				height: "224",
				refresh: "59.998138",
				pixclock: "5156000",
				htotal: "328",
				hbend: "0",
				hbstart: "256",
				vtotal: "262",
				vbend: "0",
				vbstart: "224",
				flipx: false
			},
			$name: "display"
		},
		control: {
			$: {
				type: "joy",
				player: "2",
				buttons: "1",
				ways: "4",
				reverse: false
			},
			$name: "control"
		},
		status: "imperfect",
		savestate: "unsupported",
		arcade: true,
		arcadeNoBios: true,
		rating: "10 to 20 (Horrible)",
		category: "Maze / Shooter Small",
		catlist: "Maze / Shooter Small",
		genre: "Maze",
		language: "English",
		mamescore: true,
		players: "2P alt",
		version: "0.030"
	}
]

const mockCleanedDollarList = [
	{
		call: "005",
		isbios: false,
		isdevice: false,
		ismechanical: false,
		system: "005",
		year: "1981",
		company: "Sega",
		display: {
			 flipx: false,
             hbend: "0",
             hbstart: "256",
             height: "224",
             htotal: "328",
             pixclock: "5156000",
             refresh: "59.998138",
             rotate: "270",
             tag: "screen",
             type: "raster",
             vbend: "0",
             vbstart: "224",
             vtotal: "262",
             width: "256"
		},
		control: {
			type: "joy",
			player: "2",
			buttons: "1",
			ways: "4",
			reverse: false
		},
		status: "imperfect",
		savestate: "unsupported",
		arcade: true,
		arcadeNoBios: true,
		rating: "10 to 20 (Horrible)",
		category: "Maze / Shooter Small",
		catlist: "Maze / Shooter Small",
		genre: "Maze",
		language: "English",
		mamescore: true,
		players: "2P alt",
		version: "0.030"
	}
]

makeSystemsAsync(mockMameXMLStream).then( systems => {
  describe(`readMameXML`, () => {

    describe('#makeSystems', () => {
      it(`should convert an item in mameXML format to a js object`, () => { 
        return expect(systems).to.not.be.null
      })
  
      it(`should return a correct value for a given key`, () => {
        return expect(systems[0].year).to.equal(`1981`)
      })
    })
    
    describe(`#cleanKey`, () => {
     it(`should flatten $-style object key in a list (removing $ and $name keys)`, () => {
       const cleanedDollarList = cleanKey(`display`, mockDollarList)
       return expect(cleanedDollarList[0].display).to.deep.equal( {
         flipx: false,
         hbend: "0",
         hbstart: "256",
         height: "224",
         htotal: "328",
         pixclock: "5156000",
         refresh: "59.998138",
         rotate: "270",
         tag: "screen",
         type: "raster",
         vbend: "0",
         vbstart: "224",
         vtotal: "262",
         width: "256"
       })
     })
   })

    describe(`#shortenDisplay`, () => {
      it(`should remove the properties I decided weren't important to filtering roms from the display object`, () => {
        const shortenedMockDisplayList = shortenDisplay(mockCleanedDollarList)
        return expect(shortenedMockDisplayList[0].display).to.deep.equal( {
          tag: "screen",
          type: "raster",
          rotate: "270",
          width: "256",
          height: "224",
          refresh: "59.998138",
          flipx: false
        })
      })
    })


  }) 
})
