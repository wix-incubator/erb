'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  net = require('net'),
  _ = require('lodash'),
  rp = require('request-promise'),
  envSupport = require('env-support');

chai.use(require('chai-as-promised'));

describe('wix-childprocess-testkit', function () {
  this.timeout(10000);
  let server, env;

  describe('startup', () => {

    beforeEach(() => env = envSupport.basic());

    afterEach(() => {
      if (server.isRunning) {
        return server.stop();
      }
    });

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
      expect(anApp('app-timeout-2000', 1000).start()).to.be.rejected
    );

    it('should expose stdout/stderr', () =>
      anApp('app-log').start().then(() => {
        expect(server.stderr().pop()).to.contain('error log');
        expect(server.stdout().pop()).to.contain('info log');
      })
    );

    it('should emit callback with error if embedded app fails', () =>
      anApp('app-throw').start()
        .then(failOnNoError)
        .catch(err => expect(err).to.be.instanceof(Error))
        .then(() => new Promise(resolve => setTimeout(resolve(), 500)))
        .then(verifyNotListening)
    );
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
    server = testkit.server(`./test/apps/${app}.js`, {timeout, env: env}, testkit.checks.httpGet('/test'));
    return server;
  }

  function aSuccessGet(path) {
    const effectivePath = path || '';
    return rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}${effectivePath}`);
  }
});
