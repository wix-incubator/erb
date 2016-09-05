'use strict';
const headersBuilder = require('..'),
  chai = require('chai'),
  expect = chai.expect,
  cookieUtils = require('cookie-utils'),
  uuid = require('uuid-support');

chai.use(require('./matchers'));


describe('wix http headers', () => {

  it('should not add default headers by default', () => {
    const headers = headersBuilder().headers();
    expect(headers).to.deep.equal({});
  });

  it('should add default headers with provided values', () => {
    const headers = headersBuilder().withWixDefaults({ 'language': 'lt', 'country-code': 'LT' }).headers();

    expect(headers).to.be.likeObject({
      'x-wix-default_port': '2222',
      'x-wix-ip': '1.1.1.1',
      'x-wix-url': 'http://www.kfir.com',
      'x-wix-language': 'lt',
      'x-wix-country-code': 'LT'
    });
    expect(headers).to.contain.deep.property('x-wix-request-id').that.is.validGuid();
  });

  it('should not add cookie header by default', () => {
    const headers = headersBuilder().headers();
    expect(headers).to.not.contain.property('cookie');
  });

  it('should add bi-related cookies with defaults', () => {
    const builder = headersBuilder().withBi();
    const headers = builder.headers();
    expect(cookieUtils.fromHeader(headers.cookie)).to.deep.equal(builder.cookies());

    expect(builder.cookies()).to.contain.deep.property('_wixUIDX').that.is.validGuid();
    expect(builder.cookies()).to.contain.deep.property('_wixCIDX').that.is.validGuid();
    expect(builder.cookies()).to.contain.deep.property('_wix_browser_sess').that.is.validGuid();
    expect(builder.cookies()).to.contain.deep.property('userType').that.is.validGuid();
  });

  describe('petri', () => {

    it('should add petri override cookie', () => {
      const headers = headersBuilder().withPetriOverride('aSpec', 'aValue').headers();
      expect(headers.cookie).to.equal('petri_ovr=aSpec%23aValue');
    });

    it('should add multiple petri override cookie', () => {
      const headers = headersBuilder()
        .withPetriOverride('aSpec', 'aValue')
        .withPetriOverride('aSpec2', 'aValue2')
        .headers();

      expect(headers.cookie).to.equal('petri_ovr=aSpec%23aValue%7CaSpec2%23aValue2');
    });
  });

  describe('wix session', () => {

    it('should add session cookie with defaults', () => {
      const headers = headersBuilder().withSession().headers();
      expect(headers.cookie).to.match(/^wixSession2=.+/);
    });

    it('should add session cookie with custom properties', () => {
      const userId = uuid.generate();
      const userName = 'some-username';
      const isWixStaff = true;
      const builder = headersBuilder().withSession({ userGuid: userId, userName: userName, isWixStaff: isWixStaff });

      expect(builder.session()).to.be.likeObject({
        session: {
          userGuid: userId,
          userName: 'some-username',
          wixStaff: true
        }
      });
    });
  });

  describe('header', () => {
    it('should allow to add any header', () => {
      const headers = headersBuilder().withHeader('headerName', 'headerValue').headers();
      expect(headers).to.contain.property('headerName', 'headerValue');
    })
  });

  describe('cookie', () => {
    it('should allow to add any cookie', () => {
      const headers = headersBuilder().withCookie('cookieName', 'cookieValue').headers();
      expect(headers).to.contain.property('cookie', 'cookieName=cookieValue');
    })
  });
});

describe('wix http headers default', () => {

  it('should contain default headers by default', () => {
    const headers = require('..').defaults().headers();

    expect(headers).to.be.likeObject({
      'x-wix-default_port': '2222',
      'x-wix-ip': '1.1.1.1',
      'x-wix-url': 'http://www.kfir.com',
      'x-wix-language': 'en',
      'x-wix-country-code': 'US'
    });
    expect(headers).to.contain.deep.property('x-wix-request-id').that.is.validGuid();
  })
});
