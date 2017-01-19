'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('./support/testkit'),
  stats = require('./support/stats'),
  eventually = require('wix-eventually');

describe('wix cluster', function () {
  this.timeout(30000);
  const app = testkit.server('defaults').beforeAndAfterEach();

  it('should start an app with 1 worker by default and return a promise', () =>
    stats.assertWorkerCountEquals(1)
      .then(() => expect(app.output()).to.be.string('callback after startup'))
  );

  it('should re-spawn dying process', () =>
    app.post('/die')
      .then(() => app.okGet('/'))
      .then(() => stats.assertDisconnectCountEquals(1))
  );

  it('should respawn dying process and answer from a new instance', () => {
    const ids = [];
    return app.okGet('/id').then(res => ids.push(res.body))
      .then(() => app.post('/die'))
      .then(() => app.okGet('/id')).then(res => ids.push(res.body))
      .then(() => expect(ids.pop()).to.not.equal(ids.pop()))
      .then(() => stats.assertDisconnectCountEquals(1))
  });

  it('should invoke stop function returned from app to gracefully stop the app', () =>
    app.post('/die')
      .then(() => stats.assertDisconnectCountEquals(1))
      .then(() => eventually(() => expect(app.output()).to.be.string('app closed function called')))
  );
});
