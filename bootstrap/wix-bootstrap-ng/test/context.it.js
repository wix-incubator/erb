'use strict';
const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  fetch = require('node-fetch'),
  sessionCryptoTestkit = require('wix-session-crypto-testkit');

describe('wnp bootstrap context', function () {
  this.timeout(10000);

  const app = testkit.app('context', {
    APP_CONF_DIR: './test/apps/context/configs'
  }).beforeAndAfter();

  it('should provided preconfigured config(wix-config) instance within context', () => {
    return fetch(app.appUrl('/config/test-config')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => expect(json).to.deep.equal({aKey: 'aValue'}));
  });

  it('should provided preconfigured session (wix-session-crypto) instance within context', () => {
    const bundle = sessionCryptoTestkit.aValidBundle();

    return fetch(app.appUrl(`/session?token=${bundle.token}`)).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => expect(json).to.deep.equal(bundle.sessionJson));
  });

  it('should provided preconfigured newrelic instance within context', () => {
    return fetch(app.appUrl('/newrelic')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => expect(json).to.deep.equal({
      reqTimingHeaders: '',
      appTimingHeaders: ''
    }));

  });
});