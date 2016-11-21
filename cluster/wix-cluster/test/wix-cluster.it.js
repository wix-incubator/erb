'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('./support/testkit');

describe('wix cluster', function () {
  this.timeout(30000);

  describe('defaults', () => {
    const app = testkit.server('defaults').beforeAndAfter();

    it('should start an app with 1 worker by default and returns a promise', () =>
      expect(app.events.filter(evt => evt.evt === 'started').length).to.equal(2)
    );
  });
  
  describe('worker respawn', () => {
    const app = testkit.server('one-worker').beforeAndAfter();

    it('should respawn dying process', () =>
      app.get('/die')
        .then(() => testkit.delay())
        .then(() => app.get('/'))
        .then(() => app.getStats())
        .then(stats => expect(stats.deathCount).to.equal(1))
    );
  });

  describe('graceful worker shutdown', () => {
    const app = testkit.server('one-worker').beforeAndAfterEach();

    it('should shut-down dying worker process gracefully', () =>
      Promise.all([app.get('/delay-event/1000'), app.get('/die')])
        .then(() => testkit.delay())
        .then(() => app.getStats())
        .then(stats => expect(stats.deathCount).to.equal(1))
        .then(() => expect(app.events.filter(evt => evt.evt === 'delayed-completed').length).to.equal(1))
    );

    it('should respawn dying process and answer from a new instance', () => {
      const ids = [];
      return Promise.all([app.get('/id'), app.get('/die')]).then(res => ids.push(res[0].body))
        .then(() => testkit.delay())
        .then(() => app.get('/id')).then(res => ids.push(res.body))
        .then(() => expect(ids.pop()).to.not.equal(ids.pop()))
        .then(() => app.getStats())
        .then(stats => expect(stats.deathCount).to.equal(1))
    });

    it('should invoke stop function returned from app to gracefully stop the app', () =>
      app.get('/die')
        .then(() => testkit.delay())
        .then(() => app.getStats())
        .then(stats => expect(stats.deathCount).to.equal(1))
        .then(() => expect(app.events.filter(evt => evt.evt === 'graceful-shutdown').length).to.equal(1))
    );

  });
});
