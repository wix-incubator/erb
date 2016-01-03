'use strict';
const request = require('request'),
  _ = require('lodash'),
  chai = require('chai'),
  expect = chai.expect,
  chance = require('chance')(),
  wixRequestBuilder = require('./support/wix-request-builder'),
  rpcServerBuilder = require('./support/rpc-server-builder'),
  bootstrapBuilder = require('./support/bootstrap-builder');

chai.use(require('./matchers'));
chai.use(require('chai-things'));

const env = {
  RPC_SERVER_PORT: 3010
};

describe('wix bootstrap rpc request context ', function () {
  this.timeout(60000);

  const rpcServer = rpcServerBuilder.anRpcServer(env.RPC_SERVER_PORT);
  const app = bootstrapBuilder.bootstrapApp('test/app/index.js', { env });

  rpcServer.beforeAndAfter();
  app.beforeAndAfter();

  const wixRequest = () => wixRequestBuilder.aWixRequest(app.getUrl());

  it('should get request context from remote rpc', done => {
    let reqId = chance.guid();
    let userAgent = 'kfir-user-agent';
    let url = '/rpc-req-context';
    let ip = '1.1.1.1';
    let geo = 'BR';
    const req = wixRequest().get(url)
      .withRequestId(reqId)
      .withUserAgent(userAgent)
      .withIp(ip)
      .withGeoHeader(geo);

    request(req.options(), (error, response, body) => {
      const webContext = JSON.parse(body);
      expect(response.statusCode).to.equal(200);
      expect(webContext.requestId).to.equal(reqId);
      expect(webContext.userAgent).to.equal(userAgent);
      expect(webContext.remoteIp).to.equal(ip);
      expect(webContext.url).to.contain(url);
      expect(webContext.geoData.origCountryCode).to.contain(geo);
      done();
    });
  });

});


