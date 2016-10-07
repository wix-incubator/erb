'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('./support/testkit'),
  checks = require('wix-childprocess-testkit').checks;

describe('wix cluster error handling', function () {
  this.timeout(10000);

  describe('for a client app that throws a sync error', () => {
    const app = testkit.server('worker-fails', {}, checks.stdErrOut('Failed to start worker:'))
      .beforeAndAfterEach();

    it('should log error and callback with error given app fails to start', () =>
      testkit.delay().then(() =>
        expect(app.events.filter(evt => evt.evt === 'failed').length).to.equal(1))
    );
  });

  describe('for a client app that throws an async error', () => {
    const app = testkit.server('worker-uncaught-exception-during-startup', {}, checks.stdErrOut('Detected cyclic death not spawning new worker'))
      .beforeAndAfterEach();

    it('should throttle fork() and stop respawning process', () =>
    expect(app.output()).to.be.string('Detected cyclic death not spawning new worker'));
  });

  describe('for a client app that throws an async error', () => {
    const app = testkit
      .server('worker-fails', {}, checks.stdErrOut('Failed to start worker:'))
      .beforeAndAfterEach();

    it('should log error and callback with error given app fails to start', () =>
      testkit.delay().then(() =>
        expect(app.events.filter(evt => evt.evt === 'failed').length).to.equal(1))
    );
  });
  
});
