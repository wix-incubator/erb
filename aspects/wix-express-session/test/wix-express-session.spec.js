'use strict';
const Chance = require('chance'),
  chance = new Chance(),
  cookieUtils = require('cookie-utils'),
  httpTestkit = require('wix-http-testkit'),
  domainMiddleware = require('wix-express-domain'),
  wixSessionMiddleware = require('..'),
  wixSession = require('wix-session'),
  wixSessionTestkit = require('wix-session-crypto-testkit'),
  request = require('request'),
  expect = require('chai').expect;

describe('wix session express middleware', () => {
  const bundle = wixSessionTestkit.aValidBundle();
  const server = aServer(bundle);

  server.beforeAndAfter();

  it('should fill session aspect for request with wix session', done => {
    request.get(withSession(bundle.token), (error, response, body) => {
      expect(JSON.parse(body)).to.deep.equal(bundle.sessionJson);
      done();
    });
  });

  it('should return undefined for a request without wix session', done => {
    request.get(server.url, (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.be.empty;
      done();
    });
  });

  it('should return undefined for a request with malformed wix session', done => {
    request.get(withSession('invalid_session'), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.be.empty;
      done();
    });
  });

  function withSession(token) {
    let cookies = {};
    cookies[bundle.cookieName] = token;

    return {
      url: server.url,
      headers: {
        cookie : cookieUtils.toHeader(cookies)
      }
    };
  }

  function aServer(bundle) {
    const server = httpTestkit.testApp();
    const app = server.getApp();

    app.use(domainMiddleware);
    app.use(wixSessionMiddleware.get(bundle.mainKey));

    app.get('/', (req, res) => {
      res.send(wixSession.get());
    });

    return server;
  }
});