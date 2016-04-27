'use strict';
const chai = require('chai'),
  expect = chai.expect,
  testkit = require('wix-http-testkit'),
  jsonrpc = require('node-express-json-rpc2'),
  rpcClient = require('..'),
  _ = require('lodash');

chai.use(require('chai-as-promised'));

describe('json rpc client error handling', () => {
  const server = aServer()
    .beforeAndAfter();

  it('should include request and response details on error in rpc server', done => {
    const url = serviceUrl('svc');
    client(url)
      .invoke('server-fail')
      .catch(err => {
        expect(err.reqUri).to.equal(url);
        expect(err.message).to.equal('woops');
        expect(err.reqOptions.body).to.contain.string('server-fail');
        expect(err.respHeaders).to.be.defined;
        done();
      }).catch(err => done(err));
  });

  it('should include request and response details on rpc client error', done => {
    const url = serviceUrl('svc');
    client(url)
      .invoke('non-existent-op')
      .catch(err => {
        expect(err.reqUri).to.equal(url);
        expect(err.message).to.equal('Method not found');
        expect(err.reqOptions.body).to.contain.string('non-existent-op');
        expect(err.respHeaders).to.be.defined;
        done();
      }).catch(err => done(err));
  });

  it('should include request and response details on failed request', done => {
    const url = 'http://localhost:3123/qwe';
    client(url)
      .invoke('non-existent-op')
      .catch(err => {
        expect(err.reqUri).to.equal(url);
        expect(err.message).to.be.string('ECONNREFUSED 127.0.0.1');
        expect(err.reqOptions.body).to.contain.string('non-existent-op');
        expect(err.respHeaders).to.be.defined;
        done();
      }).catch(err => done(err));
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

