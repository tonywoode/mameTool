'use strict'
let fs               = require(`fs`) //rewired in test, don't try and destructure
const ini            = require('ini')
const R              = require(`ramda`)
const iniFlattener   = require('./iniFlattener.js')
 
/* 
 * https://github.com/npm/ini/issues/60i, https://github.com/npm/ini/issues/22
 *  they are adament that dots are valid separators in ini file format, but is that 
 *  really borne by the spec? I tried some other ini libraries, best to stick with this
 *  ...and escape dots, always (there's lots of 'Misc.' in mame ini files)....
 */
const parseIni = bufferedIni => ini.parse(bufferedIni.replace(/\./g, `\\.`) )

// this will load an ini file using the ini reader...
const loadIni = (iniDir, iniName) => 
  parseIni(fs.readFileSync(`${iniDir}/${iniName}.ini`, `utf-8`) )

// BUT, either that ini will have an annoying section header preventing it from being generic....
// (sectionName is the top-level-key to remove, since its different to the filename..sigh...)
const loadKVIni = (iniDir, iniName, sectionName) => 
  R.prop(sectionName, loadIni(iniDir, iniName) )

// OR it will have a header of only 'ROOT FOLDER' and then have just keys, this type of
//   ini needs a boolean value, and when used the key needs to be the name of the ini (which we do anyway)
const loadBareIni = (iniDir, iniName) =>
   R.map(game => game = true, loadKVIni(iniDir, iniName, `ROOT_FOLDER`) )

// OR, it will be section-to-key addressable, a nightmare to look up against....
const loadSectionIni = (iniDir, iniName) => 
  iniFlattener(loadIni(iniDir, iniName) )

// parseIni for unit testing
module.exports = { parseIni, loadKVIni, loadBareIni, loadSectionIni }
