'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch'),
  retry = require('retry-promise').default,
  emitter = require('wix-config-emitter');

describe('app', function () {
  this.timeout(10000);
  const app = testkit.server('index');

  before(() => {
    return emitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
      .fn('statsd_host', 'localhost')
      .emit()
      .then(() => app.start());
  });

  after(() => app.stop());

  it('should respond with hi on hello', () =>
    fetch(app.getUrl('/api/hello')).then(res => {
      expect(res.status).to.equal(200);
      return res.text();
    }).then(text => expect(text).to.equal('hi'))
  );

  it.only('should restart failing worker', () => {
    let id = null;
    return fetch(app.getUrl('/api/info'))
      .then(res => res.json())
      .then(resJson => id = resJson.workerId)
      .then(() => fetch(app.getUrl('/api/die')))
      .then(() => retry(() => {
          return fetch(app.getUrl('/api/info'))
          .then(res => res.json())
          .then(resJson => expect(id).to.not.equal(resJson.workerId));
      }));
  });
});