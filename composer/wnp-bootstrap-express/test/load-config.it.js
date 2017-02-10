const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  testkit = require('./testkit'),
  WixConfig = require('wix-config'),
  sessionCrypto = require('wix-session-crypto'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs');

describe('wnp bootstrap composer', () => {
  const env = {
    APP_CONF_DIR: './target/configs',
    NODE_ENV: 'production',
    WIX_BOOT_SESSION_KEY: sessionCrypto.v1.devKey,
    WIX_BOOT_SESSION2_KEY: sessionCrypto.v2.devKey
  };
  const {app} = testkit(app => app.get('/', (req, res) => res.end()),
    {env, config: new WixConfig(env.APP_CONF_DIR)});

  after(() => app.stop());

  it('should load seenBy from config file in production mode', () => {
    return emitConfiguration(env, 'by-test')
      .then(() => app.start())
      .then(() => http.okGet(app.getUrl('/')))
      .then(res => expect(res.headers.get('x-seen-by')).to.equal('by-test'));
  });

  function emitConfiguration(env, seenBy) {
    shelljs.mkdir('-p', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .val('x_seen_by', seenBy)
      .emit();
  }
});


