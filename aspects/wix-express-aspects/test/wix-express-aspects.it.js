'use strict';
var fetch = require('node-fetch'),
  expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  cookieUtils = require('cookie-utils'),
  aspectsMiddleware = require('..'),
  Aspect = require('wix-aspects').Aspect;

describe('aspects middleware it', () => {
  const server = aServer().beforeAndAfter();

  it('should build aspects and provide them onto request object', () =>
    aJsonGet().then(json => {
      expect(json).to.deep.equal({
        name1: {
          name1Key: 'name1Value'
        },
        name2: {
          name2Key: 'name2Value'
        }
      });
    }));

  it('should enrich response with per-aspect defined cookies/headers', () =>
    aGet().then(res => {
      const cookies = res.headers.raw()['set-cookie'].map(cookie => cookieUtils.fromHeader(cookie));

      expect(res.headers.get('name1Header')).to.equal('name1HeaderValue');
      expect(res.headers.get('name2Header')).to.equal('name2HeaderValue');
      expect(cookies.find(el => el['name1Cookie'])).to.contain.deep.property('name1Cookie', 'name1CookieValue');
      expect(cookies.find(el => el['name1Cookie'])).to.contain.deep.property('name1Cookie', 'name1CookieValue');
    }));

  it('should pass-on request-data from request onto aspect', () =>
    aJsonGet('/request-data?q=123', {cookie1: 'cookie1Value'}).then(json => {
      expect(json.headers).to.contain.deep.property('user-agent');
      expect(json.cookies).to.contain.deep.property('cookie1', 'cookie1Value');
      expect(json.query).to.contain.deep.property('q', '123');
      expect(json.url).to.equal(server.getUrl('/request-data?q=123'));
      expect(json.originalUrl).to.equal('/request-data?q=123');
      expect(json.remoteAddress).to.be.string('127.0.0.1');
      expect(json.remotePort).to.be.defined;
    }));

  function aJsonGet(path, cookies) {
    return aGet(path, cookies).then(res => res.json());
  }

  function aGet(path, cookies) {
    return fetch(server.getUrl(path), {
      headers: {
        'cookie': cookieUtils.toHeader(cookies)
      }
    });
  }

  function aServer() {
    const server = testkit.server();
    const wixPatchServerResponse = require('wix-patch-server-response');
    wixPatchServerResponse.patch();

    const app = server.getApp();
    app.get('/', aspectsMiddleware.get([
      requestData => new TestAspect('name1', requestData),
      requestData => new TestAspect('name2', requestData)]),
      (req, res) => res.send(req.aspects));

    app.get('/request-data', aspectsMiddleware.get([
      requestData => new RequestDataCapturingAspect('request-capturing', requestData)]),
      (req, res) => res.send(req.aspects['request-capturing']));

    return server;
  }
});

class TestAspect extends Aspect {
  constructor(name, requestData) {
    super(name, requestData);

    this._aspect = {};
    this._aspect[name + 'Key'] = name + 'Value';

    this._res = {headers: {}, cookies: []};
    this._res.headers[name + 'Header'] = name + 'HeaderValue';
    this._res.cookies.push({key: name + 'Cookie', value: name + 'CookieValue'});
  }

  export() {
    return this._res;
  }
}

class RequestDataCapturingAspect extends Aspect {
  constructor(name, requestData) {
    super(name, requestData);
    this._aspect = requestData;
  }
}