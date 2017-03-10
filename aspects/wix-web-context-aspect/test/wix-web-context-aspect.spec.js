const expect = require('chai').expect,
  build = require('..').builder('some-seen-by');

describe('wix web context aspect', () => {

  it('should be safe to build aspect from request data with no cookies/headers', () => {
    const aspect = build({
      url: 'http://fanta.wixpress.com/woop',
      remotePort: 1233,
      remoteAddress: '127.0.2.2'
    });

    expect(aspect.name).to.equal('web-context');
  });

  it('should return debug "undefined" as default', () => {
    const aspect = build({
      url: 'http://fanta.wixpress.com/woop',
      remotePort: 1233,
      remoteAddress: '127.0.2.2'
    });
    expect(aspect.debug).to.be.undefined;
  });

  it('should build aspect', () => {
    const aspect = build({
      remotePort: 1233,
      remoteAddress: '127.0.2.2',
      originalUrl: 'http://localhost:1233',
      headers: {
        'x-wix-request-id': '123',
        'x-wix-forwarded-url': 'http://fanta.wixpress.com/woop',
        'user-agent': 'Mozilla 12',
        'x-wix-country-code': 'BR'
      },
      cookies: {
        wixLanguage: 'ja'
      },
      query: {
        debug: 'true'
      }
    });

    expect(aspect.name).to.equal('web-context');
    expect(aspect.requestId).to.equal('123');
    expect(aspect.url).to.equal('http://fanta.wixpress.com/woop');
    expect(aspect.userAgent).to.equal('Mozilla 12');
    expect(aspect.localUrl).to.equal('http://localhost:1233');
    expect(aspect.userPort).to.equal(1233);
    expect(aspect.userIp).to.equal('127.0.2.2');
    expect(aspect.cookieDomain).to.equal('.fanta.wixpress.com');
    expect(aspect.language).to.equal('ja');
    expect(aspect.debug).to.equal(true);
    expect(aspect.geo).to.deep.equal({
      '2lettersCountryCode': 'BR',
      '3lettersCountryCode': 'BRA'
    });
    expect(aspect.seenBy).to.deep.equal(['some-seen-by']);
  });

  it('should export x-seen-by headers', () => {
    const aspect = build({
      url: 'http://fanta.wixpress.com/woop',
      remotePort: 1233,
      remoteAddress: '127.0.2.2'
    });

    expect(aspect.export()).to.deep.equal({
      headers: {
        'X-Seen-By': 'some-seen-by'
      }
    });
  });

  it('should not allow to modify aspect data', () => {
    const aspect = build({
      remotePort: 1233,
      remoteAddress: '127.0.2.2',
      originalUrl: 'http://localhost:1233',
      headers: {
        'x-wix-request-id': '123',
        'x-wix-forwarded-url': 'http://fanta.wixpress.com/woop',
        'user-agent': 'Mozilla 12',
        'x-wix-country-code': 'BR'
      },
      cookies: {
        wixLanguage: 'jp'
      }
    });

    aspect.geo['2lettersCountryCode'] = 'someValue';
    expect(aspect.geo['2lettersCountryCode']).to.not.equal('someValue');
    expect(() => aspect.seenBy.push('qwe')).to.throw();
  });

  it('should import x-seen-by headers', () => {
    const aspect = build({
      url: 'http://fanta.wixpress.com/woop',
      remotePort: 1233,
      remoteAddress: '127.0.2.2'
    });

    expect(aspect.seenBy).to.deep.equal(['some-seen-by']);

    aspect.import({
      headers: {
        'x-seen-by': ['another-seen-by', 'yet-another-seen-by']
      }
    });

    expect(aspect.seenBy).to.deep.equal(['some-seen-by', 'another-seen-by', 'yet-another-seen-by']);
  });

  it('should not alter seenBy when no headers present during import', () => {
    const aspect = build({
      url: 'http://fanta.wixpress.com/woop',
      remotePort: 1233,
      remoteAddress: '127.0.2.2'
    });

    aspect.import({});

    expect(aspect.seenBy).to.deep.equal(['some-seen-by']);
  });
});
