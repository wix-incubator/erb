'use strict';
const expect = require('chai').expect,
  testkit = require('wnp-bootstrap-composer-testkit'),
  emitter = require('wix-config-emitter'),
  statsDTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually'),
  http = require('wnp-http-test-client'),
  sessionTestkit = require('wix-session-crypto-testkit');

describe('wix bootstrap statsd', function () {
  this.timeout(20000);

  describe('statsd publisher', () => {

    before(() =>
      emitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
        .val('statsd_host', 'localhost')
        .emit(data => {
          const json = JSON.parse(data);
          json.statsd.interval = 2000;
          return JSON.stringify(json);
        })
    );

    const statsd = statsDTestkit.server().beforeAndAfterEach();
    const app = testkit
      .server('./test/app', {
        env: {
          APP_CONF_DIR: './target/configs',
          NODE_ENV: 'production',
          'WIX_BOOT_SESSION_KEY': sessionTestkit.v1.aValidBundle().mainKey,
          'WIX_BOOT_SESSION2_KEY': sessionTestkit.v2.aValidBundle().publicKey
        }
      })
      .beforeAndAfter();

    it('should load configuration from config file and add statsd adapter to metrics', () => {
      expect(app.output).to.be.string('production mode detected');
      return assertPublishesToStatsD(app, statsd);
    });

    it('should not be added to context', () => {
      return assertNotBoundToContext(app);
    });

    it('should send a statsd configuration message to cluster master', () => {
      expect(app.output).to.be.string('received message:  {"origin":"wix-cluster","key":"statsd","value":{"host":"localhost","interval":2000}}');
    });
  });

  describe('shutdown hook', () => {
    const statsd = statsDTestkit.server().beforeAndAfterEach();
    const app = testkit.server('./test/app', {
      env: {
        WIX_BOOTSTRAP_STATSD_HOST: 'localhost',
        WIX_BOOTSTRAP_STATSD_INTERVAL: 100
      }
    });

    before(() => app.start());

    it('should stop statsd publisher on shutdown', done => {
      assertPublishesToStatsD(app, statsd)
        .then(() => http.okPost(app.getManagementUrl('/stop')))
        .then(() => eventually(() => expect(app.output).to.be.string('StatsDAdapter closed')))
        .then(() => {
          const collectedEvents = statsd.events();
          setTimeout(() => {
            expect(statsd.events()).to.equal(collectedEvents);
            done();
          }, 1000);
        });
    });
  });

  function assertPublishesToStatsD(app, statsd) {
    return http.okGet(app.getUrl('/meter?key=aKey'))
      .then(() => eventually(() => expect(statsd.events()).to.not.be.empty));
  }

  function assertNotBoundToContext(app) {
    return http.okGet(app.getUrl('/context-keys'))
      .then(res => {
        expect(res.json().filter(el => el === 'config')).to.deep.equal(['config']);
        expect(res.json().filter(el => el === 'statsd')).to.deep.equal([]);
      });
  }

});
