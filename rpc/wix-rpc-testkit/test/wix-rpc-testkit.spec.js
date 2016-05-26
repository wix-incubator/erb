'use strict';
const testkit = require('..'),
  chai = require('chai'),
  expect = chai.expect,
  jsonRpcClient = require('wix-json-rpc-client');

chai.use(require('chai-as-promised'));

describe('wix-rpc-testkit', () => {

  describe('start/stop', () => {
    const app = anApp();

    before(() => app.doStart());
    after(() => app.doStop());

    it('should start/stop app around test', () =>
      expect(clientFor(app, 'Interface').invoke('methodName')).to.eventually.equal(1)
    );

    after(() => expect(clientFor(app, 'Interface').invoke('methodName')).to.be.rejected);
  });


  describe('extends wix-testkit-base', () => {
    const app = anApp().beforeAndAfterEach();

    it('should start/stop app around test', () =>
      expect(clientFor(app, 'Interface').invoke('methodName')).to.eventually.equal(1)
    );
  });

  describe('responses', () => {
    const app = anApp().beforeAndAfterEach();

    it('should accept null response as a valid one', () =>
      expect(clientFor(app, 'Interface').invoke('responseNull')).to.eventually.equal(null)
    );
  });

  describe('getUrl', () => {
    const app = anApp();

    it('should provide base url if used without params', () => {
      expect(app.getUrl()).to.equal(`http://localhost:${app.getPort()}`);
    });

    it('should provide base url if used without params', () => {
      expect(app.getUrl()).to.equal(`http://localhost:${app.getPort()}`);
    });


    it('should provide full url if used with service name', () => {
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
      res.rpc('responseNull', (params, respond) => respond({result: null}));
    });

    return app;
  }

  function client(url) {
    return jsonRpcClient.factory().clientFactory(url).client({});
  }

  function clientFor(app, service) {
    return jsonRpcClient.factory().clientFactory(app.getUrl(), service).client({});
  }
});