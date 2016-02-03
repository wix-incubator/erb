'use strict';
var request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  testkit = require('wix-http-testkit'),
  cookieUtils = require('cookie-utils'),
  domainMiddleware = require('wix-express-domain'),
  petriMiddleware = require('..'),
  wixExpressReqContext = require('wix-express-req-context');

describe('petri middleware', () => {
  const server = aServer();

  chai.use(matchers);

  server.beforeAndAfter();

  it('should rewrite petri cookies to response', done => {
    let requestCookies = {
      '_wixAB3': 'v1',
      '_wixAB3|5754ef35-5f99-41ec-b01c-f781721': 'v2',
      'non-related-cookie': 'v3'
    };

    var expectedCookies = [];
    expectedCookies.push({name: '_wixAB3', value: 'v1'});
    expectedCookies.push({name: '_wixAB3|5754ef35-5f99-41ec-b01c-f781721', value: 'v2'});


    request.get(withCookies(requestCookies), (error, response, body) => {
      expect(body).to.deep.equal('ok');

      [0,1].forEach(index => {
        expect(cookieFromHeader(response, index))
          .to.be.aValidPetriCookie(expectedCookies[index].name, expectedCookies[index].value);
      });
      done();
    });
  });

  it('should not fail without petri cookies in request', done => {
    request.get(server.getUrl(), (error, response, body) => {
      expect(body).to.equal('ok');
      expect(response.headers).to.not.have.property('Set-Cookie');
      done();
    });
  });

  var cookieFromHeader = (response, pos) => {
    return cookieUtils.fromHeader(response.headers['set-cookie'][pos]);
  };

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
    const wixPatchServerResponse = require('wix-patch-server-response');
    wixPatchServerResponse.patch();
    const app = server.getApp();

    app.use(domainMiddleware);
    app.use(wixExpressReqContext.get({seenByInfo: 'who-cares'}));
    app.use(petriMiddleware);

    app.get('/', (req, res) => {
      res.send('ok');
    });

    return server;
  }

  function matchers(chai) {
    chai.Assertion.addMethod('aValidPetriCookie', aValidPetriCookie);

    function aValidPetriCookie(name, value) {
      var cookie = this._obj;
      new chai.Assertion(cookie['Max-Age']).to.be.eql('15552000');
      new chai.Assertion(cookie['Domain']).to.be.eql('.wix.com');
      new chai.Assertion(cookie[name]).to.be.eql(value);
    }
  }

});