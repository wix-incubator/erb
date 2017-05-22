const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  rpcTestkit = require('wix-rpc-testkit'),
  {ErrorCode} = require('wix-errors');

describe('wix bootstrap rpc', function () {
  const env = {RPC_SERVER_PORT: 3310, RPC_TIMEOUT: 200};
  const app = testkit.app('rpc', env).beforeAndAfter();

  describe('rpc client with wix support', () => {
    const rpcServer = rpcTestkit.server({port: env.RPC_SERVER_PORT}).beforeAndAfter();

    it('provides json-rpc2 client with wix add-ons', () => {
      rpcServer.when('TestService', 'testMethod').respond((params, headers) => headers);

      return http.okGet(app.appUrl('/rpc/caller-id'))
        .then(res => expect(res.json()).to.contain.property('x-wix-rpc-caller-id').that.is.string('wix-bootstrap-ng:com.wixpress.npm@'));
    });
  });

  describe('rpc timeout set on composer', () => {
    const httpServer = httpTestkit.server({port: env.RPC_SERVER_PORT}).beforeAndAfter();

    it('should be respected', () => {
      httpServer.getApp().post('*', () => {
      });
      const beforeCall = Date.now();

      return http.get(app.appUrl('/rpc/timeout'), http.accept.json).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.contain.deep.property('errorCode', ErrorCode.RPC_ERROR);
        expect(Date.now() - beforeCall).to.be.within(150, 300);
      });
    });
  });
});
