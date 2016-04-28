'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch');

//TODO: add versions for http output
describe('error handling', function () {
  this.timeout(60000);

  describe('default error handler', () => {

    describe('critical errors', () => {
      const env = envSupport.bootstrap();
      const app = testkit
        .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
        .beforeAndAfter();

      it('should log error and kill process', () =>
        fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/errors/async?m=async`)
          .then(res => expect(res.status).to.equal(500))
          .then(() => delay(1000))
          .then(() => expect(app.stderr().join()).to.be.string('Error: async'))
          .then(() => expect(fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/`)).to.be.rejected)
      );
    });

    describe('caught exceptions', () => {
      const env = envSupport.bootstrap();
      const app = testkit
        .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
        .beforeAndAfter();

      it('should keep process running, return response and log error', () =>
        fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/errors/sync?m=sync`, {headers: {'accept': 'application/json'}})
          .then(res => {
            expect(res.status).to.equal(500);
            return res.json();
          })
          .then(json => expect(json).to.deep.equal({name: 'Error', message: 'sync'}))
          .then(() => delay(1000))
          .then(() => expect(app.stderr().join()).to.be.string('Error: sync'))
          .then(() => fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/`))
      );
    });

    describe('timeouts', () => {
      const env = envSupport.bootstrap();
      const app = testkit
        .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
        .beforeAndAfter();

      it('should terminate connection and log error on preconfigured timeout', () =>
        fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/errors/timeout?ms=1500`, {headers: {'accept': 'application/json'}})
          .then(res => {
            expect(res.status).to.equal(504);
            return res.json();
          })
          .then(json => expect(json).to.deep.equal({name: 'Error', message: 'request timed out after 1000 mSec'}))
          .then(() => delay(1000))
          .then(() => expect(app.stderr().join()).to.be.string('Error: request timed out after 1000 mSec'))
          .then(() => fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/`))
      );
    });
  });

  describe('custom error handling', () => {
    
    describe('critical errors', () => {
      const env = envSupport.bootstrap();
      const app = testkit
        .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
        .beforeAndAfter();

      it('should log error and kill process', () =>
        fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/custom/errors/async?m=async`)
          .then(res => {
            expect(res.status).to.equal(500);
            return res.json()
          })
          .then(json => expect(json).to.deep.equal({name: 'Error', message: 'custom-async'}))
          .then(() => delay(1000))
          .then(() => expect(app.stderr().join()).to.be.string('Error: async'))
          .then(() => expect(fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/`)).to.be.rejected)
      );
    });

    describe('caught exceptions', () => {
      const env = envSupport.bootstrap();
      const app = testkit
        .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
        .beforeAndAfter();

      it('should keep process running, return response and log error', () =>
        fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/custom/errors/sync?m=sync`, {headers: {'accept': 'application/json'}})
          .then(res => {
            expect(res.status).to.equal(500);
            return res.json();
          })
          .then(json => expect(json).to.deep.equal({name: 'Error', message: 'custom-sync'}))
          .then(() => delay(1000))
          .then(() => expect(app.stderr().join()).to.be.string('Error: sync'))
          .then(() => fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/`))
      );
    });

    describe('timeouts', () => {
      const env = envSupport.bootstrap();
      const app = testkit
        .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
        .beforeAndAfter();

      it('should terminate connection and log error on preconfigured timeout', () =>
        fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/custom/errors/timeout?ms=1500`, {headers: {'accept': 'application/json'}})
          .then(res => {
            expect(res.status).to.equal(504);
            return res.json();
          })
          .then(json => expect(json).to.deep.equal({name: 'x-timeout', message: 'custom-timeout'}))
          .then(() => delay(1000))
          .then(() => expect(app.stderr().join()).to.be.string('Error: request timed out after 1000 mSec'))
          .then(() => fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/`))
      );
    });
  });

  function delay(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

});