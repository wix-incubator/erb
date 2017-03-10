
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonAsPromised = require('sinon-as-promised');
var sinonChai = require('sinon-chai');
var Promise = require('bluebird');

chai.use(chaiAsPromised);
chai.use(sinonChai);
sinonAsPromised(Promise);

global.expect = chai.expect.bind(chai);
global.spy = sinon.spy.bind(sinon);
global.stub = sinon.stub.bind(sinon);
global.mock = sinon.mock.bind(sinon);
