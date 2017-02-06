"use strict"

const 
    fs        = require('fs')
  , path      = require('path')
  , XmlStream = require('xml-stream')
  , R         = require('Ramda')
  , stream    = fs.createReadStream("inputs/mame.xml")
  , xml       = new XmlStream(stream)

//program flow
mockSystems(function(systems){
  mungeCompanyAndSytemsNames(systems, function(callback){
    makeSystemsList(callback)
  })
})


function mockSystems(callback){
  const 
       input = fs.readFileSync("inputs/newsystems.dat")
    ,  systems = JSON.parse(input)
  
  callback(systems,callback)
}

function makeSystems(callback){
  const systems = []

  xml.on("updateElement: machine", function(machine) {
    if (machine.softwarelist 
       && machine.driver.$.emulation === "good"
    ) {
      const node = {}
      //make an array of these objects: { company, system, call, cloneof }
      node.company = machine.manufacturer
      node.system = machine.description 
      node.call = machine.$.name
      node.cloneof = machine.$.cloneof
      systems.push(node)
    }
  })

  xml.on("end", function(){
    callback(systems,callback)
  })
}


function mungeCompanyAndSytemsNames(systems, callback){
 const
  //first create+populate 2 new properties for munging
   systemsAugmented = R.map( ({company, system, call, cloneof }) => ({company, system, call, cloneof, mungedCompany: company, mungedSystem: system }), systems )
//you'll find that hx21i looks up (is a cloneof) hx21 which is a machine with preliminary emulation status, the same applies for hx22i loking up hx22, macintoshXL looking up lisa2, and the same with pc8201a looking up pc8201. In each case we are told that the system itself is emulated good, but the system its a cloneof is not. If this is true, really the system type is the clone.....i would need a lookup chart, which is a pity....
, lookupCall = (cloneof, call) =>  {
  console.log("looking up " + cloneof)
  const referredSystem = R.find(R.propEq(`call`, cloneof))(systemsAugmented)
  let referredName = ''
  //console.log("referred system is" + JSON.stringify(referredSystem))
  //console.log("the system name of the referred system is " + referredSystem['mungedSystem'])
  //for (var key in referredSystem){console.log(key + ": " + referredSystem[key])}
  if (referredSystem !==undefined){referredName = referredSystem['call']; return referredName}
  if (referredSystem === undefined){console.log(`${call} says its a cloneof ${cloneof} but ${cloneof} is emulated badly`)}
  //const referredName = referredSystem.mungedSystem
}
  //next we'd like to change the munged system of every machine that has a cloneof property to be the system that points to
  , systemsDeCloned = R.map( ({company, system, call, cloneof, mungedCompany, mungedSystem }) => ({company, system, call, cloneof, mungedCompany, mungedSystem: cloneof? lookupCall(cloneof, call) : mungedSystem }), systemsAugmented )//actually we want this right at the end don't we as we want the ultimate system name after all munging
    console.log(JSON.stringify(systemsDeCloned, null, '\t'))
  process.exit()//replacement functions
  , compRep = (oldCompany, newCompany)            => R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( {company, system, call, cloneof, mungedCompany: mungedCompany.replace(oldCompany, newCompany), mungedSystem}))
  , systRep = (thisCompany, oldsystem, newsystem) => R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( {company, system, call, cloneof, mungedCompany, mungedSystem: (mungedCompany.match(thisCompany) && mungedSystem.match(oldsystem))? newsystem : mungedSystem}))
  , separator = " "
  , numberOfWords = 1

  //transforms  
  , res = R.pipe(
   R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( {company, system, call, cloneof, mungedCompany, mungedSystem: mungedSystem.replace(/\W\(.*\)/, ``)})) //now MSX has gone, every bracketed item is unnecessary
 , R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( {company, system, call, cloneof, mungedCompany, mungedSystem: mungedSystem.replace(new RegExp(mungedCompany.split(separator, numberOfWords) + '\\W', "i"), "")} )) //take company from system name if they repeat

  , compRep(`<unknown>`, ``)
      //system specific (btw replace accepts regex or string by default (i'm trying to show what's intended), but match matches only regex
  , systRep(`Acorn`, /BBC/, `BBC`), systRep(`Acorn`, /Electron/, `Atom`)
  , compRep(/Amstrad .*/, `Amstrad`), systRep(`Amstrad`, /(CPC|GX4000)/, `CPC`)
  , compRep(`APF Electronics Inc.`, `APF`), systRep(`APF`, `M-1000`, `Imagination Machine`)
  , compRep(/Apple Computer/, `Apple`), systRep(`Apple`, /(Macintosh LC|Macintosh II.*)/, `Macintosh II (68020/68030)`)
    , systRep(`Apple`, /Macintosh (Plus|SE|Classic)/, `Macintosh (6800)`), systRep(`Apple`,/(^II.*|\]\[|\/\/c|\/\/e)/,`II`)
    , systRep(`Apple`,/\/\/\//,`III`)
  , systRep(`Atari`,/(400|800.*|XE Game System)/, `400/600/800/1200/XE`)
  , compRep(`Bally Manufacturing`,`Bally`)
  , systRep(`Bandai`,`Super Vision 8000`, `Super Vision`) 
  , systRep(`Bondwell Holding`, /.*/, `Bondwell`), compRep(`Bondwell Holding`, ``) //change company after
  , systRep(`Casio`, `PV-1000`, `PV`)
  , compRep(`Commodore Business Machines`, `Commodore`), systRep(`Commodore`, /B500|P500/, `500/600/700`) 
    , systRep(`Commodore`, /PET .*|CBM .*/, `PET/CBM`), systRep(`Commodore`, /64|128/, `64/128`)
    , systRep(`Commodore`, `VIC-10 / Max Machine / UltiMax`, `Max/Ultimax`), systRep(`Commodore`, `VIC-1001`, `VIC-20`) 
  , compRep(`Comx World Operations Ltd`, `COMX`)
  , systRep(`EACA`,`Colour Genie EG2000`, `Colour Genie`)
  , systRep(`Elektronika`,`BK 0010`, `BK`)
  , systRep(`Emerson`, `Arcadia 2001`, `Arcadia`)
  , systRep(`Epson`, `PX-4`, `PX`)
  , compRep(`Exidy Inc`, `Exidy`)
  , systRep(`Fairchild`, `Channel F II`, `Channel F`)
  , systRep(`Fujitsu`, `FM-7`, `Micro 7`)
  , compRep(`General Consumer Electronics`, `GCE`)
  , compRep(`Interton Electronic`, `Interton`)
  , compRep(`Jupiter Cantab`, `Jupiter`)
  , systRep(`Kyosei`, `Kyotronic 85`, `Kyotronic`)
  , compRep(`Luxor Datorer AB`, `Luxor`), systRep(`Luxor`, /ABC.*/, `ABC`)
  , systRep(`Matra & Hachette`, `Alice 32`, `MC-10`), compRep(`Matra & Hachette`, `Tandy Radio Shack`) //change company after
  , compRep(`Memotech Ltd`, `Memotech`), systRep(`Memotech`, `MTX .*`, `MTX`) 
  , systRep(`Mikroelektronika`, `Pyldin-601`, `Pyldin`)
  , systRep(`Nascom Microcomputers`, `2`, `Nascom`), compRep(`Nascom Microcomputers`, ``) //change company after
  , systRep(`Nintendo`, `Entertainment System / Famicom`, `NES`)
  , systRep(`Nintendo`, `Game Boy Color`, `Game Boy`)
  , systRep(`Nintendo`, `Super Entertainment System / Super Famicom `, `SNES`)
  , compRep(`Nippon Electronic Company`, `NEC`), systRep(`NEC`, `PC Engine`, `PC Engine/TurboGrafx-16`)
  , systRep(`Non Linear Systems`, `Kaypro II - 2/83`, `Kaypro`)
  , compRep(`Data Applications International`, `DAI`), systRep(`DAI`, `DAI Personal Computer`, `Personal Computer`)
  , compRep(`Elektronika inzenjering` , ``)
  , systRep(`International Business Machines`, `IBM PC 5150`, `PC 5150`), compRep(`International Business Machines`, `IBM`) //change company after
  , systRep(`Interton`, `Electronic VC 4000` , `VC 4000`)
  , systRep(``, `Orion128` , `Orion`) //note these assume youve transformed <unknown> already
  , systRep(``, `PK8020Korvet` , `Korvet PK`)
  , compRep(`Jungle Soft / KenSingTon / Chintendo / Siatronics`, '')
  , systRep(/Welback Holdings .*/ , `Mega Duck / Cougar Boy`, `Mega Duck/Couger Boy`), compRep(/Welback Holdings .*/, ``) //change company after
  , compRep(`Miles Gordon Technology plc`, `MGT`)
  , compRep(`Processor Technology Corporation`, `PTC`), systRep(`PTC`, `SOL-20`, `Sol`)
  , systRep(``, `Radio86RK` , `Radio-86RK`) //seems MESS made the mistake here...
  , systRep(`Sanyo`, `MBC-55x`, `MBC`)
  , systRep(`SNK`, /(Neo-Geo$|Neo-Geo AES)/, `Neo Geo`), systRep(`SNK`, `Neo-Geo CDZ`, `Neo Geo CD`) //wikipedia says MESS is wrong
    , systRep(`SNK`, `NeoGeo Pocket`, `Neo Geo Pocket`) //MESS says MESS is wrong....
  , systRep(`Sega`, `Genesis`, `Genesis/32X`), systRep(`Sega`, `Master System II`, `Master System`)
     , systRep(`Sega`, /(SC-3000|SG-1000)/, `SG-1000/SC-3000/SF-7000`)
  , systRep(`Sharp`, /MZ.*/, `MZ`)
  , compRep(`Sinclair Research Ltd`, `Sinclair`), systRep(`Sinclair`, /ZX Spectrum .*/, `ZX Spectrum`)
  , systRep(`Sord`, `m.5`, `M5`)
  , systRep(`Spectravideo`, `SVI-318`, `SVI`)
  , systRep(`Tandy Radio Shack`, /(TRS-80 .*|Color Computer)/, `TRS-80 CoCo`)
  , systRep(`Texas Instruments`, /TI-99.*/, 'TI-99')
  , systRep(`Thomson`, `MO5 NR`, `MO5`), systRep(`Thomson`, /(TO7.*|TO9.*)/, `TO7/TO9`)
  , compRep(`V. I. Lenin`, `Lenin`), systRep(`Lenin`, `PK-01 Lviv`, `Lviv`)
  , systRep(`Video Technology`, /Laser.*/, `Laser Mk1`)
  , compRep(`Visual Technology Inc` , `Visual`)
  , systRep(`Watara`, `Super Vision`, `Supervision`) //again MESS seems to be wrong
  
  )(systemsDeCloned)

  
  
  callback(res)
}

