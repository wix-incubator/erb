'use strict';
const chai = require('chai'),
  expect = chai.expect,
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  withApp = require('../index').withApp;

chai.use(chaiAsPromised);

describe('wix-childprocess-testkit', function() {
  this.timeout(30000);

  it('should run the server for a test', withApp('./test/apps/launcher.js', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000')
      .then(res => {
        expect(res).to.be.equal('Hello');
      });
  }));

  it('should not run a server if it does not send a "listening" signal', () => {
    return withApp('./test/apps/launcher-without-notifier.js', [], {workerCount: 1}, (app) => {})()
      .then(() => {
        chai.assert.notOk('application started', 'application should not start if it does not report listening signal');
      }, (error) => {
        expect(error.message).to.contain('Timeout trying to initialize app [./test/apps/launcher-without-notifier.js]');
        expect(error.message).to.contain('Failed to recieve the listening signal within 4 second.');
        expect(error.message).to.contain('Did you remember to include the testNotifierPlugin in your cluster builder?');
      });
  });

  it('should not run a server if it does not run', () => {
    return withApp('./test/apps/not-running-launcher.js', [], {workerCount: 1}, (app) => {})()
      .then(() => {
        chai.assert.notOk('application started', 'application should not start if it does not report listening signal');
      }, (error) => {
        expect(error.message).to.contain('Child process unexpectedly died during initialization.');
        expect(error.message).to.contain('The listening signal was not received.');
      });
  });

  it('should catch failures if server crashes', () => {
    return withApp('./test/apps/running-and-dying-launcher.js', [], {workerCount: 1}, (app) => {
      return delay(1000)
        .then(() => {
          console.log('performing http request against a server that should be down');
          return rp('http://localhost:3000');
        });
    })()
      .then(() => {
        chai.assert.notOk('test passed', 'test should not pass if the server crashes, not allowing for the http request to be performed');
      }, (error) => {
        console.log(error);
        expect(error.message).to.contain('ECONNREFUSED');
      });
  });

});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
