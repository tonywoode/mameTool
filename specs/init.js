const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

global.sinon = require('sinon')
global.expect = chai.expect
