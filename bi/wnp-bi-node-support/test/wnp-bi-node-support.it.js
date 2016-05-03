'use strict';
const _ = require('lodash'),
  expect = require('chai').expect,
  biLogger = require('wix-bi-logger-client'),
  adapter = require('../'),
  testkit = require('wix-http-testkit'),
  reqOptions = require('wix-req-options'),
  fetch = require('node-fetch'),
  aspectMiddleware = require('wix-express-aspects'),
  biAspect = require('wix-bi-aspect'),
  webAspect = require('wix-web-context-aspect'),
  sessionAspect = require('wix-session-aspect'),
  cryptoTestkit = require('wix-session-crypto-testkit'),
  logFileTestkit = require('wix-log-file-testkit'),
  shelljs = require('shelljs');

describe('bi logger node adapter', () => {
  const logDir = './target/logs';

  before(() => {
    shelljs.rm('-rf', logDir);
    shelljs.mkdir('-p', logDir);
  });

  const session = cryptoTestkit.aValidBundle();
  const server = aServer().beforeAndAfter();
  const logFiles = logFileTestkit.interceptor(logDir + '/wix.bi.*.log').beforeAndAfter();

  it('should log a valid bi event without bi-specific headers', () => {
    return fetch(server.getUrl('/event-id-1'))
      .then(res => res.json())
      .then(resJson =>
        expect(biEvents().pop()).to.deep.equal(biEventFrom(resJson, {
          MESSAGE: {
            src: 5,
            evtId: 'event-id-1'
          }
        }))
      );
  });

  it('should log a valid bi event for an unauthenticated request', () => {
    return fetch(server.getUrl('/event-id-2'), reqOptions.builder().withBi().options())
      .then(res => res.json())
      .then(resJson =>
        expect(biEvents().pop()).to.deep.equal(biEventFrom(resJson, {
          MESSAGE: {
            src: 5,
            evtId: 'event-id-2'
          },
          GLOBAL: {
            client_id: resJson['bi'].clientId,
            gsi: resJson['bi'].globalSessionId,
            lng: resJson['web-context'].language
          }
        }))
      );
  });

  it('should log a valid bi event for an authenticated request', () => {
    return fetch(server.getUrl('/event-id-3'), reqOptions.builder().withBi().withSession().options())
      .then(res => res.json())
      .then(resJson =>
        expect(biEvents().pop()).to.deep.equal(biEventFrom(resJson, {
          MESSAGE: {
            src: 5,
            evtId: 'event-id-3'
          },
          GLOBAL: {
            client_id: resJson['bi'].clientId,
            gsi: resJson['bi'].globalSessionId,
            lng: resJson['web-context'].language,
            uuid: resJson['session'].userGuid
          }
        }))
      );
  });

  it('should append a newline to a produced log entry', () => {
    return fetch(server.getUrl('/event-id-1'))
      .then(res => res.json())
      .then(resJson => {
        const entries = logFiles.captured.split('\n');
        expect(entries.pop()).to.equal('');
        expect(JSON.parse(entries.pop())).to.deep.equal(biEventFrom(resJson, {
          MESSAGE: {
            src: 5,
            evtId: 'event-id-1'
          }
        }))
      });
  });


  function aServer() {
    const server = testkit.server();

    const biLoggerFactory = adapter.addTo(biLogger.factory(), {
      logDir: logDir,
      filePrefix: 'wix.bi',
      artifactName: 'artifact-name',
      date: () => new Date(1459322536946)
    });
    biLoggerFactory.setDefaults({src: 5});

    server.getApp()
      .use(aspectMiddleware.get([biAspect.builder(), webAspect.builder('seen-by'), sessionAspect.builder(session.mainKey)]))
      .get('/:id', (req, res, next) => {
        const bi = biLoggerFactory.logger(req.aspects);

        bi.log({evtId: req.params.id})
          .then(() => res.send(req.aspects))
          .catch(next);
      });

    return server;
  }

  function biEventFrom(aspects, part) {
    return _.merge({}, {
      GLOBAL: {
        artifact_name: 'artifact-name',
        date: '2016-03-30T07:22:16.946Z',
        user_agent: aspects['web-context'].userAgent,
        ip: aspects['web-context'].userIp,
        url: aspects['web-context'].localUrl,
        app_url: aspects['web-context'].url,
        request_id: aspects['web-context'].requestId
      }
    }, part);
  }

  function biEvents() {
    return logFiles.captured
      .split('\n')
      .filter(el => el !== '')
      .map(evt => {
        console.log(evt);
        return JSON.parse(evt);
      });
  }
});