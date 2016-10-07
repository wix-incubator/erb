'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client');

describe('error handling', function () {
  this.timeout(60000);

  const app = testkit.server('./test/app').beforeAndAfterEach();

  describe('default error handler', () => {

    it('should log error and kill process', () =>
      http(app.getUrl('/errors/async?m=async'))
        .then(res => expect(res.status).to.equal(500))
        .then(() => delay(1000))
        .then(() => expect(app.output).to.be.string('Error: async'))
        .then(() => expect(http(app.getUrl('/'))).to.be.rejected)
    );

    it('should keep process running, return response and log error', () =>
      http(app.getUrl('/errors/sync?m=sync'), http.accept.json)
        .then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'sync'});
        })
        .then(() => delay(1000))
        .then(() => expect(app.output).to.be.string('Error: sync'))
        .then(() => http(app.getUrl('/')))
    );

    it('should terminate connection and log error on preconfigured timeout', () =>
      http(app.getUrl('errors/timeout?ms=1500'), http.accept.json)
        .then(res => {
          expect(res.status).to.equal(504);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'request timed out after 1000 mSec'});
        })
        .then(() => delay(1000))
        .then(() => expect(app.output).to.be.string('Error: request timed out after 1000 mSec'))
        .then(() => http(app.getUrl('/')))
    );
  });

  describe('custom error handling', () => {

    it('should log error and kill process on async/uncaught error', () =>
      http(app.getUrl('/custom/errors/async?m=async'), http.accept.json)
        .then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-async'});
        })
        .then(() => delay(1000))
        .then(() => expect(app.output).to.be.string('Error: async'))
        .then(() => expect(http(app.getUrl('/'))).to.be.rejected)
    );

    it('should keep process running, return response and log error on sync error', () =>
      http(app.getUrl('/custom/errors/sync?m=sync'), http.accept.json)
        .then(res => {
          expect(res.status).to.equal(500);
          expect(res.json()).to.deep.equal({name: 'Error', message: 'custom-sync'})
        })
        .then(() => delay(1000))
        .then(() => expect(app.output).to.be.string('Error: sync'))
        .then(() => http(app.getUrl('/')))
    );

    it('should terminate connection and log error on preconfigured timeout', () =>
      http(app.getUrl('/custom/errors/timeout?ms=1500'), http.accept.json)
        .then(res => {
          expect(res.status).to.equal(504);
          expect(res.json()).to.deep.equal({name: 'x-timeout', message: 'custom-timeout'})
        })
        .then(() => delay(1000))
        .then(() => expect(app.output).to.be.string('Error: request timed out after 1000 mSec'))
        .then(() => http(app.getUrl('/')))
    );
  });

  function delay(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

});