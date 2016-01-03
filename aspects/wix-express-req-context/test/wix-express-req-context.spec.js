'use strict';
const uuid = require('uuid-support'),
  chai = require('chai'),
  isValidGuid = require('./drivers/request-context-driver').isValidGuid,
  isEqualTo = require('./drivers/request-context-driver').isEqualTo,
  aServer = require('./drivers/request-context-driver').aServer,
  contain = require('./drivers/request-context-driver').contain,
  assertThat = require('./drivers/request-context-driver').assertThat;

require('./matchers')(chai);

describe('req context', function () {
  const server = aServer();

  server.beforeAndAfterEach();

  describe('request id', () => {
    const requestId = uuid.generate();

    it('server generates request id', assertThat('requestId',
      isValidGuid(), {
        headers: {
          'X-Wix-Request-Id': requestId
        }
      }, server
    ));

    it('send request id as header', assertThat('requestId',
      isEqualTo(requestId), {
        headers: {
          'X-Wix-Request-Id': requestId
        }
      }, server
    ));

    it('send request id as parameter', assertThat('requestId',
      isEqualTo(requestId), {
        qs: {
          'request_id': requestId
        }
      }, server
    ));

  });

  describe('local url', () => {
    it('hold value of req.originalUrl (includes query string)', assertThat('localUrl',
      isEqualTo('/localUrl?param=value'), {
        qs: {
          'param': 'value'
        }
      }, server
    ));
  });

  describe('url', () => {
    it('defaults to local url', assertThat('url',
      contain('/url?param=value'), {
        qs: {
          'param': 'value'
        }
      } , server
    ));

    it('holds "X-WIX-URL" header value', assertThat('url',
      isEqualTo('/an-url-from-header'), {
        headers: {
          'X-WIX-URL': '/an-url-from-header'
        }
      }, server
    ));
  });

  describe('geo', () => {
    it('defaults to local url', assertThat('geo',
      isEqualTo('{"2lettersCountryCode":"BR","3lettersCountryCode":"BRA"}'), {
        headers: {
          'x-wix-country-code': 'BR'
        }
      }, server
    ));

  });

  // TDOD - WTF the value starts with???
  describe.skip('ip', () => {
    it('holds an ip of current machine', assertThat('userIp',
      isEqualTo('127.0.0.1'), {}, server
    ));
  });

  describe('port', () => {
    it('holds an ip of current machine', assertThat('userPort',
      isEqualTo('2222'), {
        headers: {
          'X-WIX-DEFAULT-PORT': 2222
        }
      }, server
    ));
  });

  describe('User Agent', () => {
    it('holds "user-agent" header value', assertThat('userAgent',
      isEqualTo('agent-from-header'), {
        headers: {
          'user-agent': 'agent-from-header'
        }
      }, server
    ));
  });
});