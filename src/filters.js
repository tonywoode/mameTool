'use strict'

/* now make a naive no-mature set. Analysing the data shows we need to filter 
 *  BOTH by regex of Mature in catlist AND category. There's no point filtering
 *  by the genre "Mature" (its a tiny subset of those two), but we also need 
 *  to look for !word-separated "Adult" and "Sex" in game title
 *  There is a mature.ini available here: http://www.progettosnaps.net/catver/
 *  but in my experience, it doesn't filter out all of this...
 */

exports.noMatureFilters = [
   { name: `noMatureCategory`, type: `remove`, path: [`category`], value: /Mature/ }
 , { name: `noMatureCatlist`,  type: `remove`, path: [`catlist`],  value: /Mature/ }
 , { name: `noAdult`,          type: `remove`, path: [`system`],   value: /\WAdult\W/i }
 , { name: `noSex`,            type: `remove`, path: [`system`],   value: /\WSex\W/i }
]

// next, here's my best approximation of what the average arcade gamer wants in a filter
exports.arcadeFilters = [
   { name: `noBios`,          type: `remove`, path: [`isbios`] }
 , { name: `noCasino`,        type: `remove`, path: [`genre`],    value: `Casino` }
 , { name: `noCasinoCatlist`, type: `remove`, path: [`catlist`],  value: /Casino/ } //turns out you can't trust genre
 , { name: `noClones`,        type: `remove`, path: [`cloneof`] }
 , { name: `nonMechanical`,   type: `remove`, path: [`ismechanical`] }
 , { name: `nonMechGenre`,    type: `remove`, path: [`genre`],    value: `Electromechanical` } //turns out you can't trust the ini bool
 , { name: `noMess`,          type: `remove`, path: [`mess`] }
 , { name: `nonPrintClub`,    type: `remove`, path: [`genre`],    value: `Print Club` } //turns out you can't trust the ini bool
 , { name: `noSimulator`,     type: `remove`, path: [`genre`],    value: `Simulator` } //a couple of laserDisc players!
 , { name: `nonTableTop`,     type: `remove`, path: [`genre`],    value: `Tabletop` } //that means Mahjong etc
 , { name: `nonTableGenre`,   type: `remove`, path: [`category`], value: /Tabletop/ } //turns out you can't trust the ini AGAIN
 , { name: `noQuiz`,          type: `remove`, path: [`genre`],    value: `Quiz` }
 , { name: `noCQuizCatList`,  type: `remove`, path: [`catlist`],  value: /Quiz/ } //turns out you can't trust genre
 , { name: `noUtilities`,     type: `remove`, path: [`genre`],    value: `Utilities` }
] 

// then we'll write more filters and pass them to the emulator and adult variations
// but another main thing to filter on is whether we want our lists to include games whose emulation
// is marked 'preliminary'
exports.noPreliminaryFilter = [ { name: `noPreliminary`, type: `remove`, path: [`status`], value: `preliminary` } ]

// make a noClones version of those full jsons
exports.noClonesFilter = [ { name: `noClones`, type: `remove`, path: [`cloneof`] } ]

