'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('..'),
  net = require('net'),
  _ = require('lodash'),
  rp = require('request-promise');

chai.use(require('chai-as-promised'));

const env = {
  PORT: testkit.env.randomPort(),
  MOUNT_POINT: '/app'
};

describe('embedded app', function () {
  this.timeout(10000);
  let testApp;

  describe('startup', () => {

    afterEach(done => testApp.stop(done));

    it('should start/stop embedded app with http get availability check', done => {
      anApp('app-http').start(() => aSuccessGet(done));
    });

    it('should respect provided timeout', done => {
      anApp('app-timeout-2000', 1000).start(err => {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });

    it('should timeout within 4 seconds by default', done => {
      anApp('app-timeout-5000').start(err => {
        expect(err).to.be.instanceof(Error);
        verifyNotListening(done);
      });
    });

    it('should expose stdout/stderr', done => {
      anApp('app-log').start(() => {
        expect(testApp.stderr().pop()).to.contain('error log');
        expect(testApp.stdout().pop()).to.contain('info log');
        done();
      });
    });
  });

  describe('cleanup on failure', () => {

    it('should emit callback with error if embedded app fails', done => {
      anApp('app-throw').start(err => {
        expect(err).to.be.instanceof(Error);
        verifyNotListening(done);
      });
    });
  });

  describe('before and after', () => {
    testApp = anApp('app-http');

    before(done => verifyNotListening(done));

    testApp.beforeAndAfter();

    it('should start a service before test and shutdown afterwards', done => {
      aSuccessGet(done);
    });

    after(done => verifyNotListening(done));
  });


  describe('before and after each', () => {
    testApp = anApp('app-http');

    beforeEach(done => verifyNotListening(done));

    testApp.beforeAndAfterEach();

    it('should start a service before test and shutdown afterwards', done => {
      aSuccessGet(done);
    });

    afterEach(done => verifyNotListening(done));
  });

  describe('health notifier', () => {

    it('should kill app if health notifier is not present on client app', done => {
      anApp('no-notifier').start(() => {
        aSuccessGet(() => setTimeout(() => verifyNotListening(done), 2000));
      });
    });

    it.only('should kill an app if parent process stops sending notifications', done => {
      anApp('app-http').start(() => {
        testApp._removeWatcher();
        aSuccessGet(() => setTimeout(() => verifyNotListening(() => {
          expect(testApp.stderr().pop()).to.equal('Did not receive "ping" from master within predefined timeout - Parent process died?. Suiciding...\n');
          done();
        }), 4000));
      });
    });
  });

  describe('within app', () => {

    afterEach(done => verifyNotListening(done));

    it('start/stop server within test',
      testkit.withinApp('./test/apps/app-http.js', {env}, testkit.checks.httpGet('/test'), () => {
        return rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
          .then(res => expect(res).to.be.equal('Hello'));
      }));

    it('should not run a server if alive check fails', () => {
      return testkit.withinApp('./test/apps/app-http.js', {
          timeout: 1000,
          env
        }, testkit.checks.httpGet('/testz'), app => {
        })()
        .then(() => {
          chai.assert.notOk('application started', 'application should not start if it does not report listening signal');
        }, (error) => {
          expect(error.message).to.contain('Timeout of 1000 exceeded while waiting for embedded app ./test/apps/app-http.js to start.');
        });
    });

    it('should catch failures if server crashes', () => {
      return testkit.withinApp('./test/apps/app-throw.js', {
          timeout: 1000,
          env
        }, testkit.checks.httpGet('/test'), () => {
        })()
        .then(() => {
          chai.assert.notOk('test passed', 'test should not pass if the server crashes, not allowing for the http request to be performed');
        }, (error) => {
          expect(error.message).to.contain('Program exited with code: 1');
        });
    });
  });

  function verifyNotListening(done) {
    const cb = _.once(done);
    const client = net.Socket();

    client.on('error', () => cb());

    client.connect({port: env.PORT}, () => {
      client.end();
      cb(Error('expected connect failure, but could connect on port: ' + env.PORT));
    });
  }

  function anApp(app, timeout) {
    testApp = testkit.embeddedApp(`./test/apps/${app}.js`, {timeout, env: env}, testkit.checks.httpGet('/test'));
    return testApp;
  }

  function aSuccessGet(done) {
    request(`http://localhost:${env.PORT}${env.MOUNT_POINT}`, (error, response) => {
      expect(error).to.be.null;
      expect(response.statusCode).to.equal(200);
      done();
    });
  }
})
;