function makeSystemsList(systems){

 const   
       munge = systems =>  R.pipe(
   // R.filter(( {thiscompany, system, call, cloneof } ) => !(cloneof)) //the systems list is a taxonomy
      R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( {company, system, call, cloneof, mungedCompany: mungedSystem.match(/MSX1/)? '' : mungedCompany, mungedSystem: mungedSystem.match(/MSX1/)? `MSX` : mungedSystem}))
    , R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( {company, system, call, cloneof, mungedCompany: mungedSystem.match(/MSX2/)? '' : mungedCompany, mungedSystem: mungedSystem.match(/MSX2/)? `MSX2` : mungedSystem})) 
    , R.map( ( {company, system, call, cloneof, mungedCompany, mungedSystem } ) => ( (mungedCompany ==="" || mungedSystem ==="")? ``:`${mungedCompany}` + ` `) + `${mungedSystem}`) //if there's a company name, print it first 
    , R.uniq // lastly dedupe all the dupes we made in all those transforms
    , R.sortBy(R.prop('mungedCompany'))
  )(systems)

  const flatSystems = munge(systems)
 
  const compare = (a, b) => a.localeCompare(b)

  const orderedFlatSystems = flatSystems.sort(compare)
  console.log(JSON.stringify(systems, null, '\t'))
  process.exit()
  orderedFlatSystems.forEach(function (v){console.log(v)})
  const opPath = ("outputs/newsystems.dat")
  fs.writeFileSync(opPath, JSON.stringify(systems))
  //output.on('error', function(err) { console.log("couldn't write the file") });
  
  //systems.forEach(function(v) { output.write(v + '\n'); });
  //output.end();
}
