const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  _ = require('lodash');

describe('wix bootstrap rpc', function () {
  this.timeout(10000);
  const env = {RPC_SERVER_PORT: 3310, RPC_TIMEOUT: 200};
  const app = testkit.server('rpc', env).beforeAndAfter();

  describe('rpc client with wix support', () => {
    const rpcServer = rpcTestkit.server({port: env.RPC_SERVER_PORT}).beforeAndAfter();

    it('provides json-rpc2 client with wix add-ons', () => {
      rpcServer.when('TestService', 'testMethod').respond((params, headers) => headers);

      return http.okGet(app.appUrl('/rpc/caller-id'))
        .then(res => expect(res.json()).to.contain.property('x-wix-rpc-caller-id').that.is.string('wnp-bootstrap-composer@'));
    });
  });

  describe.skip('rpc timeout set on composer', () => {
    const httpServer = httpTestkit.server({port: env.RPC_SERVER_PORT}).beforeAndAfter();

    it('should be respected', () => {
      httpServer.getApp().post('*', _.noop);
      const beforeCall = Date.now();

      return http.get(app.appUrl('/rpc/timeout'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.contain.deep.property('name', 'RpcRequestError');
        expect(res.json()).to.contain.deep.property('message').that.is.string('network timeout');
        expect(Date.now() - beforeCall).to.be.within(150, 300);
      });
    });
  });
});
