'use strict';
const testkit = require('..'),
  chai = require('chai'),
  expect = chai.expect,
  jsonRpcClient = require('json-rpc-client');

chai.use(require('chai-as-promised'));

describe('rpc testkit', () => {

  describe('start/stop with promises', () => {
    const app = anApp();

    before(() => app.start());
    after(() => app.stop());

    it('should start/stop app around test', () =>
      expect(clientFor(app, 'Interface').invoke('methodName')).to.eventually.equal(1)
    );

    after(() => expect(clientFor(app, 'Interface').invoke('methodName')).to.be.rejected);
  });

  describe('start/stop with callbacks', () => {
    const app = anApp();

    before(done => app.start(done));
    after(done => app.stop(done));

    it('should start/stop app around test', () =>
      expect(clientFor(app, 'Interface').invoke('methodName')).to.eventually.equal(1)
    );

    after(() => expect(clientFor(app, 'Interface').invoke('methodName')).to.be.rejected);
  });


  describe('beforeAndAfter', () => {
    const app = anApp();

    app.beforeAndAfter();

    it('should start/stop app around test', () =>
      expect(clientFor(app, 'Interface').invoke('methodName')).to.eventually.equal(1)
    );

    after(() => expect(clientFor(app, 'Interface').invoke('methodName')).to.be.rejected);
  });

  describe('beforeAndAfterEach', () => {
    const app = anApp();

    app.beforeAndAfterEach();

    it('should start/stop app around test', () =>
      expect(clientFor(app, 'Interface').invoke('methodName')).to.eventually.equal(1)
    );

    afterEach(() => expect(clientFor(app, 'Interface').invoke('methodName')).to.be.rejected);
  });

  describe('getUrl', () => {
    const app = anApp();
    it('should provide base url if used without params', () => {
      expect(app.getUrl()).to.equal(`http://localhost:${app.getPort()}`);
    });

    it('should provide full urlif used with service name', () => {
      expect(app.getUrl('SvcName')).to.equal(`http://localhost:${app.getPort()}/_rpc/SvcName`);
    });
  });

  describe('handler mounts', () => {
    const app = anApp();
    app.beforeAndAfter();

    it('should be mounted both on root and "_rpc"', () => {
      return expect(client(`${app.getUrl()}/Interface`).invoke('methodName')).to.eventually.equal(1)
        .then(() => expect(client(`${app.getUrl()}/_rpc/Interface`).invoke('methodName')).to.eventually.equal(1));
    });
  });

  function anApp() {
    const app = testkit.server();
    app.addHandler('Interface', (req, res) => {
      res.rpc('methodName', (params, respond) => respond({result: 1}));
    });

    return app;
  }

  function client(url) {
    return jsonRpcClient.factory().client(url);
  }

  function clientFor(app, service) {
    return jsonRpcClient.factory().client(app.getUrl(), service);
  }
});