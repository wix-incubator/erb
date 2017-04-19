const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  testkit = require('./testkit'),
  WixConfig = require('wix-config'),
  {devKey} = require('wix-session-crypto'),
  emitter = require('wix-config-emitter'),
  shelljs = require('shelljs');

describe('wnp bootstrap composer', () => {
  const env = {
    APP_CONF_DIR: './target/configs',
    NODE_ENV: 'production',
    WIX_BOOT_SESSION2_KEY: devKey
  };
  let app;
  afterEach(() => app.stop());

  it('should load seenBy from config file in production mode', () => {
    return emitConfiguration(env, 'by-test')
      .then(() => startApp())
      .then(() => http.okGet(app.getUrl('/')))
      .then(res => expect(res.headers.get('x-seen-by')).to.equal('by-test'));
  });

  it('should load wix-public static url', () => {
    const wixPublicStatics = '//static.url/wix-public';
    return emitConfiguration(env, 'by-test', 'http://static.url/wix-public')
      .then(() => startApp())
      .then(() => http(app.getUrl('/erroneous-page')))
      .then(res => res.text())
      .then(body => expect(body).to.contain(wixPublicStatics));
  });

  function emitConfiguration(env, seenBy, publicStaticsUrl) {
    shelljs.mkdir('-p', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .val('x_seen_by', seenBy)
      .fn('static_url', 'com.wixpress.static.wix-public', publicStaticsUrl)
      .emit();
  }

  function startApp() {
    app = testkit(expressApp => {
      return expressApp
        .get('/', (req, res) => res.end())
        .get('/erroneous-page', () => {throw new Error('woops!')})
    }, {env, config: new WixConfig(env.APP_CONF_DIR)}).app;
    return app.start();
  }
});
