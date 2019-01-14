'use strict'

let fs               = require('fs') //rewired in test, don't try and destructure
const path = require('path')
const ini            = require('ini')
const R              = require('ramda')
const Maybe             = require('data.maybe')
const { Just, Nothing } = Maybe

const iniFlattener   = require('./iniFlattener.js')

//TODO - iniDir is static - it needs to be a lamda here

// need throw in statement position >=3 x ahead. https://stackoverflow.com/questions/9370606/
const _throw = m => { throw new Error(m) }

/* 
 * https://github.com/npm/ini/issues/60i, https://github.com/npm/ini/issues/22
 *  they are adament that dots are valid separators in ini file format, but is that 
 *  really borne by the spec? I tried some other ini libraries, best to stick with this
 *  ...and escape dots, always (there's lots of 'Misc.' in mame ini files)....
 */
const parseIni = bufferedIni => ini.parse(bufferedIni.replace(/\./g, `\\.`) )

const isFile = file => fs.existsSync(file) && fs.statSync(file).isFile()
const isDir = file => fs.existsSync(file) && fs.statSync(file).isDirectory()

// last resort: find ini files the old fashioned way
const recurseSearch = (ini, node) => { //;console.log(`node: ${node}`)
  if (isDir(node)){ 
    const files = fs.readdirSync(node) //;console.log(`contents of ${node} are ${files}`)
    for (const subNode of files) { //;console.log(`entering subNode ${path.join(node, subNode)}`)
      const found = recurseSearch(ini, path.join(node, subNode)) //;console.log(`recurse search in ${path.join(node,subNode)} - result ${found}`)
      if (found) { //;console.log("returning " + found)
        return found 
      }
    }
  } else { //;console.log(`is ${ini} === ${path.basename(node)}`)
    if (isFile(node) && ini === path.basename(node)) {
      return node
    }
  }
  return false
} 

// Sometimes MAME Extra's 'folders' folder could be a flat collection of the inis, but sometimes (in the case of 
//   progrettoSnaps combined ini download, for instance) the inis might be in subfolders.
// In order of preference find the ini in root, in folderName, in folder with own name, or subdir of root 

// getIniPath :: ( Path, Path, Path ) -> Maybe Path
const getIniPath = (ini, inisFolder, folderName) => {
  if (!ini || !inisFolder) return Nothing() //is the file in the root?
  const iniInRoot = path.join(inisFolder, ini)
  if (isFile(iniInRoot)) { return Just(iniInRoot) } //no, is it in that folder we saw progretto using?
  if(folderName) {
    const iniInDeclaredFolder = path.join(inisFolder, folderName, ini)
    if (isFile(iniInDeclaredFolder)) { return Just(iniInDeclaredFolder)} //no, is it in a folder named after itself?
  }
  const iniInOwnNamedDir = path.join(inisFolder, ini.replace(/.ini$/i, ''), ini)
  if (isFile(iniInOwnNamedDir)) { return Just(iniInOwnNamedDir) }
    //it wasn't in any of those, so do a recursive search. Prob a good time to deal with cross-platform potential case insensitivity ideally should be breadth first, it'll probably come out as depth
  const result =  recurseSearch(ini, inisFolder)//.toString()
  return result? Just(result) : Nothing()
}

// this will load an ini file using the ini reader...
const loadGenericIni = (iniDir, iniName) => {
  try {
    return getIniPath(`${iniName}.ini`, iniDir)
      .orElse( _ => _throw("inis not anywhere in that folder"))
      .map(iniPath => parseIni(fs.readFileSync(iniPath, `utf-8`) ))
      .get()
  }
  catch(err) { console.error(`PROBLEM: iniReader: "${iniName}" can't be read at "${iniDir}"`); return {}  }
}

// BUT, either that ini will have an annoying section header preventing it from being generic....
// (sectionName is the top-level-key to remove, since its unpredictably different to the filename..sigh...)
const loadKVIni = (
  iniDir, iniName, sectionName = _throw(`you didn't supply a section name`) 
) => R.prop(sectionName, loadGenericIni(iniDir, iniName) )

// OR it will have a header of only 'ROOT FOLDER' and then have just keys, this type of
//   ini needs a boolean value, and when used the key needs to be the name of the ini (which we do anyway)
const loadBareIni = (iniDir, iniName) =>
   R.map(game => !!game, loadKVIni(iniDir, iniName, `ROOT_FOLDER`) )

// OR, it will be section-to-key addressable, a nightmare to look up against....
const loadSectionIni = (iniDir, iniName) => iniFlattener(loadGenericIni(iniDir, iniName) )


// Main function which chooses between the above https://toddmotto.com/deprecating-the-switch-statement-for-object-literals/
const loadIni = (iniDir, ini) => {
  const iniTypes = {
      bare    : () => loadBareIni(iniDir, ini.iniName)
    , kv      : () => loadKVIni(iniDir, ini.iniName, ini.sectionName )
    , section : () => loadSectionIni(iniDir, ini.iniName)
  }

  return iniTypes[ini.iniType]? iniTypes[ini.iniType]() : 
    _throw(`iniType "${ini.iniType}" not defined, you need to supply a first param of e.g."bare"/"kv"/"section"`)

}

// most of these for unit tests only
module.exports = { getIniPath, loadIni, parseIni, loadGenericIni, loadKVIni, loadBareIni, loadSectionIni }
