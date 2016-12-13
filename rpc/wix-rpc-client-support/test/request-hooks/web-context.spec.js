'use strict';
const expect = require('chai').expect,
  enrich = require('../../lib/request-hooks/web-context').get();

describe('web context header hook', () => {

  it('should add all headers', () => {
    var headers = {};
    var ctx = {
      'web-context': {
        requestId: '1',
        userAgent: 'someUserAgent',
        url: 'http://www.kfir.com',
        userPort: '2222',
        userIp: '1.1.1.1',
        language: 'pt',
        geo: {
          '2lettersCountryCode': 'BR'
        }
      }
    };

    enrich(headers, {}, ctx);
    expect(headers).to.deep.equal({
      'X-Wix-Request-Id': '1',
      'X-WIX-DEFAULT_PORT': '2222',
      'user-agent': 'someUserAgent',
      'X-WIX-IP': '1.1.1.1',
      'X-Wix-Forwarded-Url': 'http://www.kfir.com',
      'X-Wix-Language': 'pt',
      'X-Wix-Country-Code': 'BR'
    });
  });

  it('should be noop given web context aspect does not exist', () => {
    var headers = {};
    var ctx = {};

    enrich(headers, {}, ctx);
    expect(headers).to.deep.equal({});
  });

  it('should be noop for empty web context aspect', () => {
    var headers = {};
    var ctx = {'web-context': {}};

    enrich(headers, {}, ctx);
    expect(headers).to.deep.equal({});
  });

});
