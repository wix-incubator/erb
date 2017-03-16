const fetch = require('node-fetch'),
  {expect} = require('chai').use(require('sinon-chai')),
  sinon = require('sinon'),
  testkit = require('wix-http-testkit'),
  cookieUtils = require('cookie-utils'),
  aspectsMiddleware = require('..'),
  Aspect = require('wix-aspects').Aspect,
  {Logger} = require('wnp-debug');

describe('aspects middleware it', () => {
  const log = sinon.createStubInstance(Logger);
  const server = aServer(log).beforeAndAfter();

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
    aJsonGet('/request-data?q=123', {cookies: {cookie1: 'cookie1Value'}}).then(json => {
      expect(json.headers).to.contain.deep.property('user-agent');
      expect(json.cookies).to.contain.deep.property('cookie1', 'cookie1Value');
      expect(json.query).to.contain.deep.property('q', '123');
      expect(json.url).to.equal(server.getUrl('/request-data?q=123'));
      expect(json.originalUrl).to.equal('/request-data?q=123');
      expect(json.remoteAddress).to.be.string('127.0.0.1');
      expect(json.remotePort).to.be.defined;
    }));

  it('should inject remoteAddress from x-forwarded-from header', () =>
    aJsonGet('/request-data?q=123', {headers: {'x-forwarded-for': '171.12.12.12, 171.12.12.13'}}).then(json => {
      expect(json.remoteAddress).to.be.string('171.12.12.12');
    }));

  it('should not fail request on aspect store build failure, but build empty store and log error instead', () => {
    return aGet('/failing').then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.deep.equal({});
      expect(log.error).to.have.been.calledWith(sinon
        .match('Failed building aspect store with data')
        .and('/failing')
        .and('Error: Failing aspect')
        .and('at buildStore'));
    });
  });

  function aJsonGet(path, opts) {
    return aGet(path, opts).then(res => res.json());
  }

  function aGet(path, opts) {
    const options = {headers: {}};
    if (opts && opts.headers) {
      options.headers = opts.headers;
    }
    if (opts && opts.cookies) {
      options.headers['cookie'] = cookieUtils.toHeader(opts.cookies);
    }

    return fetch(server.getUrl(path), options);
  }

  function aServer(log) {
    const server = testkit.server();
    const wixPatchServerResponse = require('wix-patch-server-response');
    wixPatchServerResponse.patch();

    const app = server.getApp();
    app.set('trust proxy', true);
    app.get('/', aspectsMiddleware.get(
      [
        requestData => new TestAspect('name1', requestData),
        requestData => new TestAspect('name2', requestData)
      ]
    ), (req, res) => res.json(req.aspects));
    app.get('/failing', aspectsMiddleware.get(
      [
        () => {
          throw new Error('Failing aspect')
        },
      ], log
    ), (req, res) => res.json(req.aspects));

    app.get('/request-data', aspectsMiddleware.get(
      [
        requestData => new RequestDataCapturingAspect('request-capturing', requestData)
      ]
    ), (req, res) => res.json(req.aspects['request-capturing']));

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
