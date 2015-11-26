'use strict';
const chai = require('chai'),
  rp = require('request-promise'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  wixExpressTimeout = require('..'),
  within = require('./env').withinEnv,
  httpTestkit = require('wix-http-testkit');

chai.use(chaiAsPromised);

describe('wix express monitor', () => {
//  const server = aServer();

//  server.beforeAndAfter();

  it('should allow normal operations', within('launcher', {}, () => {
    return rp({uri: 'http://localhost:3000/ok', resolveWithFullResponse: true})
      .then((response) => {
        expect(response.statusCode).to.be.equal(200);
      });
  }));

  it('should emit x-timeout event on response in case of timeout operation', within('launcher', {}, () => {
    return rp({uri: 'http://localhost:3000/slow', resolveWithFullResponse: true, simple: false})
      .then((response) => {
        expect(response.statusCode).to.be.equal(504);
        expect(response.body).to.be.equal('timeout: request timed out after 10 mSec');
      });
  }));

  it('should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)', within('launcher', {}, () => {
    return rp({uri: 'http://localhost:3000/slower/but-fine', resolveWithFullResponse: true, simple: false})
      .then((response) => {
        expect(response.statusCode).to.be.equal(200);
      });
  }));

  it('should timeout if the second middle does timeout in case of timeout override', within('launcher', {}, () => {
    return rp({uri: 'http://localhost:3000/slower/not-fine', resolveWithFullResponse: true, simple: false})
      .then((response) => {
        expect(response.statusCode).to.be.equal(504);
        expect(response.body).to.be.equal('timeout: request timed out after 100 mSec');
      });
  }));

});