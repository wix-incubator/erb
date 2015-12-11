'use strict';
var request = require('request'),
  expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  cookieUtils = require('cookie-utils'),
  domainMiddleware = require('wix-express-domain'),
  petriMiddleware = require('..'),
  petri = require('wix-petri');

describe('petri middleware', () => {
  const server = aServer();

  server.beforeAndAfter();

  it('should extract petri cookies', done => {
    let requestCookies = {
      '_wixAB3': 'v1',
      '_wixAB3|5754ef35-5f99-41ec-b01c-f781721': 'v2',
      'non-related-cookie': 'v3'
    };

    let expectedCookies = {
      '_wixAB3': 'v1',
      '_wixAB3|5754ef35-5f99-41ec-b01c-f781721': 'v2'
    };

    request.get(withCookies(requestCookies), (error, response, body) => {
      expect(JSON.parse(body)).to.deep.equal(expectedCookies);
      done();
    });
  });

  it('should not fail without petri cookies in request', done => {
    request.get(server.getUrl(), (error, response, body) => {
      expect(JSON.parse(body)).to.deep.equal({});
      done();
    });

  });

  function withCookies(cookies) {
    return {
      url: server.getUrl(),
      headers: {
        'cookie': cookieUtils.toHeader(cookies)
      }
    };
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use(domainMiddleware);
    app.use(petriMiddleware);

    app.get('/', (req, res) => {
      res.send(petri.get());
    });

    return server;
  }
});