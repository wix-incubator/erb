const testkit = require('..'),
  chai = require('chai'),
  expect = chai.expect,
  jsonRpcClient = require('wix-json-rpc-client'),
  defaultPort = require('wix-test-ports').RPC;

chai.use(require('chai-as-promised'));

describe('wix-rpc-testkit', () => {

  it('uses default port', () => {
    const server = testkit.server();
    expect(server.getPort()).to.equal(3110).and.equal(defaultPort)
  });
  
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

    it('should throw error on fail response', () =>
      expect(clientFor(app, 'Interface').invoke('failResponse'))
        .to.be.rejected.and.eventually.contain.property('code', -14)
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

  describe('when', () => {
    const app = testkit.server().beforeAndAfter();

    it('should setup the respond value', () => {
      app.when('Service', 'methodName').respond(123);
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(123);
    });

    it('should return null for respond without value', () => {
      app.when('Service', 'methodName').respond();
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(null);
    });

    it('should return respond with false', () => {
      app.when('Service', 'methodName').respond(false);
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(false);
    });


    it('should return null for respond with function and undefined result', () => {
      app.when('Service', 'methodName').respond(() => {});
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(null);
    });
    
    it('should setup an additional method on existing service definition', () => {
      app.when('Service', 'methodName').respond(123);
      app.when('Service', 'methodName2').respond(456);
      return expect(clientFor(app, 'Service').invoke('methodName2')).to.eventually.equal(456);
    });

    it('should overwrite previous response definition', () => {
      app.when('Service', 'methodName').respond(123);
      app.when('Service', 'methodName').respond(456);
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(456);
    });

    it('should overwrite previous response definition', () => {
      app.when('Service', 'methodName').respond(123);
      app.when('Service', 'methodName').respond(456);
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(456);
    });

    it('should reset definitions', () => {
      app.when('Service', 'methodName').respond(123);
      app.reset();
      return expect(clientFor(app, 'Service').invoke('methodName')).to.be.rejected;
    });

    it('should reset when server restarts', () => {
      app.when('Service', 'methodName').respond(123);
      const request = app.doStop()
        .then(() => app.doStart())
        .then(() => clientFor(app, 'Service').invoke('methodName'));
      return expect(request).to.be.rejected;
    });

    it('should allow to set callback as respond definition', () => {
      app.when('Service', 'methodName').respond(() => 123);
      return expect(clientFor(app, 'Service').invoke('methodName')).to.eventually.equal(123);
    });

    it('should pass params and headers to respond callback', () => {
      app.when('Service', 'methodName').respond((params, headers) => ({params, headers}));
      return clientFor(app, 'Service', {'custom-header': 'custom-header-value'})
        .invoke('methodName', 123)
        .then(res => {
          expect(res.params[0]).to.equal(123);
          expect(res.headers).to.contain.property('custom-header', 'custom-header-value');
        })
    });

    it('should setup the error message', () => {
      app.when('Service', 'methodName').throw(new Error('kaki'));
      return expect(clientFor(app, 'Service').invoke('methodName')).to.be.rejectedWith('kaki');
    });
  });

  function anApp() {
    const app = testkit.server();
    app.addHandler('Interface', (req, res) => {
      res.rpc('methodName', (params, respond) => respond({result: 1}));
      res.rpc('responseNull', (params, respond) => respond({result: null}));
      res.rpc('failResponse', (params, respond) => respond({error: {code: -14}}));
    });

    return app;
  }

  function client(url) {
    return jsonRpcClient.factory().clientFactory(url).client({});
  }

  function clientFor(app, service, addHeaders) {
    const factory = jsonRpcClient.factory();
    factory.registerBeforeRequestHook(headers => Object.assign(headers, addHeaders));
    
    return factory.clientFactory(app.getUrl(), service).client({});
  }

});
