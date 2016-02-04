'use strict';
const chance = require('chance')(),
  expect = require('chai').expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  env = require('./support/environment'),
  cookieUtils = require('cookie-utils'),
  req = require('./support/req');

//TODO: test rpc-client timeouts
describe('wix-bootstrap rpc', function () {
  this.timeout(60000);
  env.start();

  let opts;
  beforeEach(() => opts = wixRequestBuilder.aWixRequest('').withBiCookies().withSession());

  it('should provide pre-configured rpc client', () => {
    const uuid = chance.guid();
    return aGet(`/rpc/hello/${uuid}`).then(res =>
      expect(res.json()).to.deep.equal({
        id: uuid,
        name: 'John',
        email: 'doe@wix.com'
      }));
  });

  // TODO: this is ad-hoc test and should be rewritten as unit test instead when
  // it's possible.
  it('should allow creating rpc clients in Donatas style', () => {
    const uuid = chance.guid();
    return aGet(`/rpc/hello-detached/${uuid}`)
      .then(res => expect(res.json()).to.deep.equal({
        id: uuid,
        name: 'John',
        email: 'doe@wix.com'
      }));
  });

  

  it('should call petri on RPC for empty cookie', () =>
      aGet('/rpc/petri').then(res =>
        expect(res.json()).to.deep.equal({aSpec: true}))
  );

  it('should get request context from remote rpc', () => {
    const reqId = chance.guid();
    const userAgent = 'kfir-user-agent';
    const url = '/rpc/req-context';
    const ip = '1.1.1.1';
    const geo = 'BR';
    const language = 'pt';
    const req = wixRequestBuilder.aWixRequest('').get(url)
      .withRequestId(reqId)
      .withUserAgent(userAgent)
      .withIp(ip)
      .withGeoHeader(geo)
      .withLanguage(language);

    return aGet('/rpc/req-context', req.options()).then(res => {
      const webContext = res.json();
      expect(webContext.requestId).to.equal(reqId);
      expect(webContext.userAgent).to.equal(userAgent);
      expect(webContext.remoteIp).to.equal(ip);
      expect(webContext.url).to.contain(url);
      expect(webContext.geoData.origCountryCode).to.equal(geo);
      expect(webContext.locale).to.equal(language);
    });
  });

  it('should delegate wix session and sent through rpc', () =>
      aGet('/rpc/wix-session').then(res =>
        expect(res.text).to.equal(opts.wixSession.sessionJson.userGuid))
  );

  it('seen by', () =>
      aGet('/rpc/wix-session').then(res =>
          expect(res.headers._headers['x-seen-by']).to.deep.equal(['seen-by-Villus,rpc-jvm17.wixpress.co.il'])
      )
  );

  it('should return abTest cookies for new user without cookies', () =>
      aGet('/rpc/petri').then(res => {
          expect(cookieUtils.fromHeader(res.headers._headers['set-cookie'][0])).to.have.property('_wixAB3', '1#1')
        }
      )
  );

  it.only('should return abTest cookies with original toss for new user without cookies', () =>
      aGet('/rpc/petri', {headers : { cookie: '_wixAB3=1#1' }}).then(res => {
          expect(cookieUtils.fromHeader(res.headers._headers['set-cookie'][0])).to.have.property('_wixAB3', '1#1')
        }
      )
  );


  it('should respect preconfigured timeout (in index.js)', () =>
      req.get(env.appUrl('/rpc/timeout/1000')).then(res => {
        expect(res.status).to.equal(500);
        expect(res.json()).to.deep.equal({
          name: "Error",
          message: "network timeout at: http://localhost:3310/NonFunctional"
        });
      })
  );


  function aGet(path, options) {
    return req.get(env.appUrl(path), options || opts.options()).then(res => {
      expect(res.status).to.equal(200);
      return res;
    });
  }
});