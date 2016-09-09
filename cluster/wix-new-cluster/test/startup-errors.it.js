'use strict';
const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  assert = require('./support/asserts'),
  eventually = require('./support/eventually');

describe('wix cluster startup error handling', function () {
  this.timeout(10000);

  describe('app function that fails with sync error', () => {
    const app = testkit.server('startup-failure-sync', {}, testkit.checks.stdOut('fallback app booted')).beforeAndAfter();

    it('should detect failure, kill worker and start a fallback app', () => {
      return Promise.resolve()
        .then(() => expect(app.output()).to.be.string('fallback got error'))
        .then(() => eventually(() => assert.workerCount(app, 0)));
    });
  });

  describe('app function that returns a failed promise', () => {
    const app = testkit.server('startup-failure-reject', {}, testkit.checks.stdOut('fallback app booted')).beforeAndAfter();

    it('should detect failure, kill worker and start a fallback app', () => {
      return Promise.resolve()
        .then(() => expect(app.output()).to.be.string('fallback got error'))
        .then(() => eventually(() => assert.workerCount(app, 0)));
    });
  });

  describe('app function that fails with uncaught exception', () => {
    const app = testkit.server('startup-failure-uncaught', {}, testkit.checks.stdOut('fallback app booted')).beforeAndAfter();

    it('should detect hight failure rate, kill workers and start a fallback app', () => {
      return Promise.resolve()
        .then(() => expect(app.output()).to.be.string('App terminated due to high worker death count (throttled)'))
        .then(() => assert.workerCount(app, 0));
    });
  });
});

