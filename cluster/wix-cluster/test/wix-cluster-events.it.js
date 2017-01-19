const testkit = require('./support/testkit'),
  eventually = require('wix-eventually'),
  expect = require('chai').use(require('chai-things')).expect;

describe('wix cluster events', function () {
  this.timeout(30000);
  const app = testkit.server('defaults').beforeAndAfterEach();

  it('should publish active worker count', () =>
    workerCountEquals(1)
  );

  it('should publish worker death count', () =>
    deathCountEquals(0)
      .then(() => app.post('/die'))
      .then(() => deathCountEquals(1))
  );

  it('should broadcast messages from worker to all workers', () =>
    app.post('/broadcast/aKey/aValue')
      .then(() => messageBroadcastedIs('aKey', 'aValue'))
  );

  function deathCountEquals(expected) {
    return eventually(() => {
      app.getJson('/stats').then(stats => expect(stats.deathCount).to.equal(expected))
    })
  }

  function workerCountEquals(expected) {
    return eventually(() => {
      app.getJson('/stats').then(stats => expect(stats.workerCount).to.equal(expected))
    })
  }

  function messageBroadcastedIs(key, value) {
    return eventually(() => {
      return app.getJson('/broadcasts').then(broadcasts => {
        expect(broadcasts).to.contain.an.item.that.deep.equals({key, value});
      })
    })
  }
});