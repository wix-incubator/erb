const emitter = require('wix-config-emitter'),
  WixConfig = require('wix-config'),
  sinon = require('sinon'),
  shelljs = require('shelljs'),
  expect = require('chai').use(require('sinon-chai')).expect,
  Logger = require('wnp-debug').Logger,
  loadConfiguration = require('../lib/load-configuration');

describe('petri sync specs configuration', () => {
  
  it('loads from configuration file', () => {
    return emitConfig('http://petri-server/url')
      .then(() =>  {
        const url = loadConfiguration({env, config, log});
        expect(url).to.be.equal('http://petri-server/url');
      });
  });

  const env = {
    APP_CONF_DIR: './target/configs',
    NODE_ENV: 'production'
  };

  const config = new WixConfig(env.APP_CONF_DIR);

  const log = sinon.createStubInstance(Logger);
  
  function emitConfig(petriUrl) {
    shelljs.rm('-rf', env.APP_CONF_DIR);
    return emitter({sourceFolders: ['./templates'], targetFolder: env.APP_CONF_DIR})
      .fn('service_url', 'com.wixpress.common.wix-petri-server', petriUrl)
      .emit();
  }
});
