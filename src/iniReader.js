'use strict'

let fs               = require(`fs`) //rewired in test, don't try and destructure
const ini            = require('ini')
const R              = require(`ramda`)
const iniFlattener   = require('./iniFlattener.js')

// need throw in statement position >=3 x ahead. https://stackoverflow.com/questions/9370606/
const _throw = m => { throw new Error(m) }

const iniDir         = require(`./getDir.js`).getIniDir() || _throw(`You need to set the Extras Dir`)

/* 
 * https://github.com/npm/ini/issues/60i, https://github.com/npm/ini/issues/22
 *  they are adament that dots are valid separators in ini file format, but is that 
 *  really borne by the spec? I tried some other ini libraries, best to stick with this
 *  ...and escape dots, always (there's lots of 'Misc.' in mame ini files)....
 */
const parseIni = bufferedIni => ini.parse(bufferedIni.replace(/\./g, `\\.`) )

// this will load an ini file using the ini reader...
const loadGenericIni = iniName => {
  try { return parseIni(fs.readFileSync(`${iniDir}/${iniName}.ini`, `utf-8`) ) }
  catch(err) { console.error(`PROBLEM: iniReader: "${iniName}" doesn't exist at "${iniDir}"`); return {}  }
}

// BUT, either that ini will have an annoying section header preventing it from being generic....
// (sectionName is the top-level-key to remove, since its unpredictably different to the filename..sigh...)
const loadKVIni = (
  iniName, sectionName = _throw(`you didn't supply a section name`) 
) => R.prop(sectionName, loadGenericIni(iniName) )

// OR it will have a header of only 'ROOT FOLDER' and then have just keys, this type of
//   ini needs a boolean value, and when used the key needs to be the name of the ini (which we do anyway)
const loadBareIni = iniName =>
   R.map(game => !!game, loadKVIni(iniName, `ROOT_FOLDER`) )

// OR, it will be section-to-key addressable, a nightmare to look up against....
const loadSectionIni = iniName => iniFlattener(loadGenericIni(iniName) )


// Main function which chooses between the above https://toddmotto.com/deprecating-the-switch-statement-for-object-literals/
const loadIni = (iniName, iniType, sectionName) => {
  const iniTypes = {
      bare    : () => loadBareIni(iniName)
    , kv      : () => loadKVIni(iniName, sectionName )
    , section : () => loadSectionIni(iniName)
  }

  return iniTypes[iniType]? iniTypes[iniType]() : 
    _throw(`iniType "${iniType}" not defined, you need to supply a first param of e.g."bare"/"kv"/"section"`)

}

// most of these for unit tests only
module.exports = { loadIni, parseIni, loadGenericIni, loadKVIni, loadBareIni, loadSectionIni }
