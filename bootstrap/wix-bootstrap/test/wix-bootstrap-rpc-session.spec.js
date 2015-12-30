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

describe('wix bootstrap rpc session', function () {
  this.timeout(60000);

  const rpcServer = rpcServerBuilder.anRpcServer(env.RPC_SERVER_PORT);
  const app = bootstrapBuilder.bootstrapApp('test/app/index.js', { env });

  rpcServer.beforeAndAfter();
  app.beforeAndAfter();

  const wixRequest = () => wixRequestBuilder.aWixRequest(app.getUrl());

  it('should delegate wix session and sent through rpc', done => {
    const req = wixRequest().get('/rpc-wix-session').withSession();

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.deep.equal(req.wixSession.sessionJson.userGuid);
      done();
    });
  });

});


