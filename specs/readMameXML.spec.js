const intoStream = require('into-stream')
const { makeSystemsAsync, convertToBool, cleanKey, shortenDisplay } = require('../src/readMameXML.js')

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


makeSystemsAsync(mockMameXMLStream).then( systems => {
  describe(`readMameXML`, () => {
    describe('#makeSystems', () => {
      it(`should convert an item in mameXML format to a js object`, () => { 
        expect(systems).to.not.be.null
      })
  
      it(`should return a correct value for a given key`, () => {
        expect(systems[0].year).to.equal(`1981`)
      })
    })
    
  }) 
})
