'use strict';
const request = require('request'),
  _ = require('lodash'),
  chai = require('chai'),
  expect = chai.expect,
  cookieUtils = require('cookie-utils'),
  wixRequestBuilder = require('./support/wix-request-builder'),
  rpcServerBuilder = require('./support/rpc-server-builder'),
  bootstrapBuilder = require('./support/bootstrap-builder');

chai.use(require('./matchers'));
chai.use(require('chai-things'));

const env = {
  RPC_SERVER_PORT: 3010
};

describe('wix bootstrap rpc petri', function () {
  this.timeout(60000);

  const rpcServer = rpcServerBuilder.anRpcServer(env.RPC_SERVER_PORT);
  const app = bootstrapBuilder.bootstrapApp('test/app/index.js', { env });

  rpcServer.beforeAndAfter();
  app.beforeAndAfter();

  const wixRequest = () => wixRequestBuilder.aWixRequest(app.getUrl());

  it.only('should call petri on RPC for empty cookie', done => {
    const req = wixRequest().get('/rpc-petri');

    request(req.options(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      console.log(cookieUtils.fromHeader(response.headers['cookie']));
      expect(body).asJson.to.deep.equal({aSpec: true});
      done();
    });
  });

});


