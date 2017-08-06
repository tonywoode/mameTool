'use strict'

const ini = require('ini')

/* https://github.com/npm/ini/issues/60i, https://github.com/npm/ini/issues/22
 *  they are adament that dots are valid separators in ini file format, but is that 
 *  really borne by the spec? I tried some other ini libraries, best to stick with this
 *  ...and escape dots, always (there's lots of 'Misc.' in mame ini files)....
 */
module.exports = bufferedIni => ini.parse(bufferedIni.replace(/\./g, `\\.`))

