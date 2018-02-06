'use strict'

const R = require('ramda')

/* We need to say 'before you write, check if you've already written a softlist with an emu
 *  that had a higher rating. if so don't write. We can achieve this by writing a `written` key in the object
 *  but that's not good enough we can't just have a bool because we need to know what the previous rating was for the softlist
 *  so we need to store an object structure liks "a2600" : "80" to know that for each softlist) */

module.exports = log => softlistEmus => {
 
  //TODO: this whole function is very impure, yet isn't using anything outside what's passed in....
  const softlistRatings = {}, defaultEmus = {}, logDecisions = {}, rejectedEmus = []
  
  const decideWhetherToMakeMeOne = R.map( emu => {

    //rate the current object we're on against an accumulated value
    const decide = (rating, accum) => rating > accum? (
        defaultEmus[emu.name]          = emu
      , softlistRatings[emu.name]      = emu.rating
      , logDecisions[emu.emulatorName] = `accepted for ${emu.name} as its rating is: ${rating} and the accumulator is ${accum}`
    ) 
    : ( logDecisions[emu.emulatorName] = `rejected for ${emu.name} as its rating is: ${rating} and the accumulator is ${accum}` 
      , rejectedEmus.push(emu)
    )
    //if the emu has a rating for the softlist it runs, compare it against the total, if it doesn't set it as the default
    softlistRatings[emu.name]? 
      decide(emu.rating, softlistRatings[emu.name]) : (
          defaultEmus[emu.name] = emu
        , softlistRatings[emu.name] = emu.rating
      )
    
  }, softlistEmus)

/* add regional variant defaults - for each defaultEmu, check if it matches a regional regex, if it does, look for other similarly
 * named variants of that emu and add them to a key in the defaultEmu's object
 *
 * a problem we now have is some machines encode useful info Atari 2600 (NTSC) where some encode none Casio MX-10 (MSX1)
 * i think all those that do have a FILTER key...nope, turns out the filter key can't be relied on, atari 400 doen't have it
 * but clearly has a (NTSC) variant, let's just parse the emu or display name for (NTSC) */
  const regionality = R.map(defaultEmu => { 
    const regionals = []
    const matchme = defaultEmu.emulatorName.match(/\(.*\)|only/) //actually this list is pretty good as it is ( it should contain all regions instead of that kleene)
      if (matchme) {
        if (log.findRegions) console.log(`* ${defaultEmu.emulatorName} <--- looks like it might have regional variants`)
        //if it does, then look back in the rejected emus for those named the same except for the ()
        const nesRegex       = defaultEmu.emulatorName.replace(/ \/ Famicom /, ``)
        const snesRegex      = nesRegex.replace(/ \/ Super Famicom /, ``)
        const megadriveRegex = snesRegex.replace(/Genesis/, `Mega Drive`)
        const regex1         = megadriveRegex.replace(/PAL|NTSC only/, ``)
        
        const regex = new RegExp(regex1.replace(/\(.*\)/, `(.*)`))//only relace first occurance
        if (log.findRegions) console.log(`    --------> searching for ${regex}`)
        R.map(rejected => rejected.emulatorName.match(regex)? (
          log.findRegions && console.log(`    ---->>>> matches ${rejected.emulatorName}`)
            //add them to a key "regions", but filter by softlist name otherwise Atari 800 (NTSC) -SOFTLIST a800 matches Atari 800 (PAL) -SOFTLIST a800_flop
          , defaultEmu.name === rejected.name ? (  
                regionals.push(rejected) 
              , log.findRegions && console.log(`    ##### Regionals now: ${R.pluck(`emulatorName`, regionals)}`)
          ): null
        )
        : null, rejectedEmus)
        if (regionals[0]) {
            //add the original emu name to the list here, it does help the picker logic later, even though NTSC is generally the default
            // TODO: note this causes a circular reference since the default emu contains in it the regional emus which now contains itself...
            regionals.push(defaultEmu)
            //put the list in the default emulators object
          , defaultEmu.regions = regionals 
        }
        return defaultEmu
      }
  }, defaultEmus)

  return defaultEmus //note this now keyed by softlist name, but it functions just the same.
}
