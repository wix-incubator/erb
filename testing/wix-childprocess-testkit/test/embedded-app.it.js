'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  net = require('net'),
  _ = require('lodash'),
  rp = require('request-promise'),
  env = require('env-support').basic();

chai.use(require('chai-as-promised'));

describe('embedded app', function () {
  this.timeout(10000);
  let testApp;

  describe('startup', () => {

    afterEach(() => testApp.stop());

    it('should start/stop embedded app with http get availability check', () =>
      anApp('app-http').start().then(rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}`))
    );

    it('should transfer environment onto child app', () => {
        process.env.BOO = 'wohoo';
        anApp('app-http').start()
          .then(() => aSuccessGet('/env'))
          .then(res => {
            expect(JSON.parse(res)).to.contain.deep.property('BOO', 'wohoo');
          });
    });


    it('should respect provided timeout', () =>
      anApp('app-timeout-2000', 1000).start()
        .then(failOnNoError)
        .catch(err => expect(err).to.be.instanceof(Error))
    );

    it('should expose stdout/stderr', () =>
      anApp('app-log').start().then(() => {
        expect(testApp.stderr().pop()).to.contain('error log');
        expect(testApp.stdout().pop()).to.contain('info log');
      })
    );
  });

  describe('cleanup on failure', () => {

    it('should emit callback with error if embedded app fails', () =>
      anApp('app-throw').start()
        .then(failOnNoError)
        .catch(err => expect(err).to.be.instanceof(Error))
        .then(() => new Promise(resolve => setTimeout(resolve(), 500)))
        .then(verifyNotListening)
    );
  });

  describe('before and after', () => {
    testApp = anApp('app-http');
    before(verifyNotListening);
    testApp.beforeAndAfter();
    it('should start a service before test and shutdown afterwards', () => aSuccessGet());
    after(verifyNotListening);
  });


  describe('before and after each', () => {
    testApp = anApp('app-http');
    beforeEach(verifyNotListening);
    testApp.beforeAndAfterEach();
    it('should start a service before test and shutdown afterwards', () => aSuccessGet());
    afterEach(verifyNotListening);
  });

  function failOnNoError() {
    throw new Error('error expected, but got into "then"...');
  }

  function verifyNotListening() {
    return new Promise((resolve, reject) => {
      const client = net.Socket();

      client.on('error', () => resolve());

      client.connect({port: env.PORT}, () => {
        client.end();
        reject(Error('expected connect failure, but could connect on port: ' + env.PORT));
      });
    });
  }

  function anApp(app, timeout) {
    testApp = testkit.embeddedApp(`./test/apps/${app}.js`, {timeout, env: env}, testkit.checks.httpGet('/test'));
    return testApp;
  }

  function aSuccessGet(path) {
    const effectivePath = path || '';
    return rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}${effectivePath}`);
  }
});
