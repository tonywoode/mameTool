'use strict'

const R = require('ramda')

/* We have multiple needs for company name:
 *  1) we'll track what mame calls it - Sinclair Research Systems Ltd
 *  2) to display something as part of the name for each system - Sinclair ZX Spectrum 48k plus
 *  3) to inlcude (or not) in the system type ie: the classification for emulators eg: MSX */

module.exports = systems => {

  const spaceIsSeparator = ` `
  const oneWord          = 1

  //make the basic new object structure that we want
  const systemsAugmented = R.pipe(

    //create+populate 2 new properties for munging TODO: why mutating?
      R.map(obj => R.assoc(`mungedCompany`, obj.company, obj) )
    , R.map(obj => R.assoc(`mungedSystem`,  obj.system,  obj) )
  
    //take company from system name if they repeat
    , R.map(obj => R.assoc(`mungedSystem`, obj.mungedSystem.replace(
        new RegExp(`${obj.mungedCompany.split(spaceIsSeparator, oneWord)}\\W`, `i`), ``
      ), obj 
    )) 

  )(systems)

  //These are the main replacement functions to munge MESS' company name and system name. 
  const compRep = (oldCompany, newCompany) => R.map( 
    obj => R.assoc(`mungedCompany`, obj.mungedCompany.replace(oldCompany, newCompany), obj) 
  )

  //we match the company too when replacing the systeem name
  const sysMatchRep = (thisCompany, oldsystem, newsystem) => R.map( 
    obj => R.assoc(`mungedSystem`, ( obj.mungedCompany.match(thisCompany) && obj.mungedSystem.match(oldsystem) )? 
      newsystem : obj.mungedSystem
    , obj)
  )

  /* transforms -  conventions and TODO's:
   *    - dont replace system name to ``, or system type will be `` (following code uses system name if mungedCompany|mungedSystem ='')
   *    - company name changes come after system changes
   *    - note system name replacement uses match (returns true if the regex is found as a substring of the replacement string)
   *       , where company replace only replaces the substring match portion of the target */

  const mungedSystems = R.pipe(

      compRep(/(<unknown>|<generic>)/, ``)
      //system specific (btw replace accepts regex or string by default (i'm trying to show what's intended), but match matches only regex
    , sysMatchRep(`Acorn`, /BBC|Electron/, `BBC`)
    , compRep(/Amstrad.*/, `Amstrad`), sysMatchRep(`Amstrad`, /(CPC|GX4000)/, `CPC`), sysMatchRep(`Amstrad`, /^PC([0-9]*).*/, `PC`)
    , compRep(`APF Electronics Inc.`, `APF`), sysMatchRep(`APF`, `M-1000`, `Imagination Machine`)
    , compRep(/Apple Computer/, `Apple`), sysMatchRep(`Apple`, /(Macintosh LC|Macintosh II.*)/, `Macintosh II (68020/68030)`)
    , sysMatchRep(`Apple`, /Macintosh (Plus|SE|Classic)/, `Macintosh (6800)`), sysMatchRep(`Apple`, /(^II.*|\]\[|\/\/c|\/\/e)/, `II`)
    , sysMatchRep(`Apple`, /\/\/\//, `III`)
    , sysMatchRep(`Atari`, /(400|^800.*|XE Game System)/, `400/600/800/1200/XE`) //don't match atari 7800
    , compRep(`Bally Manufacturing`, `Bally`)
    , sysMatchRep(`Bandai`, `Super Vision 8000`, `Super Vision`) 
    , sysMatchRep(`Bondwell Holding`, /.*/, `Bondwell`), compRep(`Bondwell Holding`, ``) //change company after
    , sysMatchRep(`Camputers`, /Lynx/, `Lynx`)
    , sysMatchRep(`Casio`, `PV-1000`, `PV`)
    , sysMatchRep(`Central Data`, `CD 2650`, `2650`)
    , compRep(`Commodore Business Machines`, `Commodore`), sysMatchRep(`Commodore`, /(B500|P500|B128-80HP)/, `500/600/700`) 
      , sysMatchRep(`Commodore`, /PET .*|CBM .*/, `PET/CBM`), sysMatchRep(`Commodore`, /\b(64|128)/, `64/128`)
      , sysMatchRep(`Commodore`, `VIC-10 / Max Machine / UltiMax`, `Max/Ultimax`), sysMatchRep(`Commodore`, `VIC-1001`, `VIC-20`)
      , sysMatchRep(`Commodore`, `264`, `+4/C16`) 
    , compRep(`Comx World Operations Ltd`, `COMX`)
    , compRep(`Cybiko Inc`, `Cybiko`)
    , sysMatchRep(`DEC`, /Rainbow/, `Rainbow`)
    , compRep(`Dick Smith Electronics`, `Dick Smith`)
    , compRep(`Digital Equipment Corporation`, `DEC`)
    , sysMatchRep(`Dragon Data Ltd`, /128|Beta Prototype/, `128`), compRep(/Dragon Data Ltd|Dragon Compusense/, `Dragon`)
    , sysMatchRep(`EACA`, `Colour Genie EG2000`, `Colour Genie`)
    , sysMatchRep(`Ei Nis`, `Pecom 32`, `Pecom`) 
    , sysMatchRep(`Elektronika`, `BK 0010`, `BK`)
    , sysMatchRep(`Emerson`, `Arcadia 2001`, `Arcadia`)
    , sysMatchRep(`Enterprise Computers`, /Sixty Four|One Two Eight/, `64`), compRep(`Enterprise Computers`, `Enterprise`)
    , sysMatchRep(`Epson`, `PX-4`, `PX`)
    , compRep(`Exidy Inc`, `Exidy`)
    , compRep(`Eurohard S.A.`, `Eurohard`)
    , sysMatchRep(`Fairchild`, `Channel F II`, `Channel F`)
    , sysMatchRep(`Fidelity Electronics`, /.*/, `Chess Machines`)
    , sysMatchRep(`Fujitsu`, /FM-7|FM-8/, `Micro 7`)
    , compRep(`Franklin Computer`, `Franklin`)
    , compRep(/.* Galaksija/, `Galaksija`)
    , compRep(`General Consumer Electronics`, `GCE`)
    , sysMatchRep(`Hewlett Packard`, /HP48*|/, `HP`), sysMatchRep(`Hewlett-Packard`, /9845./, `HP`)
      , compRep(`Hewlett Packard`, `Hewlett-Packard`) //company last
    , sysMatchRep(`Hawthorne Technology`, `TinyGiant HT68k`, `TinyGiant`) 
    , sysMatchRep(`Intel`, /iSBC 286/, `iSBC`)
    , compRep(`Interton Electronic`, `Interton`)
    , sysMatchRep(`Intelligent Game`, `Game MPT-03`, `Game`), compRep(`Intelligent Game`, `Intelligent`) //company last
    , compRep(`Jupiter Cantab`, `Jupiter`)
      , sysMatchRep(`Kyosei`, `Kyotronic 85`, `Kyotronic`)
    , sysMatchRep(`Joseph Glagla and Dieter Feiler`, /Ravensburger Selbstbaucomputer.*/, `Ravensburger Selbstbaucomputer`)
      , compRep(`Joseph Glagla and Dieter Feiler`, ``) //company last
    , compRep(`Kontiki Data A/S`, `Kontiki`) //company last
    , compRep(`Luxor Datorer AB`, `Luxor`), sysMatchRep(`Luxor`, /ABC.*/, `ABC`)
    , sysMatchRep(`Matra & Hachette`, `Alice 32`, `MC-10`), compRep(`Matra & Hachette`, `Tandy Radio Shack`) //company last
    , compRep(`Memotech Ltd`, `Memotech`), sysMatchRep(`Memotech`, `MTX .*`, `MTX`) 
    , sysMatchRep(`Mikroelektronika`, `Pyldin-601`, `Pyldin`)
    , sysMatchRep(`Micro Genius`, /IQ-.*/, `IQ`)
    , sysMatchRep(`Microkey`, `Primo A-32`, `Primo`)
    , sysMatchRep(`Myarc`, `Geneve 9640`, `Geneve`)
    , sysMatchRep(`Applied Technology`, `Microbee 16 Standard`, `Microbee`)
    , sysMatchRep(`Micronique`, `Hector 2HR+`, `Hector`)
    , sysMatchRep(`Nascom Microcomputers`, `1|2`, `Nascom`), compRep(`Nascom Microcomputers`, ``) //company last
    , sysMatchRep(`Nintendo`, `Entertainment System / Famicom`, `NES`), sysMatchRep(`Nintendo`, `Game Boy Color`, `Game Boy`)
      , sysMatchRep(`Nintendo`, `Super Entertainment System / Super Famicom `, `SNES`)
    , compRep(`NEC / Hudson Soft`, `NEC`), sysMatchRep(`NEC`, `PC Engine`, `PC Engine/TurboGrafx-16`) 
      , sysMatchRep(`NEC`, `PC-8201A`, `PC Series`)
    , sysMatchRep(`Non Linear Systems`, `Kaypro II - 2/83`, `Kaypro`)
    , sysMatchRep(`NPO Microprocessor`, /Elektronika MS/,  `Elektronika`) 
    , compRep(`Nuova Elettronica`, `Nuova`)
    , compRep(`Orbit Electronics`, `Orbit`)
    , compRep(`Ormatu Electronics`, `Ormatu`)
    , sysMatchRep(``, `PC/AT 486 with CS4031 chipset`, `PC/AT 486`)
    , sysMatchRep(`PEL Varazdin`, `Orao 102`, `Orao`)
    , sysMatchRep(`Psion`, /Organiser II.*/, `Organiser II`)
    , compRep(`Data Applications International`, `DAI`), sysMatchRep(`DAI`, `DAI Personal Computer`, `Personal Computer`)
    , compRep(`Elektronika inzenjering`, ``)
    , sysMatchRep(`International Business Machines`, `IBM PC 5150`, `PC`), compRep(`International Business Machines`, `IBM`) //company last
    , sysMatchRep(`Interton`, `Electronic VC 4000`, `VC 4000`)
    , sysMatchRep(``, `Orion128`, `Orion`) //note these assume youve transformed <unknown> already
    , sysMatchRep(``, `PK8020Korvet`, `Korvet PK`)
    , compRep(`Jungle Soft / KenSingTon / Chintendo / Siatronics`, '')
    , sysMatchRep(/Welback Holdings .*/, `Mega Duck / Cougar Boy`, `Mega Duck/Cougar Boy`), compRep(/Welback Holdings .*/, ``) //company last
    , compRep(`Miles Gordon Technology plc`, `MGT`)
    , compRep(`Processor Technology Corporation`, `PTC`), sysMatchRep(`PTC`, `SOL-20`, `Sol`)
    , sysMatchRep(``, `Radio86RK`, `Radio-86RK`) //seems MESS made the mistake here...
    , sysMatchRep(`Research Machines`, /RM.*Z/, `Z-series`)
    , sysMatchRep(`Samsung`, /SPC-1[05]00/, `SPC`)
    , sysMatchRep(`Sanyo`, /MBC-/, `MBC`), sysMatchRep(`Sanyo`, `PHC-25`, `PHC`)
    , sysMatchRep(`SNK`, /(Neo-Geo$|Neo-Geo AES)/, `Neo Geo`), sysMatchRep(`SNK`, `Neo-Geo CDZ`, `Neo Geo CD`) //wikipedia says MESS is wrong
      , sysMatchRep(`SNK`, `NeoGeo Pocket`, `Neo Geo Pocket`) //MESS says MESS is wrong....
    , sysMatchRep(`Sega`, `Genesis`, `Genesis/32X`), sysMatchRep(`Sega`, `Master System II`, `Master System`)
       , sysMatchRep(`Sega`, /(SC-3000|SG-1000)/, `SG-1000/SC-3000/SF-7000`)
    , sysMatchRep(`Sharp`, /MZ.*/, `MZ`)
    , compRep(`Sinclair Research Ltd`, `Sinclair`), sysMatchRep(`Sinclair`, /ZX Spectrum .*/, `ZX Spectrum`)
    , sysMatchRep(`SME Systems`, `Aussie Byte II`, `Aussie Byte`)
    , sysMatchRep(`SMT`, /Goupil/, `Goupil`)
    , compRep(`Sony Computer Entertainment`, `Sony`), compRep(`Sony Inc`, `Sony`)
    , sysMatchRep(`Sord`, `m.5`, `M5`)
    , sysMatchRep(`Spectravideo`, /SVI-3[12]8/, `SVI`)
    , sysMatchRep(`System-99 User Group`, /SGCPU/, `TI-99`), compRep(`System-99 User Group`, `Texas Instruments`) //company last
    , sysMatchRep(`Tandy Radio Shack`, /(TRS-80 .*|Color Computer)/, `TRS-80 CoCo`)
    , sysMatchRep(`Tandy/Memorex`, `Video Information System MD-2500`, `Video Information System`), compRep(`Tandy/Memorex`, `Tandy`)// company last
    , sysMatchRep(`Tatung`, `Einstein TC-01`, `Einstein`)
    , sysMatchRep(`Telercas Oy`, /Telmac.*/, `Telmac`)
    , sysMatchRep(`Texas Instruments`, /Speak & Spell/, `Speak & Spell`)
    , sysMatchRep(`Texas Instruments`, /TI-99.*/, `TI-99`)
    , sysMatchRep(`Texas Instruments`, `TI Avigo 10 PDA`, `TI Avigo`)
    , sysMatchRep(`Thomson`, /MO5.*|MO6.*/, `MO5/MO6`), sysMatchRep(`Thomson`, /(TO7.*|TO9.*|TO8.*)/, `TO-series`)
    , sysMatchRep(`VEB Robotron Electronics Riesa`, `Z1013`, `KC Series`), compRep(`VEB Robotron Electronics Riesa`, `Robotron`)  //company after 
    , compRep(`V. I. Lenin`, `Lenin`), sysMatchRep(`Lenin`, `PK-01 Lviv`, `Lviv`)
    , sysMatchRep(`Video Technology`, /Laser.*/, `Laser Mk1`)
    , compRep(`Visual Technology Inc`, `Visual`)
    , sysMatchRep(`Watara`, `Super Vision`, `Supervision`) //again MESS seems to be wrong

  )(systemsAugmented)

  return mungedSystems

}

