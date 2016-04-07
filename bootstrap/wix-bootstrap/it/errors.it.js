'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  req = require('./support/req'),
  _ = require('lodash');

//TODO: add versions for http output
//TODO: add versions for custom error handlers
describe('wix bootstrap error handling', function () {
  this.timeout(60000);
  env.start();
  let dieCountBefore = 0;

  beforeEach(() => getDeathCount().then(cnt => dieCountBefore = cnt));

  describe('built-in error handler', () => {

    it('should handle critical(async) exceptions using built-in error handler and restart worker', () => {
      return req.get(env.appUrl('/errors/async?m=async')).then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'async'});
        })
        .then(() => delay(1000))
        .then(() => getDeathCount())
        .then(cnt => expect(dieCountBefore + 1).to.equal(cnt));
    });

    it('should handle applicative(sync) exceptions using built-in error handler and keep worker running', () => {
      return req.get(env.appUrl('/errors/sync?m=sync')).then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'sync'});
        })
        .then(() => delay(1000))
        .then(() => getDeathCount())
        .then(cnt => expect(dieCountBefore).to.be.equal(cnt));
    });

    it('should handle request timeouts using built-in timeout handler', () =>
      req.get(env.appUrl('/errors/timeout?ms=1500')).then(res => {
        expect(res.status).to.equal(504);
        expect(res.json()).to.deep.equal({name: 'Error', message: 'request timed out after 1000 mSec'});
      })
    );
  });

  describe('custom error handler', () => {

    it('should critical(async) errors and should not suppress worker restart', () => {
      return req.get(env.appUrl('/custom/errors/async?m=async')).then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-async'});
        })
        .then(() => delay(1000))
        .then(() => getDeathCount())
        .then(cnt => expect(dieCountBefore + 1).to.equal(cnt));
    });

    it('should handle applicative(sync) exceptions using custom error handler and keep worker running', () => {
      return req.get(env.appUrl('/custom/errors/sync?m=sync')).then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-sync'});
        })
        .then(() => delay(1000))
        .then(() => getDeathCount())
        .then(cnt => expect(dieCountBefore).to.be.equal(cnt));
    });

    it('should handle request timeouts using built-in timeout handler', () =>
      req.get(env.appUrl('/custom/errors/timeout?ms=1500')).then(res => {
        expect(res.status).to.equal(504);
        expect(res.json()).to.deep.equal({name: 'x-timeout', message: 'custom-timeout'});
      })
    );
  });

  function delay(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  function getDeathCount() {
    return req.get(env.managementAppUrl('/app-info')).then(res => res.json().workerDeathCount);
  }

});