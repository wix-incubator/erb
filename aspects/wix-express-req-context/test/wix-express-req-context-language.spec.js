'use strict';
const chai = require('chai'),
  isEqualTo = require('./drivers/request-context-driver').isEqualTo,
  aServer = require('./drivers/request-context-driver').aServer,
  assertThat = require('./drivers/request-context-driver').assertThat;

require('./matchers')(chai);

describe('language context', function () {
  const server = aServer();

  server.beforeAndAfterEach();

  it('should be empty language because there are no headers', assertThat('language',
    isEqualTo(''), {
      headers: {}
    }, server
  ));

  it('should be en because of accept-language header', assertThat('language',
    isEqualTo('en'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8,he;q=0.6'
      }
    }, server
  ));

  it('should be en because empty accept language header', assertThat('language',
    isEqualTo(''), {
      headers: {
        'accept-language': ''
      }
    }, server
  ));

  it('should be he because of cookie of wix language', assertThat('language',
    isEqualTo('he'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he'
      }
    }, server
  ));

  it('should be pt because language in wix header X-Wix-Base-Uri', assertThat('language',
    isEqualTo('pt'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he',
        'x-wix-base-uri': 'http://pt.wix.com/xxx'
      }
    }, server
  ));

  it('should be he because wix header X-Wix-Base-Uri is invalid url', assertThat('language',
    isEqualTo('he'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he',
        'x-wix-base-uri': 'invalid url'
      }
    }, server
  ));

  it('should be he because wix header X-Wix-Base-Uri is wwww', assertThat('language',
    isEqualTo('he'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he',
        'x-wix-base-uri': 'www.kfir.com'
      }
    }, server
  ));

  it('should be fr because language in domain', assertThat('language',
    isEqualTo('fr'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he',
        'x-wix-base-uri': 'http://pt.wix.com/xxx',
        'host': 'fr.wix.com'
      }
    }, server
  ));

  it('should be pt because language in domain is not a language', assertThat('language',
    isEqualTo('pt'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he',
        'x-wix-base-uri': 'http://pt.wix.com/xxx',
        'host': 'www.wix.com'
      }
    }, server
  ));

  it('should be jp because language in rpc header', assertThat('language',
    isEqualTo('jp'), {
      headers: {
        'accept-language': 'en-US,en;q=0.8',
        'cookie': 'wixLanguage=he',
        'x-wix-base-uri': 'http://pt.wix.com/xxx',
        'host': 'fr.wix.com',
        'x-wix-language': 'jp'

      }
    }, server
  ));


});