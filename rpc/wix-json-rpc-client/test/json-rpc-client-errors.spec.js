const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  rpcClient = require('..'),
  _ = require('lodash');

describe('json rpc client error handling', () => {
  const server = aServer()
    .beforeAndAfter();

  it('should include response and request details (without params) on error in rpc server', () => {
    const url = serviceUrl('svc');
    return client(url)
      .invoke('server-fail', 'secret-argument')
      .catch(err => {
        expect(err).to.contain.property('code');
        expect(err.message).to.have.string(url);
        expect(err.message).to.have.string('woops');
        expect(err.message).to.have.string('server-fail');
        expect(err.message).to.have.string('response headers');
        expect(err.message).not.to.have.string('secret-argument');
      });
  });

  it('should include response and request details (without params) on rpc client error', () => {
    const url = serviceUrl('svc');
    return client(url)
      .invoke('non-existent-op', 'secret-argument')
      .catch(err => {
        expect(err.message).to.have.string(url);
        expect(err.message).to.have.string('Method not found');
        expect(err.message).to.have.string('non-existent-op');
        expect(err.message).to.have.string('response headers');
        expect(err.message).not.to.have.string('secret-argument');
      });
  });

  it('should include response and request details (without params) on failed request', () => {
    const url = 'http://localhost:3123/qwe';
    return client(url)
      .invoke('non-existent-op', 'secret-argument')
      .catch(err => {
        expect(err.message).to.have.string(url);
        expect(err.message).to.have.string('ECONNREFUSED 127.0.0.1');
        expect(err.message).to.have.string('non-existent-op');
        expect(err.message).not.to.have.string('secret-argument');
      });
  });

  function serviceUrl(service) {
    return `${server.getUrl()}/${service}`;
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use('/svc', jsonrpc());
    app.post('/svc', (req, res) => {
      res.rpc('server-fail', (params, respond) => respond({error: Error('woops')}));
    });

    return server;
  }

  function client(hook) {
    let args = Array.prototype.slice.call(arguments);
    const factory = rpcClient.factory({timeout: 1000});

    if (args && args.length > 0 && _.isFunction(args[0])) {
      factory.registerBeforeRequestHook(hook);
      args = _.drop(args);
    }

    return factory.clientFactory.apply(factory, args).client();
  }
});
