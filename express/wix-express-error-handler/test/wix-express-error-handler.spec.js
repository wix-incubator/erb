'use strict';
const
  expect = require('chai').expect,
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  withApp = require('wix-childprocess-testkit').withApp;

chai.use(chaiAsPromised);

describe('wix-express-error-handler', () => {
  it('should not interfere with a request that works', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000')
      .then(res => {
        expect(res).to.be.equal('Hello');
      });
  }));

  it('should, on async operation error, return HTTP 500 with body \'Internal Server Error\'', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/async-die', {resolveWithFullResponse: true, simple: false})
      .then(res => {
        expect(res.statusCode).to.be.equal(500);
        expect(res.body).to.be.equal('Internal Server Error');
      });
  }));

  it('should, on sync operation error, return HTTP 500 with body \'Internal Server Error\'', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/just-die', {resolveWithFullResponse: true, simple: false})
      .then(res => {
        expect(res.statusCode).to.be.equal(500);
        expect(res.body).to.be.equal('Internal Server Error');
      });
  }));

  it('should, on timeout to write response, return HTTP 504 with body \'Gateway Timeout\'', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/just-timeout', {resolveWithFullResponse: true, simple: false, time: true})
      .then(res => {
        expect(res.statusCode).to.be.equal(504);
        expect(res.body).to.be.equal('Gateway Timeout');
        expect(res.elapsedTime).to.be.within(500, 1500);
      });
  }));

  it('should, on timeout after writing response head, return HTTP 200 with the partial body and close response within 1 second (timeout defined in app.js)',
    withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
      return rp('http://localhost:3000/write-partial-then-timeout', {resolveWithFullResponse: true, simple: false, time: true})
        .then(res => {
          expect(res.elapsedTime).to.be.within(500, 1500);
          expect(res.statusCode).to.be.equal(200);
          expect(res.body).to.be.equal('I\'m partial');
        });
    }));

  it('should, on async error after writing response, return HTTP 200 with full body', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/async-response-then-die', {resolveWithFullResponse: true, simple: false, time: true})
      .then(res => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.equal('I\'m ok');
      });
  }));

  it('should, on sync error after writing response, return HTTP 200 with full body', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/just-response-then-die', {resolveWithFullResponse: true, simple: false, time: true})
      .then(res => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.equal('I\'m ok');
      });
  }));

  it('should, on async error after writing response head (not error before completing response), return HTTP 200 with the partial body', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/async-partial-write-then-die', {resolveWithFullResponse: true, simple: false, time: true})
      .then(res => {
        expect(res.elapsedTime).to.be.below(500);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.equal('I\'m partial');
      });
  }));

  it('should, on sync error after writing response head (not error before completing response), return HTTP 200 with the partial body', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/just-partial-write-then-die', {resolveWithFullResponse: true, simple: false, time: true})
      .then(res => {
        expect(res.elapsedTime).to.be.below(500);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.equal('I\'m partial');
      });
  }));
});