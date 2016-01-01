'use strict';
const chai = require('chai'),
  expect = chai.expect,
  wixRequestContextEnricher = require('../lib/enrichers/req-context-enricher');

describe('wix request context enricher', () => {

  var headers = {};
  var ctx = {
    requestId: '1',
    userAgent: 'someUserAgent',
    url: 'http://www.kfir.com',
    userPort: '2222',
    userIp: '1.1.1.1'
  };

  it('should add all headers', () => {
    wixRequestContextEnricher.get(aRequestContextWith(ctx))(headers);
    expect(headers).to.have.property('X-Wix-Request-Id', ctx.requestId);
    expect(headers).to.have.property('X-WIX-DEFAULT_PORT', ctx.userPort);
    expect(headers).to.have.property('user-agent', ctx.userAgent);
    expect(headers).to.have.property('X-WIX-IP', ctx.userIp);
    expect(headers).to.have.property('X-WIX-URL', ctx.url);
  });


  var aRequestContextWith = (toReturn) => {
    return {
      get: ()=> {
        return toReturn;
      }
    };
  };
});
