'use strict'

const ini = require('ini')

module.exports = bufferedIni => ini.parse(bufferedIni)

