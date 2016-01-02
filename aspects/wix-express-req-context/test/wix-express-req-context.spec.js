'use strict';
const uuid = require('uuid-support'),
  request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  wixExpressDomain = require('wix-express-domain'),
  wixExpressReqContext = require('..'),
  testkit = require('wix-http-testkit'),
  reqContext = require('wix-req-context');

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
      }
    ));

    it('send request id as header', assertThat('requestId',
      isEqualTo(requestId), {
        headers: {
          'X-Wix-Request-Id': requestId
        }
      }
    ));

    it('send request id as parameter', assertThat('requestId',
      isEqualTo(requestId), {
        qs: {
          'request_id': requestId
        }
      }
    ));

  });

  describe('local url', () => {
    it('hold value of req.originalUrl (includes query string)', assertThat('localUrl',
      isEqualTo('/localUrl?param=value'), {
        qs: {
          'param': 'value'
        }
      }
    ));
  });

  describe('url', () => {
    it('defaults to local url', assertThat('url',
      contain('/url?param=value'), {
        qs: {
          'param': 'value'
        }
      }
    ));

    it('holds "X-WIX-URL" header value', assertThat('url',
      isEqualTo('/an-url-from-header'), {
        headers: {
          'X-WIX-URL': '/an-url-from-header'
        }
      }
    ));
  });

  describe('geo', () => {
    it('defaults to local url', assertThat('geo',
      isEqualTo('{"2lettersCountryCode":"BR","3lettersCountryCode":"BRA"}'), {
        headers: {
          'x-wix-country-code': 'BR'
        }
      }
    ));

  });

  // TDOD - WTF the value starts with???
  describe.skip('ip', () => {
    it('holds an ip of current machine', assertThat('userIp',
      isEqualTo('127.0.0.1'), {}
    ));
  });

  describe('port', () => {
    it('holds an ip of current machine', assertThat('userPort',
      isEqualTo('2222'), {
        headers: {
          'X-WIX-DEFAULT-PORT': 2222
        }
      }
    ));
  });

  describe('User Agent', () => {
    it('holds "user-agent" header value', assertThat('userAgent',
      isEqualTo('agent-from-header'), {
        headers: {
          'user-agent': 'agent-from-header'
        }
      }
    ));
  });

  function assertThat(property, matcher, onRequestWith) {
    return done => request.get(server.getUrl(property), onRequestWith, (error, response, body) => {
      matcher(body);
      done();
    });
  }

  function isEqualTo(expected) {
    return body => expect(body).to.equal(expected);
  }

  function contain(expected) {
    return body => expect(body).to.contain(expected);
  }

  function isValidGuid() {
    return body => expect(body).to.beValidGuid();
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use(wixExpressDomain);
    app.use(wixExpressReqContext);
    app.get('/:reqContextPropertyName', (req, res) =>
        res.send(reqContext.get()[req.params.reqContextPropertyName])
    );

    return server;
  }
});