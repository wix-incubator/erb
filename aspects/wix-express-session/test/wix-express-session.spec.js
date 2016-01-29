'use strict';
const Chance = require('chance'),
  chance = new Chance(),
  cookieUtils = require('cookie-utils'),
  testkit = require('wix-http-testkit'),
  domainMiddleware = require('wix-express-domain'),
  wixSessionMiddleware = require('..'),
  wixSession = require('wix-session'),
  wixSessionTestkit = require('wix-session-crypto-testkit'),
  request = require('request'),
  expect = require('chai').expect;

describe('wix session express middleware', () => {
  const mainKey = wixSessionTestkit.aValidBundle().mainKey;
  const server = aServer(mainKey);

  server.beforeAndAfter();

  it('should fill session aspect for request with wix session', done => {
    const bundle = wixSessionTestkit.aValidBundle({mainKey});
    request.get(withSession(bundle), (error, response, body) => {
      expect(JSON.parse(body)).to.deep.equal(bundle.sessionJson);
      done();
    });
  });

  it('should return undefined for a request without wix session', done => {
    request.get(server.getUrl(), (error, response, body) => {
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

  it('should not fill session aspect for a request with expired session', done => {
    const bundle = wixSessionTestkit.aValidBundle({mainKey, session: {
      expiration: new Date(new Date().getTime() - 60)
    }});
    request.get(withSession(bundle), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.be.empty;
      done();
    });
  });

  function withSession(bundle) {
    let cookies = {};
    cookies[bundle.cookieName] = bundle.token;

    return {
      url: server.getUrl(),
      headers: {
        cookie : cookieUtils.toHeader(cookies)
      }
    };
  }

  function aServer(mainKey) {
    const server = testkit.server();
    const app = server.getApp();

    app.use(domainMiddleware);
    app.use(wixSessionMiddleware.get(mainKey));

    app.get('/', (req, res) => {
      wixSession.get() ? res.send(wixSession.get().session) : res.send();
    });

    return server;
  }
});