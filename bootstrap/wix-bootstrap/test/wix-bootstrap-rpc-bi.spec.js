'use strict';
const request = require('request'),
  _ = require('lodash'),
  chai = require('chai'),
  expect = chai.expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  rpcServerBuilder = require('./support/rpc-server-builder'),
  bootstrapBuilder = require('./support/bootstrap-builder');

chai.use(require('./matchers'));
chai.use(require('chai-things'));

const env = {
  RPC_SERVER_PORT: 3010
};

describe('wix bootstrap rpc bi header propagation', function () {
  this.timeout(60000);

  const rpcServer = rpcServerBuilder.anRpcServer(env.RPC_SERVER_PORT);
  const app = bootstrapBuilder.bootstrapApp('test/app/index.js', { env });

  rpcServer.beforeAndAfter();
  app.beforeAndAfter();

  const wixRequest = () => wixRequestBuilder.aWixRequest(app.getUrl());

  it('should delegate bi cookies and sent through rpc', done => {
    const req = wixRequest().get('/rpc-bi').withBiCookies();

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).asJson.to.have.deep.property('globalSessionId', req.cookies['_wix_browser_sess']);
      expect(body).asJson.to.have.deep.property('clientId', req.cookies['_wixCIDX']);
      done();
    });
  });

});


