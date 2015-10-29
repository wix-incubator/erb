'use strict';
const request = require('request'),
  expect = require('chai').expect,
  wixDomainMiddleware = require('..'),
  wixDomain = require('wix-domain'),
  httpTestKit = require('wix-http-testkit');

describe('middleware', () => {
  let server = aServer();
  server.beforeAndAfter();

  it('should track a request with wix domain', done => {
    let queryParam = 'someValue';

    request.get(`${server.url}?q=${queryParam}`, (error, response, body) => {
      expect(body).to.equal(queryParam);
      done();
    });
  });
});

function aServer() {
  const server = httpTestKit.testApp();
  const testApp = server.getApp();

  testApp.use(wixDomainMiddleware);
  testApp.get('/', (req, res) => {
    wixDomain.get().someKey = req.query.q;

    process.nextTick(() => {
      res.send(wixDomain.get().someKey);
    });
  });

  return server;
}