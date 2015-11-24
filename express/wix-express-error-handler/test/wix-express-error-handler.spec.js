'use strict';
const
  expect = require('chai').expect,
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  withApp = require('wix-childprocess-testkit').withApp;

chai.use(chaiAsPromised);

describe('wix-express-error-handler', () => {
  it('should run the server for a test', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000')
      .then(res => {
        expect(res).to.be.equal('Hello');
      });
  }));

});