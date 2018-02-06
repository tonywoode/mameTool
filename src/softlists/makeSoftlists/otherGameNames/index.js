'use strict'

const {makeOtherSoftlists, doWeNeedToSpecifyDevice} = require('./checkOtherSoftlistNames.js')
const {makeParameters} = require('./replaceOtherSoftlistNameCalls.js')

module.exports = {
    makeOtherSoftlists
  , doWeNeedToSpecifyDevice
  , makeParameters
}
