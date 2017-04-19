const expect = require('chai').use(require('sinon-chai')).expect,
  testkit = require('wix-http-testkit'),
  fetch = require('node-fetch'),
  bootstrapManagement = require('..'),
  express = require('express'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon');

describe('wnp management app', () => {
  let app, log;

  beforeEach(() => aServer().then(({server, logger}) => {
    app = server;
    log = logger;
    return app.start();
  }));

  afterEach(() => app.stop());

  it('should server app-info app', () => {
    fetch(app.getUrl('/app-info/about/api'), {headers: {'accept': 'application/json'}})
      .then(res => res.json())
      .then(json => expect(json).to.contain.deep.property('name', 'app-name'));
  });

  it('should server provided express apps', () => {
    fetch(app.getUrl('/custom'))
      .then(res => res.text())
      .then(text => expect(text).to.equal('from-custom'));
  });

  it('should handle and log errors', () => {
    return fetch(app.getUrl('/error'))
      .then(res => res.text())
      .then(text => {
        expect(text).to.equal('Http Error: 500');
        expect(log.error).to.have.been.calledOnce;
      });
  });


  function aServer() {
    const logger = sinon.createStubInstance(Logger);
    const server = testkit.server();
    const customApp = express()
      .get('/custom', (req, res) => res.send('from-custom'))
      .get('/error', (req, res, next) => next(new Error('woops')));

    return bootstrapManagement({
      appName: 'app-name',
      appVersion: '1.1.1',
      persistentDir: './target/persistent',
      log: logger
    })([() => customApp])
      .then(mgmt => server.getApp().use(mgmt))
      .then(() => {
        return {server, logger};
      });
  }
});
