'use strict'

/* Here's a nice example" the no-mature set. Analysing the data shows we need to filter 
 *  BOTH by regex of Mature in catlist AND category. There's no point filtering
 *  by the genre "Mature" (its a tiny subset of those two), but we also need 
 *  to look for !word-separated "Adult" and "Sex" in game title
 *  There is a mature.ini available here: http://www.progettosnaps.net/catver/
 *  but in my experience, it doesn't filter out all of this...
 */


// an example, here's my best approximation of what the average arcade gamer wants in a filter
exports.arcadeFilter = [
   { name: `noBios`,          type: `remove`, path: [`isbios`] }
 , { name: `noCasino`,        type: `remove`, path: [`genre`],    value: `Casino` }
 , { name: `noCasinoCatlist`, type: `remove`, path: [`catlist`],  value: /Casino/ } //turns out you can't trust genre
 , { name: `noClones`,        type: `remove`, path: [`cloneof`] }
 , { name: `nonMechanical`,   type: `remove`, path: [`ismechanical`] }
 , { name: `nonMechGenre`,    type: `remove`, path: [`genre`],    value: `Electromechanical` } //turns out you can't trust the ini bool
 , { name: `noMess`,          type: `remove`, path: [`mess`] }
 , { name: `nonPrintClub`,    type: `remove`, path: [`catlist`],  value: `Print Club` } //turns out you can't trust the ini bool
 , { name: `noSimulator`,     type: `remove`, path: [`genre`],    value: `Simulator` } //a couple of laserDisc players!
 , { name: `nonTableTop`,     type: `remove`, path: [`genre`],    value: `Tabletop` } //that means Mahjong etc
 , { name: `nonTableGenre`,   type: `remove`, path: [`category`], value: /Tabletop/ } //turns out you can't trust the ini AGAIN
 , { name: `noQuiz`,          type: `remove`, path: [`genre`],    value: `Quiz` }
 , { name: `noCQuizCatList`,  type: `remove`, path: [`catlist`],  value: /Quiz/ } //turns out you can't trust genre
 , { name: `noUtilities`,     type: `remove`, path: [`genre`],    value: `Utilities` }
] 

// here's all the filters in alpha order, some are simple, some not so
exports.biosFilter        = [ { name: `noBios`, type: `remove`, path: [`isbios`] } ]
exports.casinoFilter      = [ 
   { name: `noCasino`,        type: `remove`, path: [`genre`],    value: `Casino` }
 , { name: `noCasinoCatlist`, type: `remove`, path: [`catlist`],  value: /Casino/ } //turns out you can't trust genre
]
exports.clonesFilter      = [ { name: `noClones`, type: `remove`, path: [`cloneof`] } ]
exports.matureFilter      = [
   { name: `noMatureCategory`, type: `remove`, path: [`category`], value: /Mature/ }
 , { name: `noMatureCatlist`,  type: `remove`, path: [`catlist`],  value: /Mature/ }
 , { name: `noAdult`,          type: `remove`, path: [`system`],   value: /\WAdult\W/i }
 , { name: `noSex`,            type: `remove`, path: [`system`],   value: /\WSex\W/i }
]
exports.mechanicalFilter  = [
   { name: `nonMechanical`,   type: `remove`, path: [`ismechanical`] }
 , { name: `nonMechGenre`,    type: `remove`, path: [`genre`],    value: `Electromechanical` } //turns out you can't trust the ini bool
]
exports.messFilter        = [ { name: `noMess`, type: `remove`, path: [`mess`] } ]
exports.preliminaryFilter = [ { name: `noPreliminary`, type: `remove`, path: [`status`], value: `preliminary` } ]
exports.printClubFilter   = [ { name: `nonPrintClub`, type: `remove`, path: [`catlist`],  value: `Print Club` } ]
exports.simulatorFilter   = [ { name: `noSimulator`, type: `remove`, path: [`genre`],    value: `Simulator` } ] //a couple of laserDisc players!
exports.tableTopFilter    = [ 
   { name: `nonTableTop`, type: `remove`, path: [`genre`],    value: `Tabletop` } //that means Mahjong etc
 , { name: `nonTableGenre`,   type: `remove`, path: [`category`], value: /Tabletop/ } //turns out you can't trust the ini AGAIN
]
exports.quizFilter        = [
   { name: `noQuiz`,          type: `remove`, path: [`genre`],    value: `Quiz` }
 , { name: `noCQuizCatList`,  type: `remove`, path: [`catlist`],  value: /Quiz/ } //turns out you can't trust genre
]
exports.utilitiesFilter   = [ { name: `noUtilities`,     type: `remove`, path: [`genre`],    value: `Utilities` } ]
